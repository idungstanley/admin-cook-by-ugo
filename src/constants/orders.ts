import type { OrderStatus, PaymentStatus } from '@/types'
import type { BadgeTone } from '@/components/ui/Badge'

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  received: { label: 'New', tone: 'jollof' },
  preparing: { label: 'Preparing', tone: 'gold' },
  'out-for-delivery': { label: 'Out for delivery', tone: 'indigo' },
  delivered: { label: 'Delivered', tone: 'ewedu' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: 'Paid', tone: 'ewedu' },
  due: { label: 'Due on delivery', tone: 'gold' },
  'partially-refunded': { label: 'Part refunded', tone: 'indigo' },
  refunded: { label: 'Refunded', tone: 'neutral' },
}

export const BOARD_COLUMNS: { id: string; title: string; statuses: OrderStatus[] }[] = [
  { id: 'new', title: 'New', statuses: ['received'] },
  { id: 'preparing', title: 'Preparing', statuses: ['preparing'] },
  { id: 'out', title: 'Out for delivery', statuses: ['out-for-delivery'] },
  { id: 'done', title: 'Done', statuses: ['delivered'] },
]

export const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; action: string }>> = {
  received: { status: 'preparing', action: 'Accept order' },
  preparing: { status: 'out-for-delivery', action: 'Send out' },
  'out-for-delivery': { status: 'delivered', action: 'Mark delivered' },
}

export const ORDERS_POLL_MS = 4000
/** Done column only shows recent orders, so the board stays about tonight's service. */
export const BOARD_DONE_WINDOW_HOURS = 3
export const HISTORY_PAGE_SIZE = 12
