import { applyRefund } from '@/features/orders/orders.utils'
import { formatPrice } from '@/lib/format'
import { db } from '@/mocks/db'
import { buildOrder } from '@/mocks/seed/orders'
import { createId, findOrThrow, mockRequest } from '@/services/mockClient'
import type { CollectedBy, Order, OrderStatus } from '@/types'
import { ORDER_STATUS_META } from '@/constants/orders'

const getOrder = (id: string) => findOrThrow(db.orders, id, 'Order')

const logEvent = (order: Order, actor: string, message: string) =>
  order.events.push({ id: createId('event'), at: Date.now(), actor, message })

interface OrderAction {
  orderId: string
  actor: string
}

export const ordersApi = {
  listOrders: () => mockRequest(() => db.orders),
  getOrder: (id: string) => mockRequest(() => getOrder(id)),

  updateStatus: ({ orderId, actor, status }: OrderAction & { status: OrderStatus }) =>
    mockRequest(() => {
      const order = getOrder(orderId)
      if (status === 'delivered' && order.paymentStatus === 'due') {
        throw new Error('Record the payment before marking this order delivered')
      }
      order.status = status
      logEvent(order, actor, `Status changed to ${ORDER_STATUS_META[status].label}`)
      return order
    }),

  assignRider: ({ orderId, actor, riderId }: OrderAction & { riderId: string }) =>
    mockRequest(() => {
      const order = getOrder(orderId)
      const rider = findOrThrow(db.staff, riderId, 'Rider')
      order.riderId = riderId
      logEvent(order, actor, `Assigned to ${rider.name}`)
      return order
    }),

  updateEta: ({ orderId, actor, etaMinutes }: OrderAction & { etaMinutes: number }) =>
    mockRequest(() => {
      const order = getOrder(orderId)
      order.etaMinutes = etaMinutes
      logEvent(order, actor, `ETA changed to ${etaMinutes} minutes`)
      return order
    }),

  refund: ({ orderId, actor, amount, reason }: OrderAction & { amount: number; reason: string }) =>
    mockRequest(() => {
      const order = getOrder(orderId)
      Object.assign(order, applyRefund(order, amount))
      logEvent(order, actor, `Refunded ${formatPrice(amount)}: ${reason}`)
      return order
    }),

  recordCollection: ({ orderId, actor, collectedBy }: OrderAction & { collectedBy: CollectedBy }) =>
    mockRequest(() => {
      const order = getOrder(orderId)
      order.paymentStatus = 'paid'
      order.collectedBy = collectedBy
      order.status = 'delivered'
      logEvent(order, actor, `Payment collected by ${collectedBy}, order delivered`)
      return order
    }),

  cancel: ({ orderId, actor, reason }: OrderAction & { reason: string }) =>
    mockRequest(() => {
      const order = getOrder(orderId)
      if (order.paymentMethod === 'card') {
        Object.assign(order, applyRefund(order, order.total - order.refundedAmount))
      }
      order.status = 'cancelled'
      logEvent(order, actor, `Order cancelled: ${reason}`)
      return order
    }),

  /** Demo helper standing in for a new order arriving from the website. */
  simulateNewOrder: () =>
    mockRequest(() => {
      const sequence = db.nextOrderSequence
      db.nextOrderSequence += 1
      const customer = db.customers[Math.floor(db.random() * db.customers.length)]
      if (!customer) throw new Error('No customers')
      const order = buildOrder({
        id: `order-${sequence}`,
        sequence,
        customer,
        createdAt: Date.now(),
        status: 'received',
        random: db.random,
      })
      db.orders.unshift(order)
      return order
    }),
}
