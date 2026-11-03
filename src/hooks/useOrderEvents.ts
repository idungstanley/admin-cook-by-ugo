import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { queryKeys } from '@/constants/queryKeys'
import { API_URL } from '@/lib/http'
import { sessionToken } from '@/lib/sessionToken'

/** Refreshes order data the moment anything changes on the server. */
export const useOrderEvents = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = io(API_URL, {
      withCredentials: true,
      auth: { token: sessionToken.get() ?? undefined },
    })
    socket.on('orders:changed', () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    })
    return () => {
      socket.disconnect()
    }
  }, [queryClient])
}
