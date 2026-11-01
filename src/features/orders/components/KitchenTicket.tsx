import { formatDateTime } from '@/lib/format'
import type { Order } from '@/types'

/** Only visible when printing. */
export const KitchenTicket = ({ order }: { order: Order }) => (
  <section className="hidden font-body text-black print:block">
    <h1 className="text-3xl">{order.number}</h1>
    <p>{formatDateTime(order.createdAt)}</p>
    {order.allergyNote && (
      <p className="my-3 border-2 border-black p-2 text-lg font-bold">
        ALLERGY: {order.allergyNote}
      </p>
    )}
    <ul className="my-4 text-lg">
      {order.items.map((item) => (
        <li key={item.id} className="mb-2">
          <strong>{item.quantity} ×</strong> {item.name}
          {item.summary && <span className="block text-sm">{item.summary}</span>}
        </li>
      ))}
    </ul>
    {order.deliveryNote && <p>Note: {order.deliveryNote}</p>}
    <p className="mt-3">
      {order.customerName}, {order.postcode}
    </p>
  </section>
)
