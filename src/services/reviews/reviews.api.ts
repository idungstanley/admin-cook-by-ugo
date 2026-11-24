import { http } from '@/lib/http'
import type { Review, ReviewSummary } from '@/types'

export const reviewsApi = {
  listReviews: () => http.get<{ summary: ReviewSummary; reviews: Review[] }>('/reviews'),
  reply: ({ id, reply }: { id: string; reply: string }) =>
    http.patch<Review>(`/reviews/${id}/reply`, { reply }),
  importReview: (input: {
    displayName: string
    rating: number
    comment?: string
    source: string
    reviewedAt?: number
  }) => http.post<Review>('/reviews', input),
  deleteReview: (id: string) => http.delete<void>(`/reviews/${id}`),
  setHidden: ({ id, hidden }: { id: string; hidden: boolean }) =>
    http.patch<Review>(`/reviews/${id}/hidden`, { hidden }),
}
