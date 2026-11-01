import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface IconButtonProps extends ComponentProps<'button'> {
  label: string
}

export const IconButton = ({ label, className, ...props }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'grid size-10 shrink-0 place-items-center rounded-full text-cocoa transition hover:bg-cocoa/5 disabled:opacity-30',
      className,
    )}
    {...props}
  />
)
