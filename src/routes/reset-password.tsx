import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'

const ResetRoute = () => {
  const { token } = Route.useSearch()
  return <ResetPasswordPage token={token} />
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({ token: String(search.token ?? '') }),
  head: () => ({ meta: [{ title: 'Set password · Cook by Ugo Admin' }] }),
  component: ResetRoute,
})
