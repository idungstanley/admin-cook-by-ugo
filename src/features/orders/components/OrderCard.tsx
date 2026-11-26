import { Link, useNavigate } from '@tanstack/react-router'
import { Clock, MapPin, Phone } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatAge, formatPrice, formatTime } from '@/lib/format'
import type { Order } from '@/types'
import { dueAt, isOverdue, readyBy, waitingIds } from '../orders.utils'
import { AdvanceOrderButton } from './AdvanceOrderButton'
import { NewOrderActions } from './NewOrderActions'
import { AllergyAlert } from './OrderBadges'
import { OrderItemLines } from './OrderItemLines'

export const OrderCard = ({ order }: { order: Order }) => {
  const overdue = isOverdue(order)
  const navigate = useNavigate()

  // A tap anywhere on the ticket opens the full order, except on its buttons and links.
  const openOrder = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('button, a, [role="dialog"]')) return
    void navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
  }

  return (
    <article
      onClick={openOrder}
      className={cn(
        'cursor-pointer rounded-2xl bg-paper p-3.5 shadow-sm transition hover:shadow-md',
        overdue && 'ring-2 ring-jollof',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/orders/$orderId"
          params={{ orderId: order.id }}
          className="font-display text-lg font-extrabold tracking-tight hover:text-jollof"
        >
          {order.number}
        </Link>
        <p className="text-right font-display font-extrabold">{formatPrice(order.total)}</p>
      </div>
      <p className="text-[13px] font-semibold">{order.customerName}</p>
      <p className="mt-0.5 flex items-start gap-1 text-xs text-muted">
        <MapPin className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          {order.address}, {order.postcode}
        </span>
      </p>
      <a
        href={`tel:${order.customerPhone.replace(/\s/g, '')}`}
        className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-cocoa"
      >
        <Phone className="size-3.5" aria-hidden />
        {order.customerPhone}
      </a>

      <OrderItemLines items={order.items} unavailableIds={waitingIds(order)} className="my-1.5" />

      {order.allergyNote && <AllergyAlert note={order.allergyNote} />}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {order.scheduledFor ? 'For' : 'Due'} {formatTime(dueAt(order))} · ready by{' '}
          {formatTime(readyBy(order))}
          <span className="text-muted/70">({formatAge(order.createdAt)})</span>
        </span>
        {overdue && <Badge tone="jollof">Overdue</Badge>}
        {order.paymentStatus === 'due' && (
          <Badge tone="gold">Collect {formatPrice(order.total)}</Badge>
        )}
      </div>

      <p className="mt-2 text-xs font-semibold text-jollof">Tap for full details</p>

      {order.status !== 'delivered' && (
        <div className="mt-3">
          {['received', 'awaiting-customer'].includes(order.status) ? (
            <NewOrderActions order={order} fullWidth />
          ) : (
            <AdvanceOrderButton order={order} size="md" fullWidth />
          )}
        </div>
      )}
    </article>
  )
}
