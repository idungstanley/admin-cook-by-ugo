import { moveItem } from '@/features/menu/menu.utils'
import { db } from '@/mocks/db'
import { createId, findOrThrow, mockRequest } from '@/services/mockClient'
import type { Dish, OptionGroup } from '@/types'

export type DishInput = Omit<Dish, 'id' | 'soldOut'>
export type OptionGroupInput = Omit<OptionGroup, 'id'> & { dishIds: string[] }

export const menuApi = {
  listCategories: () => mockRequest(() => db.categories),
  listDishes: () => mockRequest(() => db.dishes),
  listOptionGroups: () => mockRequest(() => db.optionGroups),

  createDish: (input: DishInput) =>
    mockRequest(() => {
      db.dishes.push({ ...input, id: createId('dish'), soldOut: false })
    }),

  updateDish: ({ id, input }: { id: string; input: DishInput }) =>
    mockRequest(() => {
      Object.assign(findOrThrow(db.dishes, id, 'Dish'), input)
    }),

  deleteDish: (id: string) =>
    mockRequest(() => {
      db.dishes = db.dishes.filter((dish) => dish.id !== id)
    }),

  setSoldOut: ({ id, soldOut }: { id: string; soldOut: boolean }) =>
    mockRequest(() => {
      findOrThrow(db.dishes, id, 'Dish').soldOut = soldOut
    }),

  moveDish: ({ id, direction }: { id: string; direction: -1 | 1 }) =>
    mockRequest(() => {
      db.dishes = moveItem(db.dishes, id, direction)
    }),

  saveOptionGroup: ({ id, input }: { id?: string; input: OptionGroupInput }) =>
    mockRequest(() => {
      const { dishIds, ...group } = input
      const groupId = id ?? createId('group')
      if (id) Object.assign(findOrThrow(db.optionGroups, id, 'Option group'), group)
      else db.optionGroups.push({ ...group, id: groupId })

      db.dishes.forEach((dish) => {
        const withoutGroup = dish.optionGroupIds.filter((entry) => entry !== groupId)
        dish.optionGroupIds = dishIds.includes(dish.id) ? [...withoutGroup, groupId] : withoutGroup
      })
    }),

  deleteOptionGroup: (id: string) =>
    mockRequest(() => {
      db.optionGroups = db.optionGroups.filter((group) => group.id !== id)
      db.dishes.forEach((dish) => {
        dish.optionGroupIds = dish.optionGroupIds.filter((entry) => entry !== id)
      })
    }),
}
