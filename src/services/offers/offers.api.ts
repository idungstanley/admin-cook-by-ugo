import { http } from '@/lib/http'
import type { Offer, OfferInput } from '@/types'

export const offersApi = {
  listOffers: () => http.get<Offer[]>('/offers'),
  saveOffer: ({ id, input }: { id?: string; input: OfferInput }) =>
    id ? http.put<Offer>(`/offers/${id}`, input) : http.post<Offer>('/offers', input),
  setActive: ({ id, active }: { id: string; active: boolean }) =>
    http.patch<Offer>(`/offers/${id}/active`, { active }),
  deleteOffer: (id: string) => http.delete<void>(`/offers/${id}`),
}
