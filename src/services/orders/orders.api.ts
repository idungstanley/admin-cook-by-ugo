import { http } from '@/lib/http'
import type { CollectedBy, Order, OrderStatus } from '@/types'

const orderPath = (orderId: string) => `/orders/${orderId}`

export const ordersApi = {
  listActive: () => http.get<Order[]>('/orders/active'),
  listOrders: () => http.get<Order[]>('/orders'),
  getOrder: (id: string) => http.get<Order>(orderPath(id)),
  updateStatus: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
    http.patch<Order>(`${orderPath(orderId)}/status`, { status }),
  assignRider: ({ orderId, riderId }: { orderId: string; riderId: string }) =>
    http.patch<Order>(`${orderPath(orderId)}/rider`, { riderId }),
  updateEta: ({ orderId, etaMinutes }: { orderId: string; etaMinutes: number }) =>
    http.patch<Order>(`${orderPath(orderId)}/eta`, { etaMinutes }),
  refund: ({ orderId, amount, reason }: { orderId: string; amount: number; reason: string }) =>
    http.post<Order>(`${orderPath(orderId)}/refund`, { amount, reason }),
  recordCollection: ({ orderId, collectedBy }: { orderId: string; collectedBy: CollectedBy }) =>
    http.post<Order>(`${orderPath(orderId)}/collection`, { collectedBy }),
  cancel: ({ orderId, reason }: { orderId: string; reason: string }) =>
    http.post<Order>(`${orderPath(orderId)}/cancel`, { reason }),
}
