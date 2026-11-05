import { Link } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardSection } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/fields'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { usePermission } from '@/hooks/usePermission'
import { formatDateTime, formatPrice, formatTime } from '@/lib/format'
import { useAssignRider, useOrder, useUpdateEta } from '@/services/orders/orders.queries'
import { useRiders } from '@/services/staff/staff.queries'
import { AdvanceOrderButton } from '../components/AdvanceOrderButton'
import { KitchenTicket } from '../components/KitchenTicket'
import { AllergyAlert, OrderStatusBadge, PaymentBadge } from '../components/OrderBadges'
import { CancelOrderDialog, RefundDialog } from '../components/OrderDialogs'
import { OrderItemLines } from '../components/OrderItemLines'
import { dueAt, getRefundableAmount, isActiveOrder, readyBy } from '../orders.utils'

const ETA_OPTIONS = [20, 30, 40, 50, 60, 75, 90, 120]

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className="text-right font-semibold">{children}</dd>
  </div>
)

export const OrderDetailPage = ({ orderId }: { orderId: string }) => {
  const { data: order, isPending, isError, refetch } = useOrder(orderId)
  const { data: riders = [] } = useRiders()
  const assignRider = useAssignRider()
  const updateEta = useUpdateEta()
  const canRefund = usePermission('refunds')
  const [dialog, setDialog] = useState<'refund' | 'cancel' | null>(null)
  const closeDialog = () => setDialog(null)

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const active = isActiveOrder(order)
  const refundable = getRefundableAmount(order)
  const offerName = order.appliedOffers?.find(({ discount }) => discount > 0)?.name

  return (
    <>
      <KitchenTicket order={order} />
      <div className="print:hidden">
        <Link
          to="/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-cocoa"
        >
          <ArrowLeft className="size-4" /> Live orders
        </Link>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl md:text-4xl">{order.number}</h1>
              <OrderStatusBadge status={order.status} />
              <PaymentBadge paymentStatus={order.paymentStatus} />
            </div>
            <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Print receipt
            </Button>
            <AdvanceOrderButton order={order} />
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-4">
            <CardSection title="Items">
              {order.allergyNote && (
                <div className="mb-3">
                  <AllergyAlert note={order.allergyNote} />
                </div>
              )}
              <OrderItemLines items={order.items} />
              <dl className="mt-2 border-t border-line pt-2">
                <Row label="Subtotal">{formatPrice(order.subtotal)}</Row>
                {order.discount ? (
                  <Row label={offerName ?? 'Offer'}>−{formatPrice(order.discount)}</Row>
                ) : null}
                <Row label="Delivery">
                  {order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}
                </Row>
                {order.refundedAmount > 0 && (
                  <Row label="Refunded">−{formatPrice(order.refundedAmount)}</Row>
                )}
                <Row label="Total">{formatPrice(order.total)}</Row>
              </dl>
            </CardSection>

            <CardSection title="Activity">
              <ol className="flex flex-col gap-2.5">
                {[...order.events].reverse().map((event) => (
                  <li key={event.id} className="text-sm">
                    <span className="font-semibold">{event.message}</span>
                    <span className="block text-xs text-muted">
                      {event.actor} · {formatDateTime(event.at)}
                    </span>
                  </li>
                ))}
              </ol>
            </CardSection>
          </div>

          <div className="flex flex-col gap-4">
            <CardSection title="Timing">
              <dl>
                <Row label={order.scheduledFor ? 'Scheduled for' : 'Due (ASAP)'}>
                  {formatDateTime(dueAt(order))}
                </Row>
                <Row label="Food ready by">{formatTime(readyBy(order))}</Row>
                {order.distanceMiles !== undefined && (
                  <Row label="Distance">{order.distanceMiles} miles</Row>
                )}
              </dl>
            </CardSection>

            <CardSection title="Customer">
              <p className="font-bold">{order.customerName}</p>
              <p className="text-sm">
                <a
                  href={`tel:${order.customerPhone.replace(/\s/g, '')}`}
                  className="underline-offset-2 hover:underline"
                >
                  {order.customerPhone}
                </a>
              </p>
              <p className="text-sm text-muted">{order.customerEmail}</p>
              <p className="mt-2 text-sm">
                {order.address}, {order.postcode}
              </p>
              {order.deliveryNote && (
                <p className="mt-1 text-sm text-muted">Note: {order.deliveryNote}</p>
              )}
            </CardSection>

            {active && (
              <Card className="flex flex-col gap-3">
                <h2 className="text-lg">Delivery</h2>
                <SelectField
                  label="Rider"
                  value={order.riderId ?? ''}
                  onChange={(event) => assignRider.mutate({ orderId, riderId: event.target.value })}
                >
                  <option value="" disabled>
                    Choose a rider
                  </option>
                  {riders.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </SelectField>
                {!order.scheduledFor && (
                  <SelectField
                    label="Minutes from order to door"
                    value={order.etaMinutes}
                    onChange={(event) =>
                      updateEta.mutate({ orderId, etaMinutes: Number(event.target.value) })
                    }
                  >
                    {[...new Set([...ETA_OPTIONS, order.etaMinutes])]
                      .sort((a, b) => a - b)
                      .map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} minutes
                        </option>
                      ))}
                  </SelectField>
                )}
              </Card>
            )}

            <CardSection title="Payment">
              <dl>
                <Row label="Method">
                  {order.paymentMethod === 'card' ? 'Card online' : 'Pay on delivery'}
                </Row>
                {order.collectedBy && <Row label="Collected by">{order.collectedBy}</Row>}
              </dl>
              {canRefund && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {refundable > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setDialog('refund')}>
                      Refund
                    </Button>
                  )}
                  {active && (
                    <Button variant="danger" size="sm" onClick={() => setDialog('cancel')}>
                      Cancel order
                    </Button>
                  )}
                </div>
              )}
            </CardSection>
          </div>
        </div>
      </div>

      <RefundDialog order={order} open={dialog === 'refund'} onClose={closeDialog} />
      <CancelOrderDialog order={order} open={dialog === 'cancel'} onClose={closeDialog} />
    </>
  )
}
