import { useEffect } from 'react'

let lockCount = 0

/** Counts locks, so closing one overlay does not unlock the page under another. */
export const useLockBodyScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return
    lockCount += 1
    document.body.style.overflow = 'hidden'
    return () => {
      lockCount -= 1
      if (lockCount === 0) document.body.style.overflow = ''
    }
  }, [locked])
}
