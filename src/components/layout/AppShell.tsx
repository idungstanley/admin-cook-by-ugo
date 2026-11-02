import { Outlet } from '@tanstack/react-router'
import { Drawer } from '@/components/ui/Overlay'
import { useNewOrderAlert } from '@/hooks/useNewOrderAlert'
import { useOrderEvents } from '@/hooks/useOrderEvents'
import { usePermission } from '@/hooks/usePermission'
import { useUiStore } from '@/stores/ui.store'
import { SidebarNav } from './SidebarNav'
import { Topbar } from './Topbar'

/** Renders nothing. It keeps the alert running on every page for staff who see orders. */
const OrderAlerts = () => {
  useNewOrderAlert()
  return null
}

const OrderEvents = () => {
  useOrderEvents()
  return null
}

export const AppShell = () => {
  const isNavOpen = useUiStore((state) => state.isNavOpen)
  const setNavOpen = useUiStore((state) => state.setNavOpen)
  const canSeeOrders = usePermission('orders')
  const closeNav = () => setNavOpen(false)

  return (
    <div className="min-h-dvh lg:pl-sidebar print:p-0">
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar lg:block print:hidden">
        <SidebarNav />
      </aside>

      <Drawer
        open={isNavOpen}
        onClose={closeNav}
        label="Menu"
        className="ml-0 mr-auto sm:w-sidebar sm:rounded-l-none sm:rounded-r-panel"
      >
        <SidebarNav onNavigate={closeNav} />
      </Drawer>

      <Topbar />
      <main className="px-4 py-5 md:px-6 md:py-6 print:p-0">
        <Outlet />
      </main>
      {canSeeOrders && <OrderAlerts />}
      <OrderEvents />
    </div>
  )
}
