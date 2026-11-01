import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { dealsApi } from './deals.api'

const invalidate = [queryKeys.deals]

export const useDeals = () => useQuery({ queryKey: queryKeys.deals, queryFn: dealsApi.listDeals })
export const useSaveDeal = () =>
  useAppMutation({ mutationFn: dealsApi.saveDeal, invalidate, success: 'Deal saved' })
export const useSetDealActive = () => useAppMutation({ mutationFn: dealsApi.setActive, invalidate })
export const useDeleteDeal = () =>
  useAppMutation({ mutationFn: dealsApi.deleteDeal, invalidate, success: 'Deal deleted' })
