import { create } from 'zustand'

type ToastTone = 'success' | 'error'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, tone?: ToastTone) => void
}

const TOAST_MS = 3500
let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
    setTimeout(
      () => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      TOAST_MS,
    )
  },
}))
