import { create } from 'zustand'
import type { StaffMember } from '@/types'

interface AuthState {
  user: StaffMember | null
  signIn: (user: StaffMember) => void
  signOut: () => void
}

/** Held in memory only. The session itself is an httpOnly cookie that scripts cannot read. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: (user) => set({ user }),
  signOut: () => set({ user: null }),
}))
