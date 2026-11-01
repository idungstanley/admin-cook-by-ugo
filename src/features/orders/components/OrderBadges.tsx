import { TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from '@/constants/orders'
import type { Order } from '@/types'

export const OrderStatusBadge = ({ status }: Pick<Order, 'status'>) => {
  const { label, tone } = ORDER_STATUS_META[status]
  return <Badge tone={tone}>{label}</Badge>
}

export const PaymentBadge = ({ paymentStatus }: Pick<Order, 'paymentStatus'>) => {
  const { label, tone } = PAYMENT_STATUS_META[paymentStatus]
  return <Badge tone={tone}>{label}</Badge>
}

export const AllergyAlert = ({ note }: { note: string }) => (
  <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-[13px] font-bold text-jollof-dark">
    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
    <span>Allergy: {note}</span>
  </p>
)
