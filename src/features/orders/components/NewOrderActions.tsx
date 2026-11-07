import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { usePermission } from '@/hooks/usePermission'
import type { Order } from '@/types'
import { AdvanceOrderButton } from './AdvanceOrderButton'
import { CancelOrderDialog } from './OrderDialogs'
import { UpdateOrderDialog } from './UpdateOrderDialog'

interface NewOrderActionsProps {
  order: Order
  fullWidth?: boolean
}

/**
 * Accept, update or reject a new order. Update is for when something has run out; reject
 * cancels and refunds, for example an address we cannot deliver to.
 */
export const NewOrderActions = ({ order, fullWidth }: NewOrderActionsProps) => {
  const canReject = usePermission('refunds')
  const [dialog, setDialog] = useState<'update' | 'reject' | null>(null)
  const close = () => setDialog(null)
  const canUpdate = ['received', 'preparing'].includes(order.status)

  if (order.status === 'awaiting-customer') {
    return (
      <p className="rounded-xl bg-indigo-soft px-3 py-2 text-xs font-semibold text-indigo">
        Waiting for the customer to remove, swap or cancel the unavailable items.
      </p>
    )
  }

  return (
    <>
      <div className={fullWidth ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
        <AdvanceOrderButton order={order} fullWidth={fullWidth} />
        {canUpdate && (
          <div className={fullWidth ? 'grid grid-cols-2 gap-2' : 'flex gap-2'}>
            <Button variant="outline" size="sm" onClick={() => setDialog('update')}>
              Update
            </Button>
            {canReject && order.status === 'received' && (
              <Button variant="danger" size="sm" onClick={() => setDialog('reject')}>
                Reject
              </Button>
            )}
          </div>
        )}
      </div>
      <UpdateOrderDialog order={order} open={dialog === 'update'} onClose={close} />
      <CancelOrderDialog order={order} open={dialog === 'reject'} onClose={close} />
    </>
  )
}
