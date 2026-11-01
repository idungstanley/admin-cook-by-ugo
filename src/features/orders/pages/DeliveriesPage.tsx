import { MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/button.styles'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage'
import { usePermission } from '@/hooks/usePermission'
import { formatPrice, pluralise } from '@/lib/format'
import { useOrders } from '@/services/orders/orders.queries'
import { useAuthStore } from '@/stores/auth.store'
import type { Order } from '@/types'
import { AdvanceOrderButton } from '../components/AdvanceOrderButton'
import { AllergyAlert, OrderStatusBadge } from '../components/OrderBadges'
import { isActiveOrder } from '../orders.utils'

const DeliveryCard = ({ order }: { order: Order }) => {
  const itemCount = order.items.reduce((sum, { quantity }) => sum + quantity, 0)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address}, ${order.postcode}`)}`

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl">{order.number}</h2>
          <p className="text-sm text-muted">
            {order.customerName} · {pluralise(itemCount, 'item')}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="font-semibold">
        {order.address}, {order.postcode}
      </p>
      {order.deliveryNote && <p className="text-sm text-muted">Note: {order.deliveryNote}</p>}
      {order.allergyNote && <AllergyAlert note={order.allergyNote} />}

      {order.paymentStatus === 'due' ? (
        <p className="rounded-xl bg-gold-soft px-3 py-2 font-display text-lg font-extrabold">
          Collect {formatPrice(order.total)}
        </p>
      ) : (
        <Badge tone="ewedu" className="self-start">
          Paid online
        </Badge>
      )}

      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${order.customerPhone.replace(/\s/g, '')}`}
          className={buttonStyles({ variant: 'outline' })}
        >
          <Phone className="size-4" /> Call
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({ variant: 'outline' })}
        >
          <MapPin className="size-4" /> Directions
        </a>
      </div>

      {order.status === 'out-for-delivery' ? (
        <AdvanceOrderButton order={order} size="lg" fullWidth />
      ) : (
        <p className="text-center text-sm text-muted">Waiting for the kitchen</p>
      )}
    </Card>
  )
}

export const DeliveriesPage = () => {
  const user = useAuthStore((state) => state.user)
  const seesAllRiders = usePermission('orders')
  const { data: orders, isPending, isError, refetch } = useOrders()

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const deliveries = orders.filter(
    (order) =>
      isActiveOrder(order) && order.riderId && (seesAllRiders || order.riderId === user?.id),
  )

  return (
    <>
      <PageHeader
        title={seesAllRiders ? 'Deliveries' : 'My deliveries'}
        description="Orders assigned for delivery."
      />
      {deliveries.length === 0 ? (
        <StatusMessage title="No deliveries right now" body="New assignments will show up here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {deliveries.map((order) => (
            <DeliveryCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  )
}
