import { niceMax } from '@/features/reports/reports.utils'
import { cn } from '@/lib/cn'

export interface BarDatum {
  key: string
  label: string
  value: number
  tooltip: string
}

interface BarChartProps {
  data: BarDatum[]
  label: string
  formatAxis: (value: number) => string
}

const X_LABEL_COUNT = 5

/** Single-series bars from a zero baseline, with a hover and focus tooltip on each column. */
export const BarChart = ({ data, label, formatAxis }: BarChartProps) => {
  const max = niceMax(Math.max(...data.map(({ value }) => value), 0))
  const labelEvery = Math.max(Math.ceil(data.length / X_LABEL_COUNT), 1)

  return (
    <figure aria-label={label} className="m-0">
      <div className="flex gap-2">
        <div
          aria-hidden
          className="flex h-52 w-12 shrink-0 flex-col justify-between text-right text-[11px] text-muted"
        >
          <span>{formatAxis(max)}</span>
          <span>{formatAxis(max / 2)}</span>
          <span>{formatAxis(0)}</span>
        </div>

        <div className="relative h-52 min-w-0 flex-1 border-b border-cocoa/30">
          <div aria-hidden className="absolute inset-x-0 top-0 border-t border-line" />
          <div aria-hidden className="absolute inset-x-0 top-1/2 border-t border-line" />

          <div className="absolute inset-0 flex items-end gap-0.5">
            {data.map(({ key, value, tooltip }, index) => (
              <div
                key={key}
                tabIndex={0}
                aria-label={tooltip}
                className="group relative flex h-full min-w-0 flex-1 items-end focus:outline-none"
              >
                <div
                  className="w-full rounded-t bg-jollof transition group-hover:bg-jollof-dark group-focus:bg-jollof-dark"
                  style={{ height: `${(value / max) * 100}%` }}
                />
                <span
                  className={cn(
                    'pointer-events-none absolute top-1 z-10 hidden whitespace-nowrap rounded-lg bg-cocoa px-2.5 py-1.5 text-xs font-semibold text-paper group-hover:block group-focus:block',
                    index > data.length / 2 ? 'right-0' : 'left-0',
                  )}
                >
                  {tooltip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div aria-hidden className="ml-14 mt-1.5 flex gap-0.5 text-[11px] text-muted">
        {data.map(({ key, label: tick }, index) => (
          <span key={key} className="min-w-0 flex-1 overflow-visible whitespace-nowrap">
            {index % labelEvery === 0 ? tick : ''}
          </span>
        ))}
      </div>
    </figure>
  )
}
