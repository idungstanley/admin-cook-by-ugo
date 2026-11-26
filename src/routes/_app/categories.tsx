import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { CategoriesPage } from '@/features/menu/CategoriesPage'

export const Route = createFileRoute('/_app/categories')({
  beforeLoad: requirePermission('menu.edit'),
  head: () => ({ meta: [{ title: 'Categories · Cooked by Ugo Admin' }] }),
  component: CategoriesPage,
})
