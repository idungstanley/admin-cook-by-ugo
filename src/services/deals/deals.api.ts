import { http } from '@/lib/http'
import type { Deal } from '@/types'

export type DealInput = Omit<Deal, 'id'>

export const dealsApi = {
  listDeals: () => http.get<Deal[]>('/deals'),
  saveDeal: ({ id, input }: { id?: string; input: DealInput }) =>
    id ? http.put<Deal>(`/deals/${id}`, input) : http.post<Deal>('/deals', input),
  setActive: ({ id, active }: { id: string; active: boolean }) =>
    http.patch<Deal>(`/deals/${id}/active`, { active }),
  deleteDeal: (id: string) => http.delete<void>(`/deals/${id}`),
}
