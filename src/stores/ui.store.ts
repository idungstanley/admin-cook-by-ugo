import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  soundEnabled: boolean
  isNavOpen: boolean
  toggleSound: () => void
  setNavOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      isNavOpen: false,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setNavOpen: (isNavOpen) => set({ isNavOpen }),
    }),
    {
      name: 'cook-by-ugo-admin-ui',
      partialize: ({ soundEnabled }) => ({ soundEnabled }),
    },
  ),
)
