import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { ContentPage } from '@/features/content/ContentPage'

export const Route = createFileRoute('/_app/content')({
  beforeLoad: requirePermission('content'),
  head: () => ({ meta: [{ title: 'Content · Cook by Ugo Admin' }] }),
  component: ContentPage,
})
