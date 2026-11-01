import { cn } from '@/lib/cn'

const VARIANTS = {
  primary: 'bg-jollof text-white hover:bg-jollof-dark',
  dark: 'bg-cocoa text-paper hover:bg-cocoa-soft',
  outline: 'border border-cocoa/30 text-cocoa hover:border-cocoa hover:bg-paper',
  ghost: 'text-cocoa hover:bg-cocoa/5',
  danger: 'border border-jollof/40 text-jollof-dark hover:bg-danger-soft',
} as const

const SIZES = {
  sm: 'h-9 gap-1.5 px-3.5 text-[13px]',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-14 gap-2 px-6 text-base',
} as const

export interface ButtonStyleProps {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  fullWidth?: boolean
  className?: string
}

export const buttonStyles = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: ButtonStyleProps = {}) =>
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-bold transition',
    'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-cocoa/10 disabled:text-muted',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
