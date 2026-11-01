import { cn } from '@/lib/cn'

export const Logo = ({ className }: { className?: string }) => (
  <span className={cn('inline-flex items-center gap-2 whitespace-nowrap', className)}>
    <span aria-hidden className="grid size-7 place-items-center rounded-full bg-jollof">
      <span className="size-3 rounded-full bg-gold" />
    </span>
    <span className="font-display text-xl font-extrabold tracking-tight">cook by ugo</span>
  </span>
)
