import { ROLE_PERMISSIONS } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'
import type { Permission } from '@/types'

export const usePermission = (permission: Permission) => {
  const role = useAuthStore((state) => state.user?.role)
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false
}
