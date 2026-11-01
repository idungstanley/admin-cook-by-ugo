import type { DealTheme, DishBadge } from '@/types'

/** The 14 major allergens UK food businesses must declare. */
export const ALLERGENS = [
  'Celery',
  'Cereals containing gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Lupin',
  'Milk',
  'Molluscs',
  'Mustard',
  'Peanuts',
  'Sesame',
  'Soya',
  'Sulphites',
  'Tree nuts',
] as const

export const DISH_BADGES: DishBadge[] = ['Popular', 'Spicy']

export const DEAL_THEMES: { value: DealTheme; label: string; swatch: string }[] = [
  { value: 'jollof', label: 'Jollof', swatch: 'bg-jollof' },
  { value: 'ewedu', label: 'Ewedu', swatch: 'bg-ewedu' },
  { value: 'indigo', label: 'Indigo', swatch: 'bg-indigo' },
]

/** Monday first, using `Date.getDay()` numbers. */
export const WEEK_DAYS = [
  { day: 1, label: 'Monday', short: 'Mon' },
  { day: 2, label: 'Tuesday', short: 'Tue' },
  { day: 3, label: 'Wednesday', short: 'Wed' },
  { day: 4, label: 'Thursday', short: 'Thu' },
  { day: 5, label: 'Friday', short: 'Fri' },
  { day: 6, label: 'Saturday', short: 'Sat' },
  { day: 0, label: 'Sunday', short: 'Sun' },
]
