import { Link } from '@tanstack/react-router'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatAge, formatPrice, formatTime } from '@/lib/format'
import type { Order } from '@/types'
import { isOverdue } from '../orders.utils'
import { AdvanceOrderButton } from './AdvanceOrderButton'
import { AllergyAlert } from './OrderBadges'

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

      <ul className="my-2.5 flex flex-col gap-1 text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="font-bold">{item.quantity} ×</span> {item.name}
            {item.summary && <span className="block pl-6 text-xs text-muted">{item.summary}</span>}
          </li>
        ))}
      </ul>

      {order.allergyNote && <AllergyAlert note={order.allergyNote} />}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {order.scheduledFor
            ? `For ${formatTime(order.scheduledFor)}`
            : formatAge(order.createdAt)}
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
