import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/features/auth/guards'
import { CustomersPage } from '@/features/customers/CustomersPage'

export const Route = createFileRoute('/_app/customers')({
  beforeLoad: requirePermission('customers'),
  head: () => ({ meta: [{ title: 'Customers · Cook by Ugo Admin' }] }),
  component: CustomersPage,
})
