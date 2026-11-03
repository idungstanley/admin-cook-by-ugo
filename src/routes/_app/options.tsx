import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { OptionsPage } from '@/features/options/OptionsPage'

export const Route = createFileRoute('/_app/options')({
  beforeLoad: requirePermission('options'),
  head: () => ({ meta: [{ title: 'Options · Cooked by Ugo Admin' }] }),
  component: OptionsPage,
})
