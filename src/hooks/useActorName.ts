import { useAuthStore } from '@/stores/auth.store'

/** The name recorded in an order's audit trail. */
export const useActorName = () => useAuthStore((state) => state.user?.name ?? 'Staff')
