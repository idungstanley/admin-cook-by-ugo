import { db } from '@/mocks/db'
import { findOrThrow, mockRequest } from '@/services/mockClient'
import type { EnquiryStatus, SiteContent } from '@/types'

export const contentApi = {
  getContent: () => mockRequest(() => db.content),
  saveContent: (input: SiteContent) =>
    mockRequest(() => {
      db.content = input
    }),
  listEnquiries: () => mockRequest(() => db.enquiries),
  setEnquiryStatus: ({ id, status }: { id: string; status: EnquiryStatus }) =>
    mockRequest(() => {
      findOrThrow(db.enquiries, id, 'Enquiry').status = status
    }),
}
