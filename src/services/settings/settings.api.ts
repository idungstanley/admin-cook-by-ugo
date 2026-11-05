import { http } from '@/lib/http'
import type { SettingsInput, ShopSettings } from '@/types'

export interface PostcodeCheck {
  postcode: string
  city: string
  distanceMiles: number
  covered: boolean
  fee: number
  minimumOrder: number
}

export const settingsApi = {
  getSettings: () => http.get<ShopSettings>('/settings'),
  saveSettings: (input: SettingsInput) => http.put<ShopSettings>('/settings', input),
  /** Uses the same check as checkout, against the saved settings. */
  checkPostcode: (postcode: string) =>
    http.get<PostcodeCheck>(`/public/postcodes/${encodeURIComponent(postcode.trim())}`),
  setOrdersPaused: async (ordersPaused: boolean) => {
    await http.patch('/settings/paused', { ordersPaused })
    return ordersPaused
  },
}
