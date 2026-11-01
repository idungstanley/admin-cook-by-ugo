import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const Card = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('rounded-card bg-paper p-5', className)} {...props} />
)

interface CardSectionProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export const CardSection = ({
  title,
  description,
  action,
  children,
  className,
}: CardSectionProps) => (
  <Card className={className}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </Card>
)
