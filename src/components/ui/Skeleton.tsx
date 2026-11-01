import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <div aria-hidden className={cn('animate-pulse rounded-card bg-line/70', className)} {...props} />
)

export const PageSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-72" />
  </div>
)
