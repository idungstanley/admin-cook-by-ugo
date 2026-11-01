export const REPORT_RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
] as const

export type ReportRange = (typeof REPORT_RANGES)[number]['days']

export const TOP_DISH_COUNT = 5
export const GROWTH_MONTHS = 6
