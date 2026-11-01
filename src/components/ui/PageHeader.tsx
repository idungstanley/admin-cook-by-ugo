import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
    <div className="min-w-0">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
)
