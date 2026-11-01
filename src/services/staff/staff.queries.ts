import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { staffApi } from './staff.api'

const invalidate = [queryKeys.staff]

export const useStaff = () => useQuery({ queryKey: queryKeys.staff, queryFn: staffApi.listStaff })
export const useSaveStaff = () =>
  useAppMutation({ mutationFn: staffApi.saveStaff, invalidate, success: 'Staff saved' })
export const useSetStaffActive = () =>
  useAppMutation({ mutationFn: staffApi.setActive, invalidate, success: 'Staff updated' })
