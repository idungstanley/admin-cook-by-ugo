import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { DeliveriesPage } from '@/features/orders/pages/DeliveriesPage'

export const Route = createFileRoute('/_app/deliveries')({
  beforeLoad: requirePermission('deliveries'),
  head: () => ({ meta: [{ title: 'Deliveries · Cooked by Ugo Admin' }] }),
  component: DeliveriesPage,
})
