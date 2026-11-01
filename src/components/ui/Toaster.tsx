import { CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useToastStore } from '@/stores/toast.store'

export const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 md:left-auto md:right-6 md:items-end print:hidden"
    >
      {toasts.map(({ id, message, tone }) => (
        <p
          key={id}
          className={cn(
            'flex animate-pop-in items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-paper shadow-panel',
            tone === 'error' ? 'bg-jollof-dark' : 'bg-cocoa',
          )}
        >
          {tone === 'error' ? (
            <CircleAlert className="size-4" />
          ) : (
            <CircleCheck className="size-4 text-gold" />
          )}
          {message}
        </p>
      ))}
    </div>
  )
}
