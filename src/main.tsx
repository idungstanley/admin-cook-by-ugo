import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import '@fontsource-variable/manrope/wght.css'
import './styles/globals.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from '@/lib/queryClient'
import { authApi } from '@/services/auth/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree, context: { queryClient }, scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Restores the session from the httpOnly cookie before the first route guard runs.
await authApi
  .me()
  .then(({ user }) => useAuthStore.getState().signIn(user))
  .catch(() => undefined)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
