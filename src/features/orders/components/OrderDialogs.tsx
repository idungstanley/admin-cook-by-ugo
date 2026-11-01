import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Overlay'
import { useActorName } from '@/hooks/useActorName'
import { formatPrice, penceToPounds, poundsToPence } from '@/lib/format'
import { useCancelOrder, useRefundOrder } from '@/services/orders/orders.queries'
import type { Order } from '@/types'
import { getRefundableAmount } from '../orders.utils'

interface OrderDialogProps {
  order: Order
  open: boolean
  onClose: () => void
}

const buildRefundSchema = (maximum: number) =>
  z.object({
    amount: z
      .number('Enter an amount')
      .positive('Enter an amount')
      .max(maximum, `The most you can refund is £${maximum.toFixed(2)}`),
    reason: z.string().trim().min(3, 'Add a short reason'),
  })

type RefundValues = z.infer<ReturnType<typeof buildRefundSchema>>

const RefundForm = ({ order, onClose }: Omit<OrderDialogProps, 'open'>) => {
  const actor = useActorName()
  const refund = useRefundOrder()
  const refundable = penceToPounds(getRefundableAmount(order))
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RefundValues>({
    resolver: zodResolver(buildRefundSchema(refundable)),
    defaultValues: { amount: refundable, reason: '' },
  })

  const submit = ({ amount, reason }: RefundValues) =>
    refund.mutate(
      { orderId: order.id, actor, amount: poundsToPence(amount), reason },
      { onSuccess: onClose },
    )

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-xl">Refund {order.number}</h2>
        <p className="text-sm text-muted">
          Up to {formatPrice(getRefundableAmount(order))} goes back to the customer&apos;s card.
        </p>
      </div>
      <TextField
        label="Amount (£)"
        type="number"
        step="0.01"
        min="0"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />
      <TextAreaField
        label="Reason"
        rows={2}
        error={errors.reason?.message}
        {...register('reason')}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Not now
        </Button>
        <Button type="submit" disabled={refund.isPending}>
          Issue refund
        </Button>
      </div>
    </form>
  )
}

export const RefundDialog = ({ order, open, onClose }: OrderDialogProps) => (
  <Modal open={open} onClose={onClose} label="Refund order">
    <RefundForm order={order} onClose={onClose} />
  </Modal>
)

const CancelForm = ({ order, onClose }: Omit<OrderDialogProps, 'open'>) => {
  const actor = useActorName()
  const cancel = useCancelOrder()
  const [reason, setReason] = useState('')
  const refundable = getRefundableAmount(order)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        cancel.mutate({ orderId: order.id, actor, reason }, { onSuccess: onClose })
      }}
      className="flex flex-col gap-4 p-6"
    >
      <div>
        <h2 className="text-xl">Cancel {order.number}?</h2>
        <p className="text-sm text-muted">
          {refundable > 0
            ? `${formatPrice(refundable)} will be refunded to the customer's card.`
            : 'Nothing has been paid, so no refund is needed.'}
        </p>
      </div>
      <TextAreaField
        label="Reason"
        rows={2}
        required
        minLength={3}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Keep order
        </Button>
        <Button type="submit" disabled={cancel.isPending || reason.trim().length < 3}>
          Cancel order
        </Button>
      </div>
    </form>
  )
}

export const CancelOrderDialog = ({ order, open, onClose }: OrderDialogProps) => (
  <Modal open={open} onClose={onClose} label="Cancel order">
    <CancelForm order={order} onClose={onClose} />
  </Modal>
)
