import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { BOARD_COLUMNS } from '@/constants/orders'
import { useActiveOrders } from '@/services/orders/orders.queries'
import { OrderCard } from '../components/OrderCard'
import { getBoardOrders } from '../orders.utils'

export const OrdersBoardPage = () => {
  const { data: orders, isPending, isError, refetch } = useActiveOrders()

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title="Live orders"
        description="Tap the button on a ticket to move it on. Customers are updated at each step."
      />

      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:scroll-px-6 md:px-6 xl:mx-0 xl:grid xl:grid-cols-4 xl:px-0">
        {BOARD_COLUMNS.map(({ id, title, statuses }) => {
          const columnOrders = getBoardOrders(orders, statuses)

          return (
            <section
              key={id}
              aria-label={title}
              className="flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col gap-2.5 rounded-card bg-cocoa/5 p-2.5 sm:w-72 xl:w-auto xl:max-w-none"
            >
              <h2 className="flex items-center justify-between px-1.5 pt-1 text-base">
                {title}
                <span className="grid size-6 place-items-center rounded-full bg-cocoa text-xs text-paper">
                  {columnOrders.length}
                </span>
              </h2>
              {columnOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {columnOrders.length === 0 && (
                <p className="px-2 py-8 text-center text-sm text-muted">Nothing here</p>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
