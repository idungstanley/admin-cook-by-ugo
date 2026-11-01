import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const TONES = {
  neutral: 'bg-cocoa/10 text-cocoa',
  gold: 'bg-gold-soft text-cocoa',
  jollof: 'bg-danger-soft text-jollof-dark',
  ewedu: 'bg-ewedu-soft text-ewedu',
  indigo: 'bg-indigo-soft text-indigo',
} as const

export type BadgeTone = keyof typeof TONES

interface BadgeProps extends ComponentProps<'span'> {
  tone?: BadgeTone
}

export const Badge = ({ tone = 'neutral', className, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold leading-none',
      TONES[tone],
      className,
    )}
    {...props}
  />
)
