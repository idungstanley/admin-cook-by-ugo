import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Link, Outlet } from '@tanstack/react-router'
import { buttonStyles } from '@/components/ui/button.styles'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { Toaster } from '@/components/ui/Toaster'

const RootLayout = () => (
  <>
    <HeadContent />
    <Outlet />
    <Toaster />
  </>
)

const NotFound = () => (
  <div className="p-6">
    <StatusMessage
      title="This page does not exist"
      action={
        <Link to="/" className={buttonStyles()}>
          Back to the dashboard
        </Link>
      }
    />
  </div>
)

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ title: 'Cooked by Ugo Admin' }] }),
  component: RootLayout,
  notFoundComponent: NotFound,
})
