import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { customersApi } from './customers.api'

export const useCustomers = () =>
  useQuery({ queryKey: queryKeys.customers, queryFn: customersApi.listCustomers, staleTime: 0 })

export const useSetCustomerBlocked = () =>
  useAppMutation({
    mutationFn: customersApi.setBlocked,
    invalidate: [queryKeys.customers],
    success: 'Customer updated',
  })

export const useDeleteCustomerData = () =>
  useAppMutation({
    mutationFn: customersApi.deleteData,
    invalidate: [queryKeys.customers, queryKeys.orders],
    success: 'Customer data deleted',
  })
