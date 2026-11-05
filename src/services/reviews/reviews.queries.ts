import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { reviewsApi } from './reviews.api'

const invalidate = [queryKeys.reviews]

export const useReviews = () =>
  useQuery({ queryKey: queryKeys.reviews, queryFn: reviewsApi.listReviews })
export const useReplyToReview = () =>
  useAppMutation({ mutationFn: reviewsApi.reply, invalidate, success: 'Reply posted' })
export const useSetReviewHidden = () =>
  useAppMutation({
    mutationFn: reviewsApi.setHidden,
    invalidate,
    success: (review) => (review.hidden ? 'Review hidden from the website' : 'Review shown'),
  })
