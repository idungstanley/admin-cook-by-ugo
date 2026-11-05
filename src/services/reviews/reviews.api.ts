import { http } from '@/lib/http'
import type { Review, ReviewSummary } from '@/types'

export const reviewsApi = {
  listReviews: () => http.get<{ summary: ReviewSummary; reviews: Review[] }>('/reviews'),
  reply: ({ id, reply }: { id: string; reply: string }) =>
    http.patch<Review>(`/reviews/${id}/reply`, { reply }),
  setHidden: ({ id, hidden }: { id: string; hidden: boolean }) =>
    http.patch<Review>(`/reviews/${id}/hidden`, { hidden }),
}
