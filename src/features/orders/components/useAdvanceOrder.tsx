import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
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
import { useAuthStore } from '@/stores/auth.store'
import type { Order } from '@/types'

interface AdvanceOrder {
  next: (typeof NEXT_STATUS)[keyof typeof NEXT_STATUS]
  advance: () => void
  pending: boolean
  /** The rider and payment questions. Render these wherever `advance` is used. */
  dialogs: ReactNode
}

/**
 * Moves an order on one stage. It asks for a rider before an order leaves the kitchen, and how
 * it was paid before a pay-on-delivery order closes. `onFinish` runs once the move is done or
 * a question is dismissed, which the board uses after a ticket is dropped.
 */
export const useAdvanceOrder = (order: Order, onFinish?: () => void): AdvanceOrder => {
  const [dialog, setDialog] = useState<'rider' | 'collect' | null>(null)
  const closeDialog = () => {
    setDialog(null)
    onFinish?.()
  }
  const updateStatus = useUpdateOrderStatus()
  const recordCollection = useRecordCollection()
  const assignRider = useAssignRider()
  const { data: riders } = useRiders()
  const user = useAuthStore((state) => state.user)
  const next = NEXT_STATUS[order.status]

  const moveOn = () => {
    if (next)
      updateStatus.mutate({ orderId: order.id, status: next.status }, { onSettled: onFinish })
  }

  const advance = () => {
    if (!next) return onFinish?.()
    if (next.status === 'delivered' && order.paymentStatus === 'due') setDialog('collect')
    else if (next.status === 'out-for-delivery' && !order.riderId) setDialog('rider')
    else moveOn()
  }

  const sendWithRider = (riderId: string) =>
    assignRider.mutate(
      { orderId: order.id, riderId },
      {
        onSuccess: () => {
          setDialog(null)
          moveOn()
        },
      },
    )

  const collect = (collectedBy: 'cash' | 'card') =>
    recordCollection.mutate({ orderId: order.id, collectedBy }, { onSuccess: closeDialog })

  const dialogs = (
    <>
      <Modal open={dialog === 'rider'} onClose={closeDialog} label="Choose a rider">
        <div className="p-6">
          <h2 className="text-xl">Who is taking {order.number}?</h2>
          <p className="mt-1 text-sm text-muted">
            Choose who is taking it out. They will see it under My deliveries, and the customer gets
            an &ldquo;on its way&rdquo; email.
          </p>
          {riders?.length === 0 && (
            <p className="mt-2 rounded-xl bg-shea px-3 py-2 text-sm">
              No riders yet. Tap <strong>I&apos;ll deliver it myself</strong> to send it now, or{' '}
              <Link to="/staff" className="font-semibold text-jollof underline">
                add a rider
              </Link>{' '}
              in Staff and roles.
            </p>
          )}
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
            {user && !riders?.some(({ id }) => id === user.id) && (
              <Button
                variant="outline"
                size="lg"
                disabled={assignRider.isPending}
                onClick={() => sendWithRider(user.id)}
              >
                I&apos;ll deliver it myself
              </Button>
            )}
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

  return { next, advance, pending: updateStatus.isPending, dialogs }
}
