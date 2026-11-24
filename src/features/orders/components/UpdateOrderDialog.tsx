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

/** A whole dish is flagged by its line id; a single side or option on it by `line-1#0`. */
const optionKey = (lineId: string, index: number) => `${lineId}#${index}`

interface StockRowProps {
  label: string
  detail: string
  inStock: boolean
  disabled?: boolean
  nested?: boolean
  onChange: (inStock: boolean) => void
}

const StockRow = ({ label, detail, inStock, disabled, nested, onChange }: StockRowProps) => (
  <li className={cn('flex items-center gap-3 py-2.5', nested ? 'pl-9 pr-4' : 'px-4')}>
    <div className={cn('min-w-0 flex-1', !inStock && 'text-muted line-through')}>
      <p className={nested ? 'text-sm' : 'font-semibold'}>{label}</p>
      <p className="text-xs">{detail}</p>
    </div>
    <span
      className={cn(
        'w-20 text-right text-xs font-bold',
        inStock ? 'text-ewedu' : 'text-jollof-dark',
      )}
    >
      {inStock ? 'In stock' : 'Out of stock'}
    </span>
    <Toggle label={`${label} in stock`} checked={inStock} disabled={disabled} onChange={onChange} />
  </li>
)

const UpdateForm = ({ order, onClose }: Omit<UpdateOrderDialogProps, 'open'>) => {
  const requestChanges = useRequestChanges()
  const [outOfStock, setOutOfStock] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [markSoldOut, setMarkSoldOut] = useState(true)

  const toggle = (key: string, inStock: boolean) =>
    setOutOfStock((current) => (inStock ? current.filter((id) => id !== key) : [...current, key]))

  /** A dish that is off takes its options with it, so they are not flagged twice. */
  const flagged = outOfStock.filter((key) => {
    const [lineId] = key.split('#')
    return key === lineId || !outOfStock.includes(lineId ?? '')
  })

  const send = () =>
    requestChanges.mutate(
      { orderId: order.id, itemIds: flagged, message: message.trim() || undefined, markSoldOut },
      { onSuccess: onClose },
    )

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-xl">Update {order.number}</h2>
        <p className="text-sm text-muted">
          Switch off anything you have run out of: a whole dish, or just one side on it. The
          customer gets an email and can remove it, swap it or cancel. Delivery is not charged
          again.
        </p>
      </div>

      <ul className="flex max-h-[50vh] flex-col divide-y divide-line overflow-y-auto rounded-2xl border border-line">
        {order.items.map((item) => {
          const dishInStock = !outOfStock.includes(item.id)
          return (
            <li key={item.id}>
              <ul>
                <StockRow
                  label={`${item.quantity} × ${item.name}`}
                  detail={formatPrice((item.basePrice ?? item.unitPrice) * item.quantity)}
                  inStock={dishInStock}
                  onChange={(inStock) => toggle(item.id, inStock)}
                />
                {(item.options ?? []).map((option, index) => {
                  const key = optionKey(item.id, index)
                  return (
                    <StockRow
                      key={key}
                      nested
                      label={`+ ${option.label}`}
                      detail={
                        option.price
                          ? formatPrice(option.price * item.quantity)
                          : `${option.groupTitle} · included`
                      }
                      inStock={dishInStock && !outOfStock.includes(key)}
                      disabled={!dishInStock}
                      onChange={(inStock) => toggle(key, inStock)}
                    />
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>

      <TextAreaField
        label="Message to the customer (optional)"
        placeholder="Sorry, the plantain has just run out today."
        rows={2}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <CheckboxField
        label="Also mark whole dishes that ran out as sold out on the menu"
        checked={markSoldOut}
        onChange={(event) => setMarkSoldOut(event.target.checked)}
      />

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Not now
        </Button>
        <Button disabled={flagged.length === 0 || requestChanges.isPending} onClick={send}>
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
