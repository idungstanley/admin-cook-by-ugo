import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import type { OrderItem } from '@/types'

interface OrderItemLinesProps {
  items: OrderItem[]
  /** Prices are left out on the kitchen board, where only what to cook matters. */
  showPrices?: boolean
  className?: string
}

/** Each dish, then each option on its own line, then the customer's note for that dish. */
export const OrderItemLines = ({ items, showPrices = true, className }: OrderItemLinesProps) => (
  <ul className={cn('flex flex-col', className)}>
    {items.map((item) => (
      <li key={item.id} className="border-b border-line py-2 text-sm last:border-b-0">
        <div className="flex justify-between gap-4">
          <span>
            <strong>{item.quantity} ×</strong> {item.name}
          </span>
          {showPrices && (
            <span className="font-semibold">
              {formatPrice((item.basePrice ?? item.unitPrice) * item.quantity)}
            </span>
          )}
        </div>
        {item.options?.length
          ? item.options.map((option) => (
              <div
                key={`${option.groupTitle}-${option.label}`}
                className="flex justify-between gap-4 pl-6 text-muted"
              >
                <span>+ {option.label}</span>
                {showPrices && (
                  <span>
                    {option.price ? formatPrice(option.price * item.quantity) : 'Included'}
                  </span>
                )}
              </div>
            ))
          : item.summary && <span className="block pl-6 text-xs text-muted">{item.summary}</span>}
        {item.note && (
          <p className="mt-1 rounded-lg bg-gold-soft px-2 py-1 text-xs font-semibold">
            Note: {item.note}
          </p>
        )}
      </li>
    ))}
  </ul>
)
