import { useMemo, useState } from 'react'
import { BarChart } from '@/components/charts/BarChart'
import { RankedBars } from '@/components/charts/RankedBars'
import { SplitBar } from '@/components/charts/SplitBar'
import { CardSection } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatTile } from '@/components/ui/StatTile'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { GROWTH_MONTHS, REPORT_RANGES, TOP_DISH_COUNT, type ReportRange } from '@/constants/reports'
import { formatPrice, formatShortDay, pluralise } from '@/lib/format'
import { useOrders } from '@/services/orders/orders.queries'
import { buildMonthlyGrowth, buildReport } from './reports.utils'

const formatChange = (change: number | null, days: number) =>
  change === null
    ? 'No earlier data'
    : `${change >= 0 ? '+' : ''}${change}% on previous ${days} days`

const formatPounds = (pence: number) => `£${Math.round(pence / 100)}`

export const ReportsPage = () => {
  const { data: orders, isPending, isError, refetch } = useOrders()
  const [range, setRange] = useState<ReportRange>(30)

  const report = useMemo(() => buildReport(orders ?? [], range), [orders, range])
  const growth = useMemo(() => buildMonthlyGrowth(orders ?? [], GROWTH_MONTHS), [orders])

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title="Reports"
        description="Sales are net of refunds and leave out cancelled orders."
        actions={REPORT_RANGES.map(({ days, label }) => (
          <Chip key={days} active={range === days} onClick={() => setRange(days)}>
            {label}
          </Chip>
        ))}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="Sales"
          value={formatPrice(report.sales)}
          detail={formatChange(report.salesChange, range)}
        />
        <StatTile
          label="Orders"
          value={String(report.orderCount)}
          detail={formatChange(report.orderChange, range)}
        />
        <StatTile label="Average order" value={formatPrice(report.averageOrder)} />
        <StatTile label="Refunded" value={formatPrice(report.refunded)} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[1.7fr_1fr]">
        <CardSection title="Daily sales" description={`Last ${range} days`}>
          <BarChart
            label={`Daily sales for the last ${range} days`}
            formatAxis={formatPounds}
            data={report.daily.map(({ at, sales, orders: count }) => ({
              key: String(at),
              label: formatShortDay(at),
              value: sales,
              tooltip: `${formatShortDay(at)}: ${formatPrice(sales)}, ${pluralise(count, 'order')}`,
            }))}
          />
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-muted">View as table</summary>
            <table className="mt-2 w-full text-left">
              <thead className="text-xs text-muted">
                <tr>
                  <th scope="col" className="py-1 font-semibold">
                    Day
                  </th>
                  <th scope="col" className="py-1 font-semibold">
                    Orders
                  </th>
                  <th scope="col" className="py-1 text-right font-semibold">
                    Sales
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.daily.map(({ at, sales, orders: count }) => (
                  <tr key={at} className="border-t border-line">
                    <td className="py-1">{formatShortDay(at)}</td>
                    <td className="py-1">{count}</td>
                    <td className="py-1 text-right">{formatPrice(sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </CardSection>

        <CardSection title="Top dishes" description="By portions sold">
          <RankedBars
            items={report.topDishes.slice(0, TOP_DISH_COUNT).map(({ name, quantity, revenue }) => ({
              label: name,
              value: quantity,
              valueLabel: `${quantity} sold · ${formatPrice(revenue)}`,
            }))}
          />
        </CardSection>

        <CardSection
          title="Direct order growth"
          description="Orders on your own site each month. The latest month is still in progress."
        >
          <BarChart
            label="Orders per month"
            formatAxis={(value) => String(Math.round(value))}
            data={growth.map(({ label, orders: count, change }) => ({
              key: label,
              label,
              value: count,
              tooltip: `${label}: ${pluralise(count, 'order')}${change === null ? '' : `, ${change >= 0 ? '+' : ''}${change}%`}`,
            }))}
          />
        </CardSection>

        <CardSection title="Payment split" description="Share of net sales">
          <SplitBar
            segments={[
              {
                label: 'Card online',
                value: report.payment.card,
                valueLabel: formatPrice(report.payment.card),
                color: 'bg-jollof',
              },
              {
                label: 'Pay on delivery',
                value: report.payment.onDelivery,
                valueLabel: formatPrice(report.payment.onDelivery),
                color: 'bg-chart-blue',
              },
            ]}
          />
        </CardSection>
      </div>
    </>
  )
}
