import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { ReportsPage } from '@/features/reports/ReportsPage'

export const Route = createFileRoute('/_app/reports')({
  beforeLoad: requirePermission('reports'),
  head: () => ({ meta: [{ title: 'Reports · Cooked by Ugo Admin' }] }),
  component: ReportsPage,
})
