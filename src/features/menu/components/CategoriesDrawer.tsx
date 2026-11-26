import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SelectField, TextField } from '@/components/ui/fields'
import { IconButton } from '@/components/ui/IconButton'
import { Drawer, OverlayBody, OverlayHeader } from '@/components/ui/Overlay'
import {
  useCategories,
  useDeleteCategory,
  useDishes,
  useMoveCategory,
  useSaveCategory,
} from '@/services/menu/menu.queries'
import type { Category } from '@/types'

const ACCENTS = [
  { value: 'jollof', label: 'Jollof red' },
  { value: 'ewedu', label: 'Ewedu green' },
  { value: 'indigo', label: 'Indigo blue' },
  { value: 'gold', label: 'Gold' },
] as const

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Enter a category name').max(40, 'Up to 40 characters'),
  shortName: z.string().trim().max(16, 'Up to 16 characters'),
  accent: z.enum(['jollof', 'ewedu', 'indigo', 'gold']),
})

type CategoryValues = z.infer<typeof categorySchema>

const emptyCategory: CategoryValues = { name: '', shortName: '', accent: 'jollof' }

/** Adds a new category, or edits one when `category` is given. */
const CategoryForm = ({ category, onDone }: { category?: Category; onDone: () => void }) => {
  const save = useSaveCategory()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, shortName: category.shortName, accent: category.accent }
      : emptyCategory,
  })

  const submit = (input: CategoryValues) =>
    save.mutate(
      { id: category?.id, input: { ...input, shortName: input.shortName || input.name } },
      {
        onSuccess: () => {
          reset(emptyCategory)
          onDone()
        },
      },
    )

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="flex flex-col gap-3 rounded-2xl bg-shea p-3"
    >
      <TextField label="Name" error={errors.name?.message} {...register('name')} />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Short name (optional)"
          hint="Shown on phone tabs"
          error={errors.shortName?.message}
          {...register('shortName')}
        />
        <SelectField label="Colour" {...register('accent')}>
          {ACCENTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="flex justify-end gap-2">
        {category && (
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={save.isPending}>
          {category ? 'Save category' : 'Add category'}
        </Button>
      </div>
    </form>
  )
}

export const CategoriesDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { data: categories = [] } = useCategories()
  const { data: dishes = [] } = useDishes()
  const moveCategory = useMoveCategory()
  const deleteCategory = useDeleteCategory()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const dishCount = (id: string) => dishes.filter(({ categoryId }) => categoryId === id).length

  return (
    <Drawer open={open} onClose={onClose} label="Categories">
      <OverlayHeader title="Categories" onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <CategoryForm onDone={() => undefined} />

        {categories.length === 0 ? (
          <p className="text-sm text-muted">No categories yet. Add one above, then add dishes.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {categories.map((category, index) =>
              editingId === category.id ? (
                <li key={category.id} className="py-3">
                  <CategoryForm category={category} onDone={() => setEditingId(null)} />
                </li>
              ) : (
                <li key={category.id} className="flex items-center gap-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{category.name}</p>
                    <p className="text-xs text-muted">
                      {dishCount(category.id)} dish{dishCount(category.id) === 1 ? '' : 'es'}
                    </p>
                  </div>
                  <IconButton
                    label={`Move ${category.name} up`}
                    disabled={index === 0}
                    onClick={() => moveCategory.mutate({ id: category.id, direction: -1 })}
                  >
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton
                    label={`Move ${category.name} down`}
                    disabled={index === categories.length - 1}
                    onClick={() => moveCategory.mutate({ id: category.id, direction: 1 })}
                  >
                    <ArrowDown className="size-4" />
                  </IconButton>
                  <IconButton
                    label={`Edit ${category.name}`}
                    onClick={() => setEditingId(category.id)}
                  >
                    <Pencil className="size-4" />
                  </IconButton>
                  <IconButton
                    label={`Delete ${category.name}`}
                    onClick={() => setDeleting(category)}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </li>
              ),
            )}
          </ul>
        )}
      </OverlayBody>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? 'category'}?`}
        body={
          deleting && dishCount(deleting.id) > 0
            ? 'It still has dishes. Move them to another category or delete them first.'
            : 'It will disappear from the menu.'
        }
        confirmLabel="Delete category"
        destructive
        pending={deleteCategory.isPending}
        onConfirm={() =>
          deleting && deleteCategory.mutate(deleting.id, { onSettled: () => setDeleting(null) })
        }
        onClose={() => setDeleting(null)}
      />
    </Drawer>
  )
}
