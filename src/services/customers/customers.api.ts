import { http } from '@/lib/http'
import type { CustomerSummary } from '@/types'

export const customersApi = {
  listCustomers: () => http.get<CustomerSummary[]>('/customers'),
  setBlocked: ({ id, ...input }: { id: string; blocked: boolean; reason?: string }) =>
    http.patch<void>(`/customers/${id}/block`, input),
  deleteData: (id: string) => http.delete<void>(`/customers/${id}/data`),
}
