import { useEffect, useRef } from 'react'
import { playOrderChime } from '@/lib/chime'
import { useActiveOrders } from '@/services/orders/orders.queries'
import { useToastStore } from '@/stores/toast.store'
import { useUiStore } from '@/stores/ui.store'

/** Compares order ids between polls, so a chime fires once for each new order. */
export const useNewOrderAlert = () => {
  const { data: orders } = useActiveOrders()
  const toast = useToastStore((state) => state.push)
  const soundEnabled = useUiStore((state) => state.soundEnabled)
  const seenIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!orders) return
    const currentIds = new Set(orders.map(({ id }) => id))
    const newOrders = seenIds.current ? orders.filter(({ id }) => !seenIds.current?.has(id)) : []
    seenIds.current = currentIds

    if (newOrders.length === 0) return
    if (soundEnabled) playOrderChime()
    newOrders.forEach(({ number, customerName }) =>
      toast(`New order ${number} from ${customerName}`),
    )
  }, [orders, soundEnabled, toast])
}
