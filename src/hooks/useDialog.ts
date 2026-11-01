import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react'
import { useLockBodyScroll } from './useLockBodyScroll'

/** Drives a native `<dialog>`, which provides the focus trap and inert background for free. */
export const useDialog = (open: boolean, onClose: () => void) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useLockBodyScroll(open)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    onClose()
  }

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose()
  }

  return { dialogRef, dialogProps: { onCancel, onClick: onBackdropClick } }
}
