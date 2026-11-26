import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TextAreaField, TextField } from '@/components/ui/fields'
import { Drawer, OverlayBody, OverlayFooter, OverlayHeader } from '@/components/ui/Overlay'
import { useDeleteCategory, useDishes, useSaveCategory } from '@/services/menu/menu.queries'
import type { Category } from '@/types'

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Enter a category name').max(40, 'Up to 40 characters'),
  notes: z.string().trim().max(500, 'Keep it under 500 characters'),
})

type CategoryValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category: Category | null
  onClose: () => void
}

const CategoryForm = ({ category, onClose }: CategoryFormProps) => {
  const save = useSaveCategory()
  const remove = useDeleteCategory()
  const { data: dishes = [] } = useDishes()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '', notes: category?.notes ?? '' },
  })
  const dishCount = category
    ? dishes.filter(({ categoryId }) => categoryId === category.id).length
    : 0

  return (
    <form
      noValidate
      onSubmit={handleSubmit((input) =>
        save.mutate({ id: category?.id, input }, { onSuccess: onClose }),
      )}
      className="flex h-full flex-col"
    >
      <OverlayHeader title={category ? 'Edit category' : 'Add category'} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <TextField
          label="Name"
          placeholder="Rice Mains"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextAreaField
          label="Notes (only visible to staff)"
          placeholder="Enter notes"
          rows={4}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </OverlayBody>

      <OverlayFooter className={category ? 'justify-between' : undefined}>
        {category && (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Delete
          </Button>
        )}
        <Button type="submit" disabled={save.isPending}>
          Save category
        </Button>
      </OverlayFooter>

      {category && (
        <ConfirmDialog
          open={confirmingDelete}
          title={`Delete ${category.name}?`}
          body={
            dishCount > 0
              ? `It still has ${dishCount} dish${dishCount === 1 ? '' : 'es'}. Move them to another category or delete them first.`
              : 'It will disappear from the menu.'
          }
          confirmLabel="Delete category"
          destructive
          pending={remove.isPending}
          onConfirm={() =>
            remove.mutate(category.id, {
              onSuccess: onClose,
              onSettled: () => setConfirmingDelete(false),
            })
          }
          onClose={() => setConfirmingDelete(false)}
        />
      )}
    </form>
  )
}

interface CategoryFormDrawerProps extends CategoryFormProps {
  open: boolean
}

export const CategoryFormDrawer = ({ open, category, onClose }: CategoryFormDrawerProps) => (
  <Drawer open={open} onClose={onClose} label={category ? 'Edit category' : 'Add category'}>
    <CategoryForm key={category?.id ?? 'new'} category={category} onClose={onClose} />
  </Drawer>
)
