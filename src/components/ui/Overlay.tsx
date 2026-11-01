import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { useDialog } from '@/hooks/useDialog'
import { cn } from '@/lib/cn'
import { IconButton } from './IconButton'

interface OverlayProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

const BASE = 'overflow-hidden bg-paper p-0 text-cocoa shadow-panel'

export const Drawer = ({ open, onClose, label, children, className }: OverlayProps) => {
  const { dialogRef, dialogProps } = useDialog(open, onClose)

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={cn(
        BASE,
        'ml-auto mr-0 h-dvh max-h-none w-full max-w-none animate-slide-in sm:w-[540px] sm:rounded-l-panel',
        className,
      )}
      {...dialogProps}
    >
      {open && <div className="flex h-full flex-col">{children}</div>}
    </dialog>
  )
}

export const Modal = ({ open, onClose, label, children, className }: OverlayProps) => {
  const { dialogRef, dialogProps } = useDialog(open, onClose)

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={cn(
        BASE,
        'm-auto w-[calc(100%-2rem)] max-w-md animate-pop-in rounded-panel',
        className,
      )}
      {...dialogProps}
    >
      {open && children}
    </dialog>
  )
}

export const OverlayHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 sm:px-6">
    <h2 className="truncate text-xl">{title}</h2>
    <IconButton label="Close" onClick={onClose} className="bg-shea">
      <X className="size-5" />
    </IconButton>
  </div>
)

export const OverlayBody = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6', className)} {...props} />
)

export const OverlayFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(
      'flex items-center justify-end gap-2 border-t border-line px-5 py-3 sm:px-6',
      className,
    )}
    {...props}
  />
)
