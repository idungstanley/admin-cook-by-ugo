import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { SettingsPage } from '@/features/settings/SettingsPage'

export const Route = createFileRoute('/_app/settings')({
  beforeLoad: requirePermission('settings'),
  head: () => ({ meta: [{ title: 'Shop settings · Cook by Ugo Admin' }] }),
  component: SettingsPage,
})
