export interface SplitSegment {
  label: string
  value: number
  valueLabel: string
  /** Tailwind background class from the chart palette. */
  color: string
}

export const SplitBar = ({ segments }: { segments: SplitSegment[] }) => {
  const total = segments.reduce((sum, { value }) => sum + value, 0) || 1
  const share = (value: number) => Math.round((value / total) * 100)

  return (
    <div>
      <div className="flex h-4 gap-0.5" aria-hidden>
        {segments.map(({ label, value, color }) => (
          <div
            key={label}
            className={`${color} first:rounded-l last:rounded-r`}
            style={{ width: `${(value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {segments.map(({ label, value, valueLabel, color }) => (
          <li key={label} className="flex items-center gap-2">
            <span aria-hidden className={`size-3 shrink-0 rounded-sm ${color}`} />
            <span className="font-semibold">{label}</span>
            <span className="ml-auto text-muted">
              {valueLabel} · {share(value)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
