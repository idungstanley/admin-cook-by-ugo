import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Overlay'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel,
  destructive,
  pending,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onClose} label={title}>
    <div className="p-6">
      <h2 className="text-xl">{title}</h2>
      <div className="mt-2 text-sm text-muted">{body}</div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Keep it
        </Button>
        <Button variant={destructive ? 'primary' : 'dark'} disabled={pending} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
)
