import { summariseCustomers } from '@/features/customers/customers.utils'
import { db } from '@/mocks/db'
import { findOrThrow, mockRequest } from '@/services/mockClient'

export const customersApi = {
  listCustomers: () => mockRequest(() => summariseCustomers(db.customers, db.orders)),

  setBlocked: ({ id, blocked, reason }: { id: string; blocked: boolean; reason?: string }) =>
    mockRequest(() => {
      Object.assign(findOrThrow(db.customers, id, 'Customer'), { blocked, blockReason: reason })
    }),

  /** Personal details are removed, while order totals stay for the accounts. */
  deleteData: (id: string) =>
    mockRequest(() => {
      Object.assign(findOrThrow(db.customers, id, 'Customer'), {
        name: 'Deleted customer',
        email: '',
        phone: '',
        marketingOptIn: false,
        deleted: true,
      })
      db.orders
        .filter((order) => order.customerId === id)
        .forEach((order) =>
          Object.assign(order, {
            customerName: 'Deleted customer',
            customerEmail: '',
            customerPhone: '',
            address: '',
            postcode: '',
          }),
        )
    }),
}
