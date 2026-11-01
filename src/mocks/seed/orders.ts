import { seedDishes } from './menu'
import type { Customer, Order, OrderEvent, OrderItem, OrderStatus } from '@/types'

const MINUTE_MS = 60_000
const DAY_MS = 86_400_000
const HISTORY_DAYS = 180
const DELIVERY_FEE = 299
const FREE_DELIVERY_THRESHOLD = 2500

/** Small seeded generator, so the demo data looks the same on every load. */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

const CUSTOMER_NAMES = [
  'Amara Okafor',
  'Daniel Reid',
  'Funmi Ajayi',
  'Chloe Hart',
  'Kunle Adeyemi',
  'Priya Nair',
  'Tobi Lawal',
  'Megan Scott',
  'Emeka Eze',
  'Hannah Ward',
  'Yemi Balogun',
  'Jack Turner',
  'Ngozi Umeh',
  'Liam Foster',
]

const STREETS = [
  'Grey Street',
  'Osborne Road',
  'Heaton Park Road',
  'Westgate Road',
  'Chillingham Road',
  'Elswick Road',
]
const POSTCODES = ['NE1 4ST', 'NE1 7RU', 'NE2 1AB', 'NE2 2DS', 'NE3 1DA', 'NE4 6SU']
const SUMMARIES = [
  'Chicken · Medium',
  'Beef · Naija hot',
  'Vegetarian · Fried Plantain · Mild',
  'Fish · Medium',
]

export const seedCustomers: Customer[] = CUSTOMER_NAMES.map((name, index) => ({
  id: `customer-${index + 1}`,
  name,
  email: `${name.split(' ')[0]?.toLowerCase()}@example.com`,
  phone: `07700 900${String(100 + index)}`,
  marketingOptIn: index % 3 === 0,
  blocked: false,
  deleted: false,
}))

const pick = <T>(items: T[], random: () => number): T =>
  items[Math.floor(random() * items.length)] as T

export const buildOrderNumber = (sequence: number) => `UGO-${1000 + sequence}`

export const buildItems = (random: () => number, idPrefix: string): OrderItem[] => {
  const itemCount = 1 + Math.floor(random() * 3)

  return Array.from({ length: itemCount }, (_, index) => {
    const dish = pick(seedDishes, random)
    return {
      id: `${idPrefix}-item-${index}`,
      name: dish.name,
      summary: dish.optionGroupIds.length > 0 ? pick(SUMMARIES, random) : undefined,
      quantity: 1 + Math.floor(random() * 2),
      unitPrice: dish.price,
    }
  })
}

const event = (orderId: string, at: number, actor: string, message: string): OrderEvent => ({
  id: `${orderId}-${at}`,
  at,
  actor,
  message,
})

interface OrderDraft {
  id: string
  sequence: number
  customer: Customer
  createdAt: number
  status: OrderStatus
  random: () => number
  riderId?: string
}

export const buildOrder = ({
  id,
  sequence,
  customer,
  createdAt,
  status,
  random,
  riderId,
}: OrderDraft): Order => {
  const items = buildItems(random, id)
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee
  const paymentMethod = random() < 0.72 ? 'card' : 'on-delivery'
  const isDoneOnDelivery = paymentMethod === 'on-delivery' && status === 'delivered'

  return {
    id,
    number: buildOrderNumber(sequence),
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    address: `${1 + Math.floor(random() * 90)} ${pick(STREETS, random)}, Newcastle upon Tyne`,
    postcode: pick(POSTCODES, random),
    deliveryNote: random() < 0.25 ? 'Ring the bell, flat upstairs.' : undefined,
    allergyNote: random() < 0.12 ? 'Peanut allergy, please keep suya separate.' : undefined,
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'card' || isDoneOnDelivery ? 'paid' : 'due',
    collectedBy: isDoneOnDelivery ? (random() < 0.6 ? 'cash' : 'card') : undefined,
    refundedAmount: 0,
    etaMinutes: 40,
    riderId,
    status,
    createdAt,
    events: [event(id, createdAt, 'Website', 'Order placed')],
  }
}

/** About 180 days of completed orders, with volume growing over time for the reports. */
const buildHistory = (now: number, random: () => number) => {
  const orders: Order[] = []
  let sequence = 1

  for (let daysAgo = HISTORY_DAYS; daysAgo >= 1; daysAgo -= 1) {
    const growth = 1 + (HISTORY_DAYS - daysAgo) / 60
    const dailyOrders = Math.round(growth * (1.5 + random() * 3))

    for (let index = 0; index < dailyOrders; index += 1) {
      const id = `order-${sequence}`
      const roll = random()
      const order = buildOrder({
        id,
        sequence,
        customer: pick(seedCustomers, random),
        createdAt: now - daysAgo * DAY_MS + Math.floor(random() * DAY_MS * 0.3),
        status: roll < 0.04 ? 'cancelled' : 'delivered',
        random,
        riderId: 'staff-rider',
      })
      if (order.status === 'cancelled' && order.paymentMethod === 'card') {
        order.paymentStatus = 'refunded'
        order.refundedAmount = order.total
      }
      if (order.status === 'delivered' && order.paymentMethod === 'card' && random() < 0.03) {
        order.paymentStatus = 'partially-refunded'
        order.refundedAmount = 500
      }
      orders.push(order)
      sequence += 1
    }
  }
  return { orders, sequence }
}

const ACTIVE_ORDERS: { status: OrderStatus; minutesAgo: number; riderId?: string }[] = [
  { status: 'received', minutesAgo: 2 },
  { status: 'received', minutesAgo: 6 },
  { status: 'preparing', minutesAgo: 12 },
  { status: 'preparing', minutesAgo: 24 },
  { status: 'preparing', minutesAgo: 52 },
  { status: 'out-for-delivery', minutesAgo: 34, riderId: 'staff-rider' },
  { status: 'out-for-delivery', minutesAgo: 38, riderId: 'staff-rider' },
  { status: 'delivered', minutesAgo: 70, riderId: 'staff-rider-2' },
]

export const buildSeedOrders = (now: number) => {
  const random = createRandom(4186)
  const history = buildHistory(now, random)
  let sequence = history.sequence

  const active = ACTIVE_ORDERS.map(({ status, minutesAgo, riderId }) => {
    const id = `order-${sequence}`
    const order = buildOrder({
      id,
      sequence,
      customer: pick(seedCustomers, random),
      createdAt: now - minutesAgo * MINUTE_MS,
      status,
      random,
      riderId,
    })
    sequence += 1
    return order
  })

  const orders = [...active, ...history.orders].sort((a, b) => b.createdAt - a.createdAt)
  return { orders, nextSequence: sequence, random }
}
