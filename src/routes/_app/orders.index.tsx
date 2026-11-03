import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { OrdersBoardPage } from '@/features/orders/pages/OrdersBoardPage'

export const Route = createFileRoute('/_app/orders/')({
  beforeLoad: requirePermission('orders'),
  head: () => ({ meta: [{ title: 'Live orders · Cooked by Ugo Admin' }] }),
  component: OrdersBoardPage,
})
