import { ArrowDown, ArrowUp, FolderPlus, Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage'
import { Toggle } from '@/components/ui/Toggle'
import { usePermission } from '@/hooks/usePermission'
import { formatPrice } from '@/lib/format'
import { useCategories, useDishes, useMoveDish, useSetSoldOut } from '@/services/menu/menu.queries'
import type { Dish } from '@/types'
import { CategoriesDrawer } from './components/CategoriesDrawer'
import { DishFormDrawer } from './components/DishFormDrawer'
import { groupDishes } from './menu.utils'

export const MenuPage = () => {
  const canEdit = usePermission('menu.edit')
  const dishesQuery = useDishes()
  const { data: categories } = useCategories()
  const setSoldOut = useSetSoldOut()
  const moveDish = useMoveDish()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Dish | 'new' | null>(null)
  const [managingCategories, setManagingCategories] = useState(false)

  const { data: dishes } = dishesQuery
  const groups = useMemo(
    () => groupDishes(categories ?? [], dishes ?? [], search),
    [categories, dishes, search],
  )

  if (dishesQuery.isPending) return <PageSkeleton />
  if (dishesQuery.isError) return <ErrorMessage onRetry={() => void dishesQuery.refetch()} />

  const buildColumns = (firstId?: string, lastId?: string): Column<Dish>[] => [
    {
      header: 'Dish',
      hideLabelOnMobile: true,
      cell: (dish) => (
        <div className="flex items-center gap-3 text-left">
          {dish.image ? (
            <img src={dish.image} alt="" className="size-12 rounded-xl object-cover" />
          ) : (
            <span className="grid size-12 place-items-center rounded-xl bg-shea text-[10px] text-muted">
              No photo
            </span>
          )}
          <div className="min-w-0">
            <p className="font-bold">{dish.name}</p>
            <p className="text-xs text-muted">
              {dish.allergens.length > 0 ? dish.allergens.join(', ') : 'No allergens listed'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: ({ price }) => <span className="font-bold">{formatPrice(price)}</span>,
    },
    {
      header: 'Status',
      cell: ({ soldOut }) =>
        soldOut ? <Badge tone="jollof">Sold out</Badge> : <Badge tone="ewedu">Available</Badge>,
    },
    {
      header: 'Available',
      cell: (dish) => (
        <Toggle
          label={`${dish.name} available`}
          checked={!dish.soldOut}
          onChange={(available) => setSoldOut.mutate({ id: dish.id, soldOut: !available })}
        />
      ),
    },
    ...(canEdit
      ? [
          {
            header: 'Actions',
            className: 'text-right',
            hideLabelOnMobile: true,
            cell: (dish: Dish) => (
              <div className="flex justify-end">
                <IconButton
                  label={`Move ${dish.name} up`}
                  disabled={dish.id === firstId || Boolean(search)}
                  onClick={() => moveDish.mutate({ id: dish.id, direction: -1 })}
                >
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton
                  label={`Move ${dish.name} down`}
                  disabled={dish.id === lastId || Boolean(search)}
                  onClick={() => moveDish.mutate({ id: dish.id, direction: 1 })}
                >
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton label={`Edit ${dish.name}`} onClick={() => setEditing(dish)}>
                  <Pencil className="size-4" />
                </IconButton>
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <>
      <PageHeader
        title="Dishes"
        description={
          canEdit
            ? 'Edit the menu and switch dishes to sold out in one tap.'
            : 'Switch dishes to sold out in one tap.'
        }
        actions={
          canEdit && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setManagingCategories(true)}>
                <FolderPlus className="size-4" /> Categories
              </Button>
              <Button
                disabled={(categories?.length ?? 0) === 0}
                onClick={() => setEditing('new')}
              >
                <Plus className="size-4" /> Add dish
              </Button>
            </div>
          )
        }
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search dishes"
        className="mb-5 max-w-md"
      />

      {categories?.length === 0 ? (
        <StatusMessage
          title="Start with a category"
          body="Dishes sit inside categories, like Rice or Drinks. Add a category first."
          action={
            canEdit && (
              <Button onClick={() => setManagingCategories(true)}>
                <FolderPlus className="size-4" /> Add a category
              </Button>
            )
          }
        />
      ) : groups.length === 0 ? (
        <StatusMessage title={search ? 'No dishes match that' : 'No dishes yet'} />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ category, dishes: rows, firstId, lastId }) => (
            <section key={category.id}>
              <h2 className="mb-2 text-xl">{category.name}</h2>
              <DataTable
                caption={category.name}
                columns={buildColumns(firstId, lastId)}
                rows={rows}
                rowKey={({ id }) => id}
              />
            </section>
          ))}
        </div>
      )}

      <CategoriesDrawer open={managingCategories} onClose={() => setManagingCategories(false)} />
      <DishFormDrawer
        open={editing !== null}
        dish={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />
    </>
  )
}
