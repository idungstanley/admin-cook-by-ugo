import { useNavigate } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { SelectField, TextField } from '@/components/ui/fields'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage'
import { HISTORY_PAGE_SIZE, ORDER_STATUS_META } from '@/constants/orders'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePagination } from '@/hooks/usePagination'
import { downloadFile } from '@/lib/csv'
import { formatDateTime, formatPrice } from '@/lib/format'
import { useOrders } from '@/services/orders/orders.queries'
import type { Order, OrderStatus } from '@/types'
import { OrderStatusBadge, PaymentBadge } from '../components/OrderBadges'
import { filterOrders, ordersToCsv } from '../orders.utils'

const COLUMNS: Column<Order>[] = [
  { header: 'Order', cell: ({ number }) => <span className="font-bold">{number}</span> },
  { header: 'Date', cell: ({ createdAt }) => formatDateTime(createdAt) },
  { header: 'Customer', cell: ({ customerName }) => customerName },
  { header: 'Status', cell: ({ status }) => <OrderStatusBadge status={status} /> },
  {
    header: 'Payment',
    cell: ({ paymentStatus }) => <PaymentBadge paymentStatus={paymentStatus} />,
  },
  {
    header: 'Total',
    className: 'text-right',
    cell: ({ total }) => <span className="font-bold">{formatPrice(total)}</span>,
  },
]

export const OrderHistoryPage = () => {
  const navigate = useNavigate()
  const { data: orders, isPending, isError, refetch } = useOrders()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const filtered = useMemo(
    () => filterOrders(orders ?? [], { search: debouncedSearch, status, from, to }),
    [orders, debouncedSearch, status, from, to],
  )
  const { page, pageCount, pageItems, setPage } = usePagination(filtered, HISTORY_PAGE_SIZE)

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title="Order history"
        description="Search past orders and export them for bookkeeping."
        actions={
          <Button
            variant="outline"
            disabled={filtered.length === 0}
            onClick={() =>
              downloadFile('cook-by-ugo-orders.csv', ordersToCsv(filtered), 'text/csv')
            }
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 items-end gap-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Order, name or phone"
          className="max-sm:col-span-2"
        />
        <SelectField
          label="Status"
          containerClassName="max-sm:col-span-2"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {Object.entries(ORDER_STATUS_META).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
        <TextField
          label="From"
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
        <TextField
          label="To"
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <StatusMessage title="No orders match that" body="Try different filters." />
      ) : (
        <>
          <DataTable
            caption="Order history"
            columns={COLUMNS}
            rows={pageItems}
            rowKey={({ id }) => id}
            onRowClick={({ id }) =>
              void navigate({ to: '/orders/$orderId', params: { orderId: id } })
            }
          />
          <Pagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  )
}
