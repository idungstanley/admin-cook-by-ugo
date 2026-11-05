import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { OffersPage } from '@/features/offers/OffersPage'

export const Route = createFileRoute('/_app/offers')({
  beforeLoad: requirePermission('deals'),
  head: () => ({ meta: [{ title: 'Offers · Cooked by Ugo Admin' }] }),
  component: OffersPage,
})
