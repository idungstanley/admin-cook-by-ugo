import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useToastStore } from '@/stores/toast.store'

interface AppMutationOptions<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidate: QueryKey[]
  success?: string | ((data: TData) => string)
}

/** Every write refreshes what it changed and reports back the same way. */
export const useAppMutation = <TVariables = void, TData = unknown>({
  mutationFn,
  invalidate,
  success,
}: AppMutationOptions<TVariables, TData>) => {
  const queryClient = useQueryClient()
  const toast = useToastStore((state) => state.push)

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      invalidate.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey }))
      if (success) toast(typeof success === 'function' ? success(data) : success)
    },
    onError: (error) => toast(error.message, 'error'),
  })
}
