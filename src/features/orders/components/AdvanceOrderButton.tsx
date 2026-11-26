import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'
import { useAdvanceOrder } from './useAdvanceOrder'

interface AdvanceOrderButtonProps {
  order: Order
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const AdvanceOrderButton = ({ order, size = 'md', fullWidth }: AdvanceOrderButtonProps) => {
  const { next, advance, pending, dialogs } = useAdvanceOrder(order)
  if (!next) return null

  return (
    <>
      <Button size={size} fullWidth={fullWidth} disabled={pending} onClick={advance}>
        {next.action}
      </Button>
      {dialogs}
    </>
  )
}

/** Runs the move for a ticket dropped on the next column, asking any questions it needs. */
export const DroppedOrder = ({ order, onFinish }: { order: Order; onFinish: () => void }) => {
  const { advance, dialogs } = useAdvanceOrder(order, onFinish)
  const started = useRef(false)
  useEffect(() => {
    // Once per drop, even when React runs effects twice in development.
    if (started.current) return
    started.current = true
    advance()
  })
  return dialogs
}
