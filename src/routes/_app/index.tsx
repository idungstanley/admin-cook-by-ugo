import { createFileRoute, redirect } from '@tanstack/react-router'
import { HOME_ROUTE } from '@/constants/roles'
import { requireUser } from '@/features/auth/guards'

export const Route = createFileRoute('/_app/')({
  beforeLoad: () => {
    throw redirect({ to: HOME_ROUTE[requireUser().role] })
  },
})
