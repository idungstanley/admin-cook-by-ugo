import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { useAppMutation } from '@/hooks/useAppMutation'
import { contentApi } from './content.api'

export const useContent = () =>
  useQuery({ queryKey: queryKeys.content, queryFn: contentApi.getContent })
export const useEnquiries = () =>
  useQuery({ queryKey: queryKeys.enquiries, queryFn: contentApi.listEnquiries })
export const useSaveContent = () =>
  useAppMutation({
    mutationFn: contentApi.saveContent,
    invalidate: [queryKeys.content],
    success: 'Content saved',
  })
export const useSetEnquiryStatus = () =>
  useAppMutation({
    mutationFn: contentApi.setEnquiryStatus,
    invalidate: [queryKeys.enquiries],
    success: 'Enquiry updated',
  })
