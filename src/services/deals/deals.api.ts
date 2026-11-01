import { db } from '@/mocks/db'
import { createId, findOrThrow, mockRequest } from '@/services/mockClient'
import type { Deal } from '@/types'

export type DealInput = Omit<Deal, 'id'>

export const dealsApi = {
  listDeals: () => mockRequest(() => db.deals),

  saveDeal: ({ id, input }: { id?: string; input: DealInput }) =>
    mockRequest(() => {
      if (id) Object.assign(findOrThrow(db.deals, id, 'Deal'), input)
      else db.deals.push({ ...input, id: createId('deal') })
    }),

  setActive: ({ id, active }: { id: string; active: boolean }) =>
    mockRequest(() => {
      findOrThrow(db.deals, id, 'Deal').active = active
    }),

  deleteDeal: (id: string) =>
    mockRequest(() => {
      db.deals = db.deals.filter((deal) => deal.id !== id)
    }),
}
