import type { Category, Dish } from '@/types'

export const groupDishes = (categories: Category[], dishes: Dish[], search: string) => {
  const term = search.trim().toLowerCase()

  return (
    categories
      .map((category) => {
        const all = dishes.filter(({ categoryId }) => categoryId === category.id)
        return {
          category,
          firstId: all[0]?.id,
          lastId: all.at(-1)?.id,
          dishes: all.filter(({ name }) => !term || name.toLowerCase().includes(term)),
        }
      })
      // While searching, only categories with a match show. Otherwise empty ones show too,
      // so a new category is there to add dishes to.
      .filter((group) => !term || group.dishes.length > 0)
  )
}
