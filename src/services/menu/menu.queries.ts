import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { menuApi } from './menu.api'

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.categories, queryFn: menuApi.listCategories })
export const useDishes = () => useQuery({ queryKey: queryKeys.dishes, queryFn: menuApi.listDishes })
export const useOptionGroups = () =>
  useQuery({ queryKey: queryKeys.optionGroups, queryFn: menuApi.listOptionGroups })

const dishes = [queryKeys.dishes]
const options = [queryKeys.optionGroups, queryKeys.dishes]

export const useCreateDish = () =>
  useAppMutation({ mutationFn: menuApi.createDish, invalidate: dishes, success: 'Dish added' })
export const useUpdateDish = () =>
  useAppMutation({ mutationFn: menuApi.updateDish, invalidate: dishes, success: 'Dish saved' })
export const useDeleteDish = () =>
  useAppMutation({ mutationFn: menuApi.deleteDish, invalidate: dishes, success: 'Dish deleted' })
export const useSetSoldOut = () =>
  useAppMutation({ mutationFn: menuApi.setSoldOut, invalidate: dishes })
export const useMoveDish = () =>
  useAppMutation({ mutationFn: menuApi.moveDish, invalidate: dishes })
export const useSaveOptionGroup = () =>
  useAppMutation({
    mutationFn: menuApi.saveOptionGroup,
    invalidate: options,
    success: 'Options saved',
  })
export const useDeleteOptionGroup = () =>
  useAppMutation({
    mutationFn: menuApi.deleteOptionGroup,
    invalidate: options,
    success: 'Option group deleted',
  })
