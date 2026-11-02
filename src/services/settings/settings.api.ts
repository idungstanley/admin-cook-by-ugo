import { http } from '@/lib/http'
import type { ShopSettings } from '@/types'

export const settingsApi = {
  getSettings: () => http.get<ShopSettings>('/settings'),
  saveSettings: (input: Omit<ShopSettings, 'ordersPaused'>) =>
    http.put<ShopSettings>('/settings', input),
  setOrdersPaused: async (ordersPaused: boolean) => {
    await http.patch('/settings/paused', { ordersPaused })
    return ordersPaused
  },
}
