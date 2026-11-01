import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StaffMember } from '@/types'

interface AuthState {
  user: StaffMember | null
  signIn: (user: StaffMember) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: 'cook-by-ugo-admin-session', storage: createJSONStorage(() => sessionStorage) },
  ),
)
