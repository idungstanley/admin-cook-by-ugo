import type { Category, Dish } from '@/types'

/** Swaps an item with its nearest neighbour in the same category. */
export const moveItem = <T extends { id: string; categoryId: string }>(
  items: T[],
  id: string,
  direction: -1 | 1,
) => {
  const index = items.findIndex((item) => item.id === id)
  const item = items[index]
  if (!item) return items

  let target = index + direction
  while (items[target] && items[target]?.categoryId !== item.categoryId) target += direction

  const neighbour = items[target]
  if (!neighbour) return items

  const next = [...items]
  next[index] = neighbour
  next[target] = item
  return next
}

export const groupDishes = (categories: Category[], dishes: Dish[], search: string) => {
  const term = search.trim().toLowerCase()

  return categories
    .map((category) => {
      const all = dishes.filter(({ categoryId }) => categoryId === category.id)
      return {
        category,
        firstId: all[0]?.id,
        lastId: all.at(-1)?.id,
        dishes: all.filter(({ name }) => !term || name.toLowerCase().includes(term)),
      }
    })
    .filter((group) => group.dishes.length > 0)
}
