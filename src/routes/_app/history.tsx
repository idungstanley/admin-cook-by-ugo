import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { OrderHistoryPage } from '@/features/orders/pages/OrderHistoryPage'

export const Route = createFileRoute('/_app/history')({
  beforeLoad: requirePermission('history'),
  head: () => ({ meta: [{ title: 'Order history · Cook by Ugo Admin' }] }),
  component: OrderHistoryPage,
})
