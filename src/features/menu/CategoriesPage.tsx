import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage'
import { useCategories, useDishes, useMoveCategory } from '@/services/menu/menu.queries'
import type { Category } from '@/types'
import { CategoryFormDrawer } from './components/CategoryFormDrawer'

export const CategoriesPage = () => {
  const categoriesQuery = useCategories()
  const { data: dishes = [] } = useDishes()
  const moveCategory = useMoveCategory()
  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  if (categoriesQuery.isPending) return <PageSkeleton />
  if (categoriesQuery.isError)
    return <ErrorMessage onRetry={() => void categoriesQuery.refetch()} />

  const categories = categoriesQuery.data
  const dishCount = (id: string) => dishes.filter(({ categoryId }) => categoryId === id).length

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group dishes on the menu. Customers see them in this order."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <StatusMessage
          title="No categories yet"
          body="Add one, like Rice Mains or Drinks, then add dishes to it."
        />
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {categories.map((category, index) => {
            const count = dishCount(category.id)
            return (
              <li key={category.id} className="flex items-center gap-2 px-4 py-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setEditing(category)}
                >
                  <p className="font-bold">{category.name}</p>
                  <p className="text-sm text-muted">
                    {count} item{count === 1 ? '' : 's'}
                  </p>
                  {category.notes && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{category.notes}</p>
                  )}
                </button>
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
                <IconButton label={`Edit ${category.name}`} onClick={() => setEditing(category)}>
                  <Pencil className="size-4" />
                </IconButton>
              </li>
            )
          })}
        </ul>
      )}

      <CategoryFormDrawer
        open={editing !== null}
        category={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />
    </>
  )
}
