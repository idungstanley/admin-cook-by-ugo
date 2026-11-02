import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Overlay'
import { NEXT_STATUS } from '@/constants/orders'
import { formatPrice } from '@/lib/format'
import {
  useAssignRider,
  useRecordCollection,
  useUpdateOrderStatus,
} from '@/services/orders/orders.queries'
import { useRiders } from '@/services/staff/staff.queries'
import type { Order } from '@/types'

interface AdvanceOrderButtonProps {
  order: Order
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

/**
 * Moves an order on one stage. It asks for a rider before an order leaves the kitchen, and how
 * it was paid before a pay-on-delivery order closes.
 */
export const AdvanceOrderButton = ({ order, size = 'md', fullWidth }: AdvanceOrderButtonProps) => {
  const [dialog, setDialog] = useState<'rider' | 'collect' | null>(null)
  const closeDialog = () => setDialog(null)
  const updateStatus = useUpdateOrderStatus()
  const recordCollection = useRecordCollection()
  const assignRider = useAssignRider()
  const { data: riders } = useRiders()
  const next = NEXT_STATUS[order.status]

  if (!next) return null

  const moveOn = () => updateStatus.mutate({ orderId: order.id, status: next.status })

  const advance = () => {
    if (next.status === 'delivered' && order.paymentStatus === 'due') setDialog('collect')
    else if (next.status === 'out-for-delivery' && !order.riderId) setDialog('rider')
    else moveOn()
  }

  const sendWithRider = (riderId: string) =>
    assignRider.mutate(
      { orderId: order.id, riderId },
      {
        onSuccess: () => {
          closeDialog()
          moveOn()
        },
      },
    )

  const collect = (collectedBy: 'cash' | 'card') =>
    recordCollection.mutate({ orderId: order.id, collectedBy }, { onSuccess: closeDialog })

  return (
    <>
      <Button size={size} fullWidth={fullWidth} disabled={updateStatus.isPending} onClick={advance}>
        {next.action}
      </Button>
      <Modal open={dialog === 'rider'} onClose={closeDialog} label="Choose a rider">
        <div className="p-6">
          <h2 className="text-xl">Who is taking {order.number}?</h2>
          <div className="mt-4 flex flex-col gap-2">
            {riders?.map(({ id, name }) => (
              <Button
                key={id}
                variant="dark"
                size="lg"
                disabled={assignRider.isPending}
                onClick={() => sendWithRider(id)}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
      <Modal open={dialog === 'collect'} onClose={closeDialog} label="Record payment">
        <div className="p-6">
          <h2 className="text-xl">How was {formatPrice(order.total)} paid?</h2>
          <p className="mt-1 text-sm text-muted">
            Order {order.number} will be marked as delivered.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              variant="dark"
              size="lg"
              disabled={recordCollection.isPending}
              onClick={() => collect('cash')}
            >
              Cash
            </Button>
            <Button
              variant="dark"
              size="lg"
              disabled={recordCollection.isPending}
              onClick={() => collect('card')}
            >
              Card
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
