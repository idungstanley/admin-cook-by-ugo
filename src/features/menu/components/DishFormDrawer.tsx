import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/fields'
import { ImageField } from '@/components/ui/ImageField'
import { Drawer, OverlayBody, OverlayFooter, OverlayHeader } from '@/components/ui/Overlay'
import { ALLERGENS, DISH_BADGES } from '@/constants/menu'
import { penceToPounds, poundsToPence } from '@/lib/format'
import {
  useCategories,
  useCreateDish,
  useDeleteDish,
  useOptionGroups,
  useUpdateDish,
} from '@/services/menu/menu.queries'
import type { Dish, DishBadge } from '@/types'

const dishSchema = z.object({
  name: z.string().trim().min(2, 'Enter a dish name'),
  categoryId: z.string().min(1, 'Choose a category'),
  description: z.string().trim().min(5, 'Add a short description'),
  price: z.number('Enter a price').positive('Enter a price'),
  kcal: z.number('Enter the calories').int().min(0),
  image: z.string().min(1, 'Choose an image'),
  badges: z.array(z.string()),
  allergens: z.array(z.string()),
  optionGroupIds: z.array(z.string()),
})

type DishValues = z.infer<typeof dishSchema>

interface DishFormProps {
  dish: Dish | null
  onClose: () => void
}

const DishForm = ({ dish, onClose }: DishFormProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { data: categories } = useCategories()
  const { data: optionGroups } = useOptionGroups()
  const createDish = useCreateDish()
  const updateDish = useUpdateDish()
  const deleteDish = useDeleteDish()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DishValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: dish
      ? { ...dish, price: penceToPounds(dish.price) }
      : {
          name: '',
          categoryId: '',
          description: '',
          image: '',
          badges: [],
          allergens: [],
          optionGroupIds: [],
        },
  })
  const image = useWatch({ control, name: 'image' })

  const submit = ({ price, badges, ...values }: DishValues) => {
    const input = { ...values, price: poundsToPence(price), badges: badges as DishBadge[] }
    if (dish) updateDish.mutate({ id: dish.id, input }, { onSuccess: onClose })
    else createDish.mutate(input, { onSuccess: onClose })
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex h-full flex-col">
      <OverlayHeader title={dish ? 'Edit dish' : 'Add dish'} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <ImageField
          label="Photo"
          value={image}
          onChange={(url) => setValue('image', url, { shouldValidate: true })}
        />
        {errors.image && (
          <p role="alert" className="text-xs font-semibold text-jollof-dark">
            {errors.image.message}
          </p>
        )}
        <TextField label="Name" error={errors.name?.message} {...register('name')} />
        <SelectField
          label="Category"
          error={errors.categoryId?.message}
          {...register('categoryId')}
        >
          <option value="">Choose a category</option>
          {categories?.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </SelectField>
        <TextAreaField
          label="Description"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Price (£)"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <TextField
            label="Calories (kcal)"
            type="number"
            min="0"
            error={errors.kcal?.message}
            {...register('kcal', { valueAsNumber: true })}
          />
        </div>

        <fieldset>
          <legend className="mb-1 text-[13px] font-semibold">Badges</legend>
          <div className="flex gap-5">
            {DISH_BADGES.map((badge) => (
              <CheckboxField key={badge} label={badge} value={badge} {...register('badges')} />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-[13px] font-semibold">Options on this dish</legend>
          {optionGroups?.map(({ id, title }) => (
            <CheckboxField key={id} label={title} value={id} {...register('optionGroupIds')} />
          ))}
        </fieldset>

        <fieldset>
          <legend className="text-[13px] font-semibold">Allergens</legend>
          <p className="mb-1 text-xs text-muted">
            Customers rely on this list. Check every dish against the recipe.
          </p>
          <div className="grid grid-cols-2 gap-x-3">
            {ALLERGENS.map((allergen) => (
              <CheckboxField
                key={allergen}
                label={allergen}
                value={allergen}
                {...register('allergens')}
              />
            ))}
          </div>
        </fieldset>
      </OverlayBody>

      <OverlayFooter className={dish ? 'justify-between' : undefined}>
        {dish && (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Delete
          </Button>
        )}
        <Button type="submit" disabled={createDish.isPending || updateDish.isPending}>
          Save dish
        </Button>
      </OverlayFooter>

      {dish && (
        <ConfirmDialog
          open={confirmingDelete}
          title={`Delete ${dish.name}?`}
          body="It will disappear from the menu. Past orders are not affected."
          confirmLabel="Delete dish"
          destructive
          pending={deleteDish.isPending}
          onConfirm={() => deleteDish.mutate(dish.id, { onSuccess: onClose })}
          onClose={() => setConfirmingDelete(false)}
        />
      )}
    </form>
  )
}

interface DishFormDrawerProps extends DishFormProps {
  open: boolean
}

export const DishFormDrawer = ({ open, dish, onClose }: DishFormDrawerProps) => (
  <Drawer open={open} onClose={onClose} label={dish ? 'Edit dish' : 'Add dish'}>
    <DishForm key={dish?.id ?? 'new'} dish={dish} onClose={onClose} />
  </Drawer>
)
