import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckboxField, TextAreaField } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Overlay'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import { useRequestChanges } from '@/services/orders/orders.queries'
import type { Order } from '@/types'

interface UpdateOrderDialogProps {
  order: Order
  open: boolean
  onClose: () => void
}

const UpdateForm = ({ order, onClose }: Omit<UpdateOrderDialogProps, 'open'>) => {
  const requestChanges = useRequestChanges()
  const [outOfStock, setOutOfStock] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [markSoldOut, setMarkSoldOut] = useState(true)

  const toggle = (itemId: string, inStock: boolean) =>
    setOutOfStock((current) =>
      inStock ? current.filter((id) => id !== itemId) : [...current, itemId],
    )

  const send = () =>
    requestChanges.mutate(
      { orderId: order.id, itemIds: outOfStock, message: message.trim() || undefined, markSoldOut },
      { onSuccess: onClose },
    )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-xl">Update {order.number}</h2>
        <p className="text-sm text-muted">
          Switch off anything you have run out of. The customer gets an email and can remove it,
          swap it for something else, or cancel. Delivery is not charged again.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
        {order.items.map((item) => {
          const inStock = !outOfStock.includes(item.id)
          return (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className={cn('min-w-0 flex-1', !inStock && 'text-muted line-through')}>
                <p className="font-semibold">
                  {item.quantity} × {item.name}
                </p>
                {item.options?.length ? (
                  <p className="text-xs">{item.options.map(({ label }) => label).join(' · ')}</p>
                ) : null}
                <p className="text-xs">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
              <span
                className={cn(
                  'w-20 text-right text-xs font-bold',
                  inStock ? 'text-ewedu' : 'text-jollof-dark',
                )}
              >
                {inStock ? 'In stock' : 'Out of stock'}
              </span>
              <Toggle
                label={`${item.name} in stock`}
                checked={inStock}
                onChange={(checked) => toggle(item.id, checked)}
              />
            </li>
          )
        })}
      </ul>

      <TextAreaField
        label="Message to the customer (optional)"
        placeholder="Sorry, the egusi has just run out today."
        rows={2}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <CheckboxField
        label="Also mark these dishes sold out on the menu"
        checked={markSoldOut}
        onChange={(event) => setMarkSoldOut(event.target.checked)}
      />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Not now
        </Button>
        <Button disabled={outOfStock.length === 0 || requestChanges.isPending} onClick={send}>
          Send to customer
        </Button>
      </div>
    </div>
  )
}

export const UpdateOrderDialog = ({ order, open, onClose }: UpdateOrderDialogProps) => (
  <Modal open={open} onClose={onClose} label="Update order">
    {open && <UpdateForm order={order} onClose={onClose} />}
  </Modal>
)
