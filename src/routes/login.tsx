import { createFileRoute, redirect } from '@tanstack/react-router'
import { HOME_ROUTE } from '@/constants/roles'
import { LoginPage } from '@/features/auth/LoginPage'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user) throw redirect({ to: HOME_ROUTE[user.role] })
  },
  head: () => ({ meta: [{ title: 'Sign in · Cooked by Ugo Admin' }] }),
  component: LoginPage,
})
