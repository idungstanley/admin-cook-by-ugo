import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { StaffPage } from '@/features/staff/StaffPage'

export const Route = createFileRoute('/_app/staff')({
  beforeLoad: requirePermission('staff'),
  head: () => ({ meta: [{ title: 'Staff and roles · Cook by Ugo Admin' }] }),
  component: StaffPage,
})
