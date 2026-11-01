import type { Customer, CustomerSummary, Order } from '@/types'

export const summariseCustomers = (customers: Customer[], orders: Order[]): CustomerSummary[] =>
  customers.map((customer) => {
    const own = orders.filter(
      ({ customerId, status }) => customerId === customer.id && status !== 'cancelled',
    )

    return {
      ...customer,
      orderCount: own.length,
      totalSpent: own.reduce((sum, { total, refundedAmount }) => sum + total - refundedAmount, 0),
      lastOrderAt: own.length > 0 ? Math.max(...own.map(({ createdAt }) => createdAt)) : undefined,
    }
  })
