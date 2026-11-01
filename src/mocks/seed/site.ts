import type { CateringEnquiry, ShopSettings, SiteContent, StaffMember } from '@/types'

const DAY_MS = 86_400_000

const hours = (day: number, opensAt: string, closesAt: string) => ({
  day,
  open: true,
  opensAt,
  closesAt,
})

/** Delivery values are assumptions until the client confirms them. */
export const seedSettings: ShopSettings = {
  ordersPaused: false,
  hours: [
    hours(1, '12:00', '21:00'),
    hours(2, '12:00', '21:00'),
    hours(3, '12:00', '21:00'),
    hours(4, '12:00', '21:00'),
    hours(5, '12:00', '22:00'),
    hours(6, '12:00', '22:00'),
    hours(0, '13:00', '20:00'),
  ],
  closures: [{ id: 'christmas', date: '2026-12-25', label: 'Christmas Day' }],
  zones: [
    { id: 'ne1', prefix: 'NE1', fee: 299, minimumOrder: 1200, active: true },
    { id: 'ne2', prefix: 'NE2', fee: 299, minimumOrder: 1200, active: true },
    { id: 'ne3', prefix: 'NE3', fee: 349, minimumOrder: 1500, active: true },
    { id: 'ne4', prefix: 'NE4', fee: 349, minimumOrder: 1500, active: true },
    { id: 'ne6', prefix: 'NE6', fee: 399, minimumOrder: 1500, active: false },
  ],
  freeDeliveryThreshold: 2500,
  etaMinutes: 40,
  cardEnabled: true,
  payOnDeliveryEnabled: true,
  payOnDeliveryLimit: 6000,
}

export const seedContent: SiteContent = {
  announcement: 'Suya Night is back every Friday.',
  heroHeadline: 'Lagos flavour, Newcastle doorstep.',
  heroText:
    'Jollof, suya, egusi and dodo, cooked from scratch every day by Ugo and delivered hot in 35 to 45 minutes.',
  storyText:
    'Ugo cooks every pot from scratch with recipes from home: slow-cooked stews, smoky party jollof and suya spiced the Lagos way.',
  phone: '0191 234 5678',
  email: 'hello@cookbyugo.co.uk',
  whatsappNumber: '441912345678',
  areaLabel: 'Newcastle upon Tyne, NE1',
  favouriteDishIds: ['party-jollof-rice', 'suya-platter', 'pounded-yam-egusi', 'fried-plantain'],
}

export const buildSeedStaff = (now: number): StaffMember[] => [
  {
    id: 'staff-owner',
    name: 'Ugo',
    email: 'owner@example.com',
    role: 'owner',
    active: true,
    twoFactorEnabled: true,
    lastActiveAt: now,
  },
  {
    id: 'staff-kitchen',
    name: 'Bisi Ade',
    email: 'kitchen@example.com',
    role: 'kitchen',
    active: true,
    twoFactorEnabled: false,
    lastActiveAt: now - DAY_MS / 8,
  },
  {
    id: 'staff-rider',
    name: 'Tunde Bello',
    email: 'rider@example.com',
    role: 'rider',
    active: true,
    twoFactorEnabled: false,
    lastActiveAt: now - DAY_MS / 24,
  },
  {
    id: 'staff-rider-2',
    name: 'Sam Clarke',
    email: 'sam@example.com',
    role: 'rider',
    active: true,
    twoFactorEnabled: false,
    lastActiveAt: now - DAY_MS,
  },
]

export const buildSeedEnquiries = (now: number): CateringEnquiry[] => [
  {
    id: 'enquiry-1',
    name: 'Grace Nwosu',
    email: 'grace@example.com',
    phone: '07700 900201',
    eventDate: '2026-12-12',
    guests: 40,
    message: 'Birthday party in Jesmond. Jollof, suya and small chops.',
    status: 'new',
    createdAt: now - DAY_MS / 3,
  },
  {
    id: 'enquiry-2',
    name: 'Northern Tech Ltd',
    email: 'events@example.com',
    phone: '07700 900202',
    eventDate: '2026-11-28',
    guests: 25,
    message: 'Team lunch, need vegetarian options.',
    status: 'replied',
    createdAt: now - DAY_MS * 4,
  },
]
