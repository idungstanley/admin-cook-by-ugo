import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'

const OrderRoute = () => {
  const { orderId } = Route.useParams()
  return <OrderDetailPage key={orderId} orderId={orderId} />
}

export const Route = createFileRoute('/_app/orders/$orderId')({
  beforeLoad: requirePermission('orders'),
  head: () => ({ meta: [{ title: 'Order · Cook by Ugo Admin' }] }),
  component: OrderRoute,
})
