import type { Order, Pence, PaymentMethod } from '@/types'

export interface DailyPoint {
  at: number
  sales: Pence
  orders: number
}

export interface TopDish {
  name: string
  quantity: number
  revenue: Pence
}

export interface MonthPoint {
  label: string
  orders: number
  /** Percentage change on the month before, or null when there is nothing to compare. */
  change: number | null
}

const netSales = (orders: Order[]) =>
  orders.reduce((sum, { total, refundedAmount }) => sum + total - refundedAmount, 0)

const addDays = (time: number, days: number) => {
  const date = new Date(time)
  date.setDate(date.getDate() + days)
  return date.getTime()
}

const startOfDay = (time: number) => new Date(time).setHours(0, 0, 0, 0)

export const percentChange = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100)

const DAY_MS = 86_400_000

/** Whole days from the start of `from` to the end of `to`, both included. */
export const daysBetween = (from: number, to: number) =>
  Math.max(1, Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS) + 1)

/** The last `days` days up to now. */
export const buildReport = (orders: Order[], days: number, now = Date.now()) =>
  buildReportBetween(orders, addDays(startOfDay(now), 1 - days), now)

/** Any period, compared with the same number of days just before it. */
export const buildReportBetween = (orders: Order[], from: number, to: number) => {
  const start = startOfDay(from)
  const end = Math.min(addDays(startOfDay(to), 1) - 1, Math.max(to, start))
  const days = daysBetween(start, end)
  const previousStart = addDays(start, -days)
  const counted = orders.filter(({ status }) => status !== 'cancelled')
  const current = counted.filter(({ createdAt }) => createdAt >= start && createdAt <= end)
  const previous = counted.filter(
    ({ createdAt }) => createdAt >= previousStart && createdAt < start,
  )

  const sales = netSales(current)
  const daily: DailyPoint[] = Array.from({ length: days }, (_, index) => {
    const at = addDays(start, index)
    const next = addDays(at, 1)
    const dayOrders = current.filter(({ createdAt }) => createdAt >= at && createdAt < next)
    return { at, sales: netSales(dayOrders), orders: dayOrders.length }
  })

  const dishTotals = new Map<string, TopDish>()
  current
    .flatMap(({ items }) => items)
    .forEach(({ name, quantity, unitPrice }) => {
      const entry = dishTotals.get(name) ?? { name, quantity: 0, revenue: 0 }
      dishTotals.set(name, {
        name,
        quantity: entry.quantity + quantity,
        revenue: entry.revenue + quantity * unitPrice,
      })
    })

  const salesBy = (method: PaymentMethod) =>
    netSales(current.filter(({ paymentMethod }) => paymentMethod === method))
  const discounted = current.filter(({ discount = 0 }) => discount > 0)

  return {
    sales,
    orderCount: current.length,
    averageOrder: current.length > 0 ? Math.round(sales / current.length) : 0,
    refunded: current.reduce((sum, { refundedAmount }) => sum + refundedAmount, 0),
    salesChange: percentChange(sales, netSales(previous)),
    orderChange: percentChange(current.length, previous.length),
    daily,
    topDishes: [...dishTotals.values()].sort((a, b) => b.quantity - a.quantity),
    payment: { card: salesBy('card'), onDelivery: salesBy('on-delivery') },
    offers: {
      orders: discounted.length,
      savings: discounted.reduce((sum, { discount = 0 }) => sum + discount, 0),
    },
    days,
  }
}

export const buildMonthlyGrowth = (
  orders: Order[],
  months: number,
  now = Date.now(),
): MonthPoint[] => {
  const current = new Date(now)
  const formatter = new Intl.DateTimeFormat('en-GB', { month: 'short' })

  const points = Array.from({ length: months }, (_, index) => {
    const from = new Date(current.getFullYear(), current.getMonth() - (months - 1 - index), 1)
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 1)
    return {
      label: formatter.format(from),
      orders: orders.filter(
        ({ createdAt, status }) =>
          status !== 'cancelled' && createdAt >= from.getTime() && createdAt < to.getTime(),
      ).length,
    }
  })

  return points.map((point, index) => ({
    ...point,
    change: index === 0 ? null : percentChange(point.orders, points[index - 1]?.orders ?? 0),
  }))
}

/** Rounds a chart maximum up to a tidy number, so the axis reads cleanly. */
export const niceMax = (value: number) => {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10
  return step * magnitude
}
