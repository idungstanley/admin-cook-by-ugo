import { Link } from '@tanstack/react-router'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatAge, formatPrice, formatTime } from '@/lib/format'
import type { Order } from '@/types'
import { dueAt, isOverdue, readyBy } from '../orders.utils'
import { AdvanceOrderButton } from './AdvanceOrderButton'
import { AllergyAlert } from './OrderBadges'
import { OrderItemLines } from './OrderItemLines'

export const OrderCard = ({ order }: { order: Order }) => {
  const overdue = isOverdue(order)

  return (
    <article
      className={cn('rounded-2xl bg-paper p-3.5 shadow-sm', overdue && 'ring-2 ring-jollof')}
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
      <p className="text-[13px] text-muted">{order.customerName}</p>

      <OrderItemLines items={order.items} showPrices={false} className="my-1.5" />

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

      {order.status !== 'delivered' && (
        <div className="mt-3">
          <AdvanceOrderButton order={order} size="md" fullWidth />
        </div>
      )}
    </article>
  )
}
