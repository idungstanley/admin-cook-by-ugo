const escapeCell = (value: string | number) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')

export const downloadFile = (filename: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
