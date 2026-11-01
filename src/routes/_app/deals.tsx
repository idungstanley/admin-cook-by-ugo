import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { DealsPage } from '@/features/deals/DealsPage'

export const Route = createFileRoute('/_app/deals')({
  beforeLoad: requirePermission('deals'),
  head: () => ({ meta: [{ title: 'Deals · Cook by Ugo Admin' }] }),
  component: DealsPage,
})
