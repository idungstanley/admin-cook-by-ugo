import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { TextField } from '@/components/ui/fields'
import { Drawer, Modal, OverlayBody, OverlayHeader } from '@/components/ui/Overlay'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatTile } from '@/components/ui/StatTile'
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { downloadFile } from '@/lib/csv'
import { formatDate, formatPrice } from '@/lib/format'
import {
  useCustomers,
  useDeleteCustomerData,
  useSetCustomerBlocked,
} from '@/services/customers/customers.queries'
import { useOrders } from '@/services/orders/orders.queries'
import type { CustomerSummary } from '@/types'

const COLUMNS: Column<CustomerSummary>[] = [
  {
    header: 'Customer',
    cell: ({ name, email }) => (
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-xs text-muted">{email}</p>
      </div>
    ),
  },
  { header: 'Phone', cell: ({ phone }) => phone || '—' },
  { header: 'Orders', cell: ({ orderCount }) => orderCount },
  { header: 'Spent', cell: ({ totalSpent }) => formatPrice(totalSpent) },
  {
    header: 'Last order',
    cell: ({ lastOrderAt }) => (lastOrderAt ? formatDate(lastOrderAt) : '—'),
  },
  {
    header: 'Status',
    cell: ({ blocked, deleted }) =>
      deleted ? (
        <Badge>Deleted</Badge>
      ) : blocked ? (
        <Badge tone="jollof">Blocked</Badge>
      ) : (
        <Badge tone="ewedu">Active</Badge>
      ),
  },
]

const RECENT_ORDER_COUNT = 8

const CustomerDetail = ({
  customer,
  onClose,
}: {
  customer: CustomerSummary
  onClose: () => void
}) => {
  const { data: orders } = useOrders()
  const setBlocked = useSetCustomerBlocked()
  const deleteData = useDeleteCustomerData()
  const [dialog, setDialog] = useState<'block' | 'delete' | null>(null)
  const [reason, setReason] = useState('')
  const closeDialog = () => setDialog(null)
  const customerOrders = orders?.filter(({ customerId }) => customerId === customer.id) ?? []

  const exportData = () =>
    downloadFile(
      `customer-${customer.id}.json`,
      JSON.stringify({ customer, orders: customerOrders }, null, 2),
      'application/json',
    )

  return (
    <>
      <OverlayHeader title={customer.name} onClose={onClose} />
      <OverlayBody className="flex flex-col gap-4">
        <div className="text-sm">
          <p>{customer.email || 'Email removed'}</p>
          <p>{customer.phone || 'Phone removed'}</p>
          <p className="text-muted">
            Marketing emails: {customer.marketingOptIn ? 'opted in' : 'not opted in'}
          </p>
          {customer.blocked && (
            <p className="font-semibold text-jollof-dark">Blocked: {customer.blockReason}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Orders" value={String(customer.orderCount)} />
          <StatTile label="Total spent" value={formatPrice(customer.totalSpent)} />
        </div>

        <section>
          <h3 className="mb-1 text-base">Recent orders</h3>
          <ul>
            {customerOrders.slice(0, RECENT_ORDER_COUNT).map(({ id, number, createdAt, total }) => (
              <li key={id} className="border-b border-line last:border-b-0">
                <Link
                  to="/orders/$orderId"
                  params={{ orderId: id }}
                  className="flex justify-between gap-3 py-2 text-sm hover:text-jollof"
                >
                  <span className="font-semibold">{number}</span>
                  <span className="text-muted">{formatDate(createdAt)}</span>
                  <span>{formatPrice(total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {!customer.deleted && (
          <section className="flex flex-wrap gap-2 border-t border-line pt-4">
            {customer.blocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlocked.mutate({ id: customer.id, blocked: false })}
              >
                Unblock
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setDialog('block')}>
                Block
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={exportData}>
              Export data
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDialog('delete')}>
              Delete data
            </Button>
          </section>
        )}
      </OverlayBody>

      <Modal open={dialog === 'block'} onClose={closeDialog} label="Block customer">
        <form
          className="flex flex-col gap-4 p-6"
          onSubmit={(event) => {
            event.preventDefault()
            setBlocked.mutate(
              { id: customer.id, blocked: true, reason },
              { onSuccess: closeDialog },
            )
          }}
        >
          <div>
            <h2 className="text-xl">Block {customer.name}?</h2>
            <p className="text-sm text-muted">
              Their phone number will not be able to place orders.
            </p>
          </div>
          <TextField
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeDialog}>
              Not now
            </Button>
            <Button type="submit" disabled={reason.trim().length < 3}>
              Block customer
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={dialog === 'delete'}
        title="Delete this customer's data?"
        body="Their name, email, phone and addresses are removed for good. Order totals stay for your accounts."
        confirmLabel="Delete data"
        destructive
        pending={deleteData.isPending}
        onConfirm={() => deleteData.mutate(customer.id, { onSuccess: onClose })}
        onClose={closeDialog}
      />
    </>
  )
}

export const CustomersPage = () => {
  const { data: customers, isPending, isError, refetch } = useCustomers()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)

  const rows = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    return [...(customers ?? [])]
      .filter(
        ({ name, email, phone }) =>
          !term || `${name} ${email} ${phone}`.toLowerCase().includes(term),
      )
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }, [customers, debouncedSearch])

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  const selected = customers.find(({ id }) => id === selectedId)
  const closeDrawer = () => setSelectedId(null)

  return (
    <>
      <PageHeader
        title="Customers"
        description="Order history, no-show blocks and privacy requests."
      />
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Name, email or phone"
        className="mb-4 max-w-md"
      />

      {rows.length === 0 ? (
        <StatusMessage title="No customers match that" />
      ) : (
        <DataTable
          caption="Customers"
          columns={COLUMNS}
          rows={rows}
          rowKey={({ id }) => id}
          onRowClick={({ id }) => setSelectedId(id)}
        />
      )}

      <Drawer open={Boolean(selected)} onClose={closeDrawer} label="Customer">
        {selected && <CustomerDetail key={selected.id} customer={selected} onClose={closeDrawer} />}
      </Drawer>
    </>
  )
}
