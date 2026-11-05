import { useMemo, useState } from 'react'
import { BarChart } from '@/components/charts/BarChart'
import { RankedBars } from '@/components/charts/RankedBars'
import { CardSection } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatTile } from '@/components/ui/StatTile'
import { ErrorMessage } from '@/components/ui/StatusMessage'
import { GROWTH_MONTHS, REPORT_RANGES, TOP_DISH_COUNT, type ReportRange } from '@/constants/reports'
import { formatPrice, formatShortDay, pluralise } from '@/lib/format'
import { useOrders } from '@/services/orders/orders.queries'
import { buildMonthlyGrowth, buildReport, buildReportBetween } from './reports.utils'

type Period = { kind: 'preset'; days: ReportRange } | { kind: 'custom'; from: string; to: string }

const isoDay = (time: number) => {
  const date = new Date(time)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

const dateLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formatChange = (change: number | null, days: number) =>
  change === null
    ? 'No earlier data'
    : `${change >= 0 ? '+' : ''}${change}% on previous ${days} days`

const formatPounds = (pence: number) => `£${Math.round(pence / 100)}`

export const ReportsPage = () => {
  const { data: orders, isPending, isError, refetch } = useOrders()
  const [period, setPeriod] = useState<Period>({ kind: 'preset', days: 30 })

  const report = useMemo(() => {
    if (period.kind === 'preset') return buildReport(orders ?? [], period.days)
    const from = new Date(`${period.from}T00:00:00`).getTime()
    const to = new Date(`${period.to}T00:00:00`).getTime()
    return buildReportBetween(orders ?? [], Math.min(from, to), Math.max(from, to))
  }, [orders, period])
  const range = report.days
  const periodLabel =
    period.kind === 'preset'
      ? `Last ${period.days} days`
      : `${dateLabel.format(new Date(`${period.from}T00:00:00`))} to ${dateLabel.format(new Date(`${period.to}T00:00:00`))}`

  // Read once per render group, so the date picker's limit does not change while open.
  const [today] = useState(() => isoDay(Date.now()))

  const startCustom = () => {
    const today = Date.now()
    setPeriod({ kind: 'custom', from: isoDay(today - 13 * 86_400_000), to: isoDay(today) })
  }
  const growth = useMemo(() => buildMonthlyGrowth(orders ?? [], GROWTH_MONTHS), [orders])

  if (isPending) return <PageSkeleton />
  if (isError) return <ErrorMessage onRetry={() => void refetch()} />

  return (
    <>
      <PageHeader
        title="Reports"
        description="Sales are net of refunds and leave out cancelled orders."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {REPORT_RANGES.map(({ days, label }) => (
              <Chip
                key={days}
                active={period.kind === 'preset' && period.days === days}
                onClick={() => setPeriod({ kind: 'preset', days })}
              >
                {label}
              </Chip>
            ))}
            <Chip active={period.kind === 'custom'} onClick={startCustom}>
              Custom
            </Chip>
            {period.kind === 'custom' && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="date"
                  aria-label="From"
                  value={period.from}
                  max={period.to}
                  onChange={(event) =>
                    event.target.value && setPeriod({ ...period, from: event.target.value })
                  }
                  className="h-10 rounded-xl border border-line bg-paper px-2"
                />
                <span className="text-muted">to</span>
                <input
                  type="date"
                  aria-label="To"
                  value={period.to}
                  min={period.from}
                  max={today}
                  onChange={(event) =>
                    event.target.value && setPeriod({ ...period, to: event.target.value })
                  }
                  className="h-10 rounded-xl border border-line bg-paper px-2"
                />
              </div>
            )}
          </div>
        }
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
        <CardSection title="Daily sales" description={periodLabel}>
          <BarChart
            label={`Daily sales, ${periodLabel.toLowerCase()}`}
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

        <CardSection title="Offers" description="Savings customers got from your offers">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-shea p-4">
              <dt className="text-xs text-muted">Orders with an offer</dt>
              <dd className="font-display text-2xl font-extrabold">{report.offers.orders}</dd>
            </div>
            <div className="rounded-2xl bg-shea p-4">
              <dt className="text-xs text-muted">Total saved</dt>
              <dd className="font-display text-2xl font-extrabold">
                {formatPrice(report.offers.savings)}
              </dd>
            </div>
          </dl>
        </CardSection>
      </div>
    </>
  )
}
