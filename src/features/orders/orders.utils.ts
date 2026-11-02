import { BOARD_DONE_WINDOW_HOURS } from '@/constants/orders'
import { toCsv } from '@/lib/csv'
import { formatDateTime, penceToPounds } from '@/lib/format'
import type { Order, OrderStatus, Pence } from '@/types'

const HOUR_MS = 3_600_000
const ACTIVE_STATUSES: OrderStatus[] = ['received', 'preparing', 'out-for-delivery']

export const isActiveOrder = ({ status }: Order) => ACTIVE_STATUSES.includes(status)

export const isOverdue = (order: Order, now = Date.now()) =>
  isActiveOrder(order) && now - order.createdAt > order.etaMinutes * 60_000

export const getBoardOrders = (orders: Order[], statuses: OrderStatus[], now = Date.now()) =>
  orders
    .filter(({ status, createdAt }) => {
      if (!statuses.includes(status)) return false
      return status !== 'delivered' || now - createdAt < BOARD_DONE_WINDOW_HOURS * HOUR_MS
    })
    .sort((a, b) => a.createdAt - b.createdAt)

export const getRefundableAmount = (order: Order): Pence =>
  order.paymentMethod === 'card' && ['paid', 'partially-refunded'].includes(order.paymentStatus)
    ? order.total - order.refundedAmount
    : 0

export interface OrderFilters {
  search: string
  status: OrderStatus | 'all'
  from: string
  to: string
}

export const filterOrders = (orders: Order[], { search, status, from, to }: OrderFilters) => {
  const term = search.trim().toLowerCase()
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : 0
  const toTime = to ? new Date(`${to}T23:59:59`).getTime() : Infinity

  return orders.filter(
    (order) =>
      (status === 'all' || order.status === status) &&
      order.createdAt >= fromTime &&
      order.createdAt <= toTime &&
      (!term ||
        `${order.number} ${order.customerName} ${order.customerPhone}`
          .toLowerCase()
          .includes(term)),
  )
}

export const ordersToCsv = (orders: Order[]) =>
  toCsv(
    [
      'Order',
      'Date',
      'Customer',
      'Status',
      'Payment method',
      'Payment status',
      'Total (GBP)',
      'Refunded (GBP)',
    ],
    orders.map((order) => [
      order.number,
      formatDateTime(order.createdAt),
      order.customerName,
      order.status,
      order.collectedBy ? `${order.paymentMethod} (${order.collectedBy})` : order.paymentMethod,
      order.paymentStatus,
      penceToPounds(order.total).toFixed(2),
      penceToPounds(order.refundedAmount).toFixed(2),
    ]),
  )
