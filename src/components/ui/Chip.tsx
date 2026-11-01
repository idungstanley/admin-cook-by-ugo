import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps extends ComponentProps<'button'> {
  active?: boolean
}

export const Chip = ({ active, className, ...props }: ChipProps) => (
  <button
    type="button"
    aria-pressed={active}
    className={cn(
      'h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold transition',
      active ? 'border-cocoa bg-cocoa text-paper' : 'border-line bg-paper hover:border-cocoa/50',
      className,
    )}
    {...props}
  />
)
