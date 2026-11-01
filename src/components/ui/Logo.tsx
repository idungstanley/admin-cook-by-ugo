import { cn } from '@/lib/cn'

interface LogoProps {
  /** Sits the logo on a cream disc, because its dark lettering disappears on dark surfaces. */
  onDark?: boolean
  className?: string
}

export const Logo = ({ onDark, className }: LogoProps) => (
  <img
    src="/logo.svg"
    alt="Cooked by Ugo"
    width={48}
    height={48}
    className={cn('size-12 shrink-0', onDark && 'rounded-full bg-paper p-1', className)}
  />
)
