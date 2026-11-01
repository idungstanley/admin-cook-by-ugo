import { describe, expect, it } from 'vitest'
import { toCsv } from '@/lib/csv'
import type { Order } from '@/types'
import {
  applyRefund,
  filterOrders,
  getBoardOrders,
  getRefundableAmount,
  isOverdue,
} from './orders.utils'

const NOW = new Date('2026-11-01T18:00:00').getTime()

const order = (overrides: Partial<Order> = {}): Order => ({
  id: '1',
  number: 'UGO-1001',
  customerId: 'c1',
  customerName: 'Test Customer',
  customerPhone: '07700 900100',
  customerEmail: 'test@example.com',
  address: '1 Test Street',
  postcode: 'NE1 4ST',
  items: [],
  subtotal: 3000,
  deliveryFee: 0,
  total: 3000,
  paymentMethod: 'card',
  paymentStatus: 'paid',
  refundedAmount: 0,
  etaMinutes: 40,
  status: 'preparing',
  createdAt: NOW,
  events: [],
  ...overrides,
})

describe('refunds', () => {
  it('tracks partial then full refunds', () => {
    const first = applyRefund(order(), 1000)
    expect(first).toEqual({ refundedAmount: 1000, paymentStatus: 'partially-refunded' })
    expect(applyRefund(order(first), 2000)).toEqual({
      refundedAmount: 3000,
      paymentStatus: 'refunded',
    })
  })

  it('never refunds more than was paid', () => {
    expect(() =>
      applyRefund(order({ refundedAmount: 2500, paymentStatus: 'partially-refunded' }), 501),
    ).toThrow()
  })

  it('has nothing to refund on unpaid or pay-on-delivery orders', () => {
    expect(getRefundableAmount(order({ paymentMethod: 'on-delivery', paymentStatus: 'due' }))).toBe(
      0,
    )
    expect(
      getRefundableAmount(order({ paymentMethod: 'on-delivery', paymentStatus: 'paid' })),
    ).toBe(0)
  })
})

describe('board', () => {
  it('flags active orders past their ETA only', () => {
    const late = NOW - 41 * 60_000
    expect(isOverdue(order({ createdAt: late }), NOW)).toBe(true)
    expect(isOverdue(order({ createdAt: late, status: 'delivered' }), NOW)).toBe(false)
  })

  it('drops older delivered orders and puts the oldest ticket first', () => {
    const orders = [
      order({ id: 'new', status: 'delivered', createdAt: NOW - 60_000 }),
      order({ id: 'old', status: 'delivered', createdAt: NOW - 3_600_000 }),
      order({ id: 'gone', status: 'delivered', createdAt: NOW - 4 * 3_600_000 }),
    ]
    expect(getBoardOrders(orders, ['delivered'], NOW).map(({ id }) => id)).toEqual(['old', 'new'])
  })
})

describe('history', () => {
  it('filters by search, status and inclusive dates', () => {
    const orders = [order(), order({ id: '2', number: 'UGO-2002', status: 'delivered' })]
    const base = { search: '', status: 'all' as const, from: '', to: '' }

    expect(filterOrders(orders, { ...base, search: 'ugo-2002' })).toHaveLength(1)
    expect(filterOrders(orders, { ...base, status: 'delivered' })).toHaveLength(1)
    expect(filterOrders(orders, { ...base, from: '2026-11-01', to: '2026-11-01' })).toHaveLength(2)
    expect(filterOrders(orders, { ...base, to: '2026-10-31' })).toHaveLength(0)
  })

  it('escapes commas and quotes in CSV', () => {
    expect(toCsv(['a'], [['1 High St, "Flat 2"']])).toBe('a\n"1 High St, ""Flat 2"""')
  })
})
