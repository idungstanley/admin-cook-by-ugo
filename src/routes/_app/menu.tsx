import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { MenuPage } from '@/features/menu/MenuPage'

export const Route = createFileRoute('/_app/menu')({
  beforeLoad: requirePermission('menu'),
  head: () => ({ meta: [{ title: 'Dishes · Cooked by Ugo Admin' }] }),
  component: MenuPage,
})
