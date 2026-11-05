import { http } from '@/lib/http'
import type { Category, Dish, OptionGroup } from '@/types'

/** `kcal: null` clears a calorie count that was set before. */
export type DishInput = Omit<Dish, 'id' | 'soldOut' | 'kcal'> & { kcal: number | null }
export type OptionGroupInput = Omit<OptionGroup, 'id'> & { dishIds: string[] }

export const menuApi = {
  listCategories: () => http.get<Category[]>('/catalog/categories'),
  listDishes: () => http.get<Dish[]>('/catalog/dishes'),
  listOptionGroups: () => http.get<OptionGroup[]>('/catalog/option-groups'),
  createDish: (input: DishInput) => http.post<Dish>('/catalog/dishes', input),
  updateDish: ({ id, input }: { id: string; input: DishInput }) =>
    http.put<Dish>(`/catalog/dishes/${id}`, input),
  deleteDish: (id: string) => http.delete<void>(`/catalog/dishes/${id}`),
  setSoldOut: ({ id, soldOut }: { id: string; soldOut: boolean }) =>
    http.patch<Dish>(`/catalog/dishes/${id}/sold-out`, { soldOut }),
  moveDish: ({ id, direction }: { id: string; direction: -1 | 1 }) =>
    http.post<void>(`/catalog/dishes/${id}/move`, { direction }),
  saveOptionGroup: ({ id, input }: { id?: string; input: OptionGroupInput }) =>
    id
      ? http.put<OptionGroup>(`/catalog/option-groups/${id}`, input)
      : http.post<OptionGroup>('/catalog/option-groups', input),
  deleteOptionGroup: (id: string) => http.delete<void>(`/catalog/option-groups/${id}`),
}
