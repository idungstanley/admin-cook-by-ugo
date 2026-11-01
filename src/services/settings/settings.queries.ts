import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { settingsApi } from './settings.api'

const invalidate = [queryKeys.settings]

export const useSettings = () =>
  useQuery({ queryKey: queryKeys.settings, queryFn: settingsApi.getSettings })
export const useSaveSettings = () =>
  useAppMutation({ mutationFn: settingsApi.saveSettings, invalidate, success: 'Settings saved' })
export const useSetOrdersPaused = () =>
  useAppMutation({
    mutationFn: settingsApi.setOrdersPaused,
    invalidate,
    success: (paused) => (paused ? 'Orders paused' : 'Orders resumed'),
  })
