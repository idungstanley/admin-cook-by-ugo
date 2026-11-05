import { formatDateTime, formatPrice, formatTime } from '@/lib/format'
import { useContent } from '@/services/content/content.queries'
import type { Order } from '@/types'
import { dueAt, readyBy } from '../orders.utils'

const PAYMENT_LABELS: Record<Order['paymentStatus'], string> = {
  pending: 'Awaiting card payment',
  paid: 'Paid by card',
  due: 'To collect on delivery',
  'partially-refunded': 'Paid, partly refunded',
  refunded: 'Refunded',
}

const Line = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={bold ? 'flex justify-between text-base font-bold' : 'flex justify-between'}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

const Divider = () => <hr className="my-2 border-t border-dashed border-black" />

/**
 * The printed receipt, sized for an 80mm till roll and fine on A4 too. Only visible when
 * printing, from the Print receipt button.
 */
export const KitchenTicket = ({ order }: { order: Order }) => {
  const { data: content } = useContent()
  const offer = order.appliedOffers?.find(({ discount }) => discount > 0)

  return (
    <section className="mx-auto hidden w-full max-w-[80mm] font-mono text-[12px] leading-snug text-black print:block">
      <header className="text-center">
        <img src="/logo.svg" alt="" className="mx-auto size-16" />
        <p className="text-base font-bold">Cooked by Ugo</p>
        {content && (
          <p>
            {content.phone} · {content.email}
          </p>
        )}
      </header>
      <Divider />

      <p className="text-center text-2xl font-bold">{order.number}</p>
      <p className="text-center">Placed {formatDateTime(order.createdAt)}</p>
      <p className="mt-1 border-2 border-black py-1 text-center text-base font-bold">
        {order.scheduledFor ? 'SCHEDULED' : 'ASAP'} · Due {formatTime(dueAt(order))}
        <span className="block text-[12px] font-normal">Ready by {formatTime(readyBy(order))}</span>
      </p>

      {order.allergyNote && (
        <p className="mt-2 border-2 border-black p-1.5 text-base font-bold">
          ALLERGY: {order.allergyNote}
        </p>
      )}
      <Divider />

      <ul>
        {order.items.map((item) => (
          <li key={item.id} className="mb-1.5">
            <Line
              bold
              label={`${item.quantity} × ${item.name}`}
              value={formatPrice((item.basePrice ?? item.unitPrice) * item.quantity)}
            />
            {item.options?.length
              ? item.options.map((option) => (
                  <Line
                    key={`${option.groupTitle}-${option.label}`}
                    label={`   + ${option.label}`}
                    value={option.price ? formatPrice(option.price * item.quantity) : ''}
                  />
                ))
              : item.summary && <p className="pl-3">{item.summary}</p>}
            {item.note && <p className="pl-3 font-bold">» {item.note}</p>}
          </li>
        ))}
      </ul>
      <Divider />

      <Line label="Subtotal" value={formatPrice(order.subtotal)} />
      {order.discount ? (
        <Line label={offer?.name ?? 'Offer'} value={`−${formatPrice(order.discount)}`} />
      ) : null}
      <Line label="Delivery" value={order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'} />
      {order.refundedAmount > 0 && (
        <Line label="Refunded" value={`−${formatPrice(order.refundedAmount)}`} />
      )}
      <Line bold label="TOTAL" value={formatPrice(order.total)} />
      <p className="mt-1 text-center font-bold">{PAYMENT_LABELS[order.paymentStatus]}</p>
      <Divider />

      <p className="font-bold">Deliver to</p>
      <p>{order.customerName}</p>
      <p>{order.customerPhone}</p>
      <p>
        {order.address}, {order.postcode}
      </p>
      {order.distanceMiles !== undefined && <p>{order.distanceMiles} miles from the kitchen</p>}
      {order.deliveryNote && <p className="mt-1 font-bold">Note: {order.deliveryNote}</p>}
      <Divider />

      <p className="text-center">Thank you for ordering. Enjoy your meal!</p>
    </section>
  )
}
