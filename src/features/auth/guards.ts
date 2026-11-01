import { redirect } from '@tanstack/react-router'
import { HOME_ROUTE, ROLE_PERMISSIONS } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'
import type { Permission } from '@/types'

/** Interface guard only. The server must enforce the same rules once Appwrite is connected. */
export const requireUser = () => {
  const user = useAuthStore.getState().user
  if (!user) throw redirect({ to: '/login' })
  return user
}

export const requirePermission = (permission: Permission) => () => {
  const user = requireUser()
  if (!ROLE_PERMISSIONS[user.role].includes(permission)) {
    throw redirect({ to: HOME_ROUTE[user.role] })
  }
}
