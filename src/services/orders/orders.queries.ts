import { useQuery } from '@tanstack/react-query'
import { ORDERS_POLL_MS } from '@/constants/orders'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { ordersApi } from './orders.api'

/** Tonight's service. Live updates arrive over the socket, and polling is only the fallback. */
export const useActiveOrders = () =>
  useQuery({
    queryKey: queryKeys.activeOrders,
    queryFn: ordersApi.listActive,
    refetchInterval: ORDERS_POLL_MS,
    staleTime: 0,
  })

export const useOrders = () =>
  useQuery({ queryKey: queryKeys.orders, queryFn: ordersApi.listOrders, staleTime: 0 })

export const useOrder = (orderId: string) =>
  useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => ordersApi.getOrder(orderId),
    refetchInterval: ORDERS_POLL_MS,
    staleTime: 0,
  })

const invalidate = [queryKeys.orders]

export const useUpdateOrderStatus = () =>
  useAppMutation({ mutationFn: ordersApi.updateStatus, invalidate })

export const useAssignRider = () =>
  useAppMutation({ mutationFn: ordersApi.assignRider, invalidate, success: 'Rider assigned' })

export const useUpdateEta = () =>
  useAppMutation({ mutationFn: ordersApi.updateEta, invalidate, success: 'ETA updated' })

export const useRefundOrder = () =>
  useAppMutation({ mutationFn: ordersApi.refund, invalidate, success: 'Refund issued' })

export const useRecordCollection = () =>
  useAppMutation({
    mutationFn: ordersApi.recordCollection,
    invalidate,
    success: 'Payment recorded',
  })

export const useCancelOrder = () =>
  useAppMutation({ mutationFn: ordersApi.cancel, invalidate, success: 'Order cancelled' })
