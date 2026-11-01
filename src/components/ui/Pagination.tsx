import { Button } from './Button'

interface PaginationProps {
  page: number
  pageCount: number
  total: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ page, pageCount, total, onPageChange }: PaginationProps) => (
  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
    <span>
      Page {page} of {pageCount} · {total} results
    </span>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  </div>
)
