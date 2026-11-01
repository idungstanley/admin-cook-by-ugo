import type { ReactNode } from 'react'
import { Button } from './Button'

interface StatusMessageProps {
  title: string
  body?: string
  action?: ReactNode
}

export const StatusMessage = ({ title, body, action }: StatusMessageProps) => (
  <div className="flex flex-col items-center gap-2 rounded-card bg-paper px-6 py-12 text-center">
    <h2 className="text-xl">{title}</h2>
    {body && <p className="max-w-md text-sm text-muted">{body}</p>}
    {action}
  </div>
)

export const ErrorMessage = ({ onRetry }: { onRetry: () => void }) => (
  <StatusMessage
    title="We could not load this"
    body="Please try again."
    action={<Button onClick={onRetry}>Try again</Button>}
  />
)
