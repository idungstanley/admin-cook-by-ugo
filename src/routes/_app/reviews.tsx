import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { ReviewsPage } from '@/features/reviews/ReviewsPage'

export const Route = createFileRoute('/_app/reviews')({
  beforeLoad: requirePermission('customers'),
  head: () => ({ meta: [{ title: 'Reviews · Cooked by Ugo Admin' }] }),
  component: ReviewsPage,
})
