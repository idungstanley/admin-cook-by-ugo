export interface RankedItem {
  label: string
  value: number
  valueLabel: string
}

/** Thin horizontal bars for ranked categories, with the value written beside each one. */
export const RankedBars = ({ items }: { items: RankedItem[] }) => {
  const max = Math.max(...items.map(({ value }) => value), 1)

  return (
    <ol className="flex flex-col gap-3">
      {items.map(({ label, value, valueLabel }) => (
        <li key={label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-semibold">{label}</span>
            <span className="shrink-0 text-muted">{valueLabel}</span>
          </div>
          <div className="h-2 rounded-full bg-line/70">
            <div
              className="h-full rounded-full bg-jollof"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
