import { db } from '@/mocks/db'
import { mockRequest } from '@/services/mockClient'
import type { ShopSettings } from '@/types'

export const settingsApi = {
  getSettings: () => mockRequest(() => db.settings),

  saveSettings: (input: Omit<ShopSettings, 'ordersPaused'>) =>
    mockRequest(() => {
      Object.assign(db.settings, input)
    }),

  setOrdersPaused: (ordersPaused: boolean) =>
    mockRequest(() => {
      db.settings.ordersPaused = ordersPaused
      return ordersPaused
    }),
}
