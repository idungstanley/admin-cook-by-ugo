import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
  /** Hides the label on the phone layout, for action cells. */
  hideLabelOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  caption: string
}

/** A table from `md` up, and stacked cards on phones, from one set of column definitions. */
export const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  onRowClick,
  caption,
}: DataTableProps<T>) => (
  <>
    <div className="hidden overflow-x-auto rounded-card bg-paper md:block">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={cn('px-4 py-3 font-semibold', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick && (() => onRowClick(row))}
              className={cn(
                'border-b border-line/60 last:border-b-0',
                onRowClick && 'cursor-pointer transition hover:bg-shea/60',
              )}
            >
              {columns.map((column) => (
                <td key={column.header} className={cn('px-4 py-3 align-middle', column.className)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <ul className="flex flex-col gap-3 md:hidden">
      {rows.map((row) => (
        <li
          key={rowKey(row)}
          onClick={onRowClick && (() => onRowClick(row))}
          className={cn('rounded-card bg-paper p-4', onRowClick && 'cursor-pointer')}
        >
          <dl className="flex flex-col gap-1.5 text-sm">
            {columns.map((column) => (
              <div key={column.header} className="flex items-center justify-between gap-4">
                {!column.hideLabelOnMobile && (
                  <dt className="text-xs text-muted">{column.header}</dt>
                )}
                <dd className="min-w-0 text-right">{column.cell(row)}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  </>
)
