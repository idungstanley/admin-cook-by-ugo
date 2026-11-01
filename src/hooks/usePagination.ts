import { useState } from 'react'

export const usePagination = <T>(items: T[], pageSize: number) => {
  const [requestedPage, setPage] = useState(1)
  const pageCount = Math.max(Math.ceil(items.length / pageSize), 1)
  // Filters can shrink the list, so the page is clamped rather than stored blindly.
  const page = Math.min(requestedPage, pageCount)

  return {
    page,
    pageCount,
    setPage,
    pageItems: items.slice((page - 1) * pageSize, page * pageSize),
  }
}
