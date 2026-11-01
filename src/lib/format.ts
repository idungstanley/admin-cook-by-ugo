import type { Pence } from '@/types'

const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })
const time = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short' })
const shortDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

export const formatPrice = (amount: Pence) => currency.format(amount / 100)
export const formatDateTime = (value: number) => dateTime.format(value)
export const formatDate = (value: number) => date.format(value)
export const formatTime = (value: number) => time.format(value)
export const formatShortDay = (value: number) => shortDay.format(value)

export const penceToPounds = (amount: Pence) => amount / 100
export const poundsToPence = (amount: number): Pence => Math.round(amount * 100)

export const pluralise = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`

export const minutesSince = (value: number) =>
  Math.max(Math.floor((Date.now() - value) / 60_000), 0)

export const formatAge = (value: number) => {
  const minutes = minutesSince(value)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min ago`
}
