import { describe, expect, it } from 'vitest'
import type { Order } from '@/types'
import { buildMonthlyGrowth, buildReport, niceMax, percentChange } from './reports.utils'

const NOW = new Date('2026-11-15T18:00:00').getTime()
const DAY = 86_400_000

const order = (overrides: Partial<Order>): Order =>
  ({
    total: 2000,
    refundedAmount: 0,
    status: 'delivered',
    paymentMethod: 'card',
    createdAt: NOW,
    items: [{ id: '1', name: 'Chapman', quantity: 2, unitPrice: 349 }],
    ...overrides,
  }) as Order

describe('buildReport', () => {
  it('counts net sales, and leaves out cancelled and out-of-range orders', () => {
    const report = buildReport(
      [
        order({ refundedAmount: 500 }),
        order({ paymentMethod: 'on-delivery' }),
        order({ status: 'cancelled' }),
        order({ createdAt: NOW - 8 * DAY }),
      ],
      7,
      NOW,
    )

    expect(report.sales).toBe(3500)
    expect(report.orderCount).toBe(2)
    expect(report.averageOrder).toBe(1750)
    expect(report.refunded).toBe(500)
    expect(report.payment).toEqual({ card: 1500, onDelivery: 2000 })
    expect(report.topDishes[0]).toEqual({ name: 'Chapman', quantity: 4, revenue: 1396 })
  })

  it('has one point per day, ending today', () => {
    const { daily } = buildReport([order({})], 7, NOW)
    expect(daily).toHaveLength(7)
    expect(daily.at(-1)?.orders).toBe(1)
  })

  it('compares with the period before', () => {
    const report = buildReport(
      [order({}), order({ createdAt: NOW - 8 * DAY, total: 1000 })],
      7,
      NOW,
    )
    expect(report.salesChange).toBe(100)
  })
})

describe('helpers', () => {
  it('reports no change when there is nothing to compare', () => {
    expect(percentChange(5, 0)).toBeNull()
  })

  it('builds monthly points with change', () => {
    const points = buildMonthlyGrowth(
      [order({}), order({}), order({ createdAt: NOW - 30 * DAY })],
      2,
      NOW,
    )
    expect(points.map(({ orders }) => orders)).toEqual([1, 2])
    expect(points[1]?.change).toBe(100)
  })

  it('rounds chart maximums up', () => {
    expect(niceMax(0)).toBe(1)
    expect(niceMax(170)).toBe(200)
    expect(niceMax(2400)).toBe(2500)
  })
})
