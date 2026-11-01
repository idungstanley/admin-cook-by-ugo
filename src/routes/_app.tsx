import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { requireUser } from '@/features/auth/guards'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    requireUser()
  },
  component: AppShell,
})
