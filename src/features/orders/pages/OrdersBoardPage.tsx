import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { BOARD_COLUMNS, NEXT_STATUS } from '@/constants/orders'
import { cn } from '@/lib/cn'
import { useActiveOrders } from '@/services/orders/orders.queries'
import type { Order } from '@/types'
import { DroppedOrder } from '../components/AdvanceOrderButton'
import { OrderCard } from '../components/OrderCard'
import { getBoardOrders } from '../orders.utils'

type Column = (typeof BOARD_COLUMNS)[number]

/** The column a ticket can be dropped on: only the next stage, as with the button. */
const nextColumnId = (order: Order) => {
  const next = NEXT_STATUS[order.status]
  return next && BOARD_COLUMNS.find(({ statuses }) => statuses.includes(next.status))?.id
}

const DraggableTicket = ({ order }: { order: Order }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { order },
    disabled: !nextColumnId(order),
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-jollof',
        nextColumnId(order) && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30',
      )}
    >
      <OrderCard order={order} />
    </div>
  )
}

interface DropColumnProps {
  column: Column
  count: number
  /** True while a ticket that can move here is being dragged. */
  canDrop: boolean
  dragging: boolean
  children: ReactNode
}

const DropColumn = ({ column, count, canDrop, dragging, children }: DropColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, disabled: !canDrop })

  return (
    <section
      ref={setNodeRef}
      aria-label={column.title}
      className={cn(
        'flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col gap-2.5 rounded-card bg-cocoa/5 p-2.5 transition sm:w-72 xl:w-auto xl:max-w-none',
        canDrop && 'outline-dashed outline-2 outline-offset-2 outline-ewedu/60',
        canDrop && isOver && 'bg-ewedu/10 outline-ewedu',
        dragging && !canDrop && 'opacity-60',
      )}
    >
      <h2 className="flex items-center justify-between px-1.5 pt-1 text-base">
        {column.title}
        <span className="grid size-6 place-items-center rounded-full bg-cocoa text-xs text-paper">
          {count}
        </span>
      </h2>
      {children}
    </section>
  )
}

export const OrdersBoardPage = () => {
  const { data: orders, isPending, isError, refetch } = useActiveOrders()
  const [dragged, setDragged] = useState<Order | null>(null)
  const [dropped, setDropped] = useState<Order | null>(null)

  // A small move or a short press starts a drag, so taps on buttons and links still work
  // and the board can still be scrolled sideways on a phone.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const target = dragged && nextColumnId(dragged)

  const onDragStart = ({ active }: DragStartEvent) =>
    setDragged((active.data.current?.order as Order | undefined) ?? null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const order = active.data.current?.order as Order | undefined
    setDragged(null)
    if (order && over && over.id === nextColumnId(order)) setDropped(order)
  }

  return (
    <>
      <PageHeader
        title="Live orders"
        description="Drag a ticket to the next column, or tap its button, to move it on. Customers are updated at each step."
      />

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragged(null)}
      >
        <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:scroll-px-6 md:px-6 xl:mx-0 xl:grid xl:grid-cols-4 xl:px-0">
          {BOARD_COLUMNS.map((column) => {
            const columnOrders = getBoardOrders(orders, column.statuses)

            return (
              <DropColumn
                key={column.id}
                column={column}
                count={columnOrders.length}
                canDrop={target === column.id}
                dragging={dragged !== null}
              >
                {columnOrders.map((order) => (
                  <DraggableTicket key={order.id} order={order} />
                ))}
                {columnOrders.length === 0 && (
                  <p className="px-2 py-8 text-center text-sm text-muted">
                    {target === column.id ? `Drop ${dragged?.number} here` : 'Nothing here'}
                  </p>
                )}
              </DropColumn>
            )
          })}
        </div>

        <DragOverlay>
          {dragged && (
            <div className="rotate-2 cursor-grabbing rounded-2xl shadow-float">
              <OrderCard order={dragged} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {dropped && (
        <DroppedOrder key={dropped.id} order={dropped} onFinish={() => setDropped(null)} />
      )}
    </>
  )
}
