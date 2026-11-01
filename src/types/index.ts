/** All money values are whole pence, matching the customer site. */
export type Pence = number

export type Role = 'owner' | 'kitchen' | 'rider'

export type Permission =
  | 'orders'
  | 'refunds'
  | 'deliveries'
  | 'history'
  | 'menu'
  | 'menu.edit'
  | 'options'
  | 'deals'
  | 'settings'
  | 'customers'
  | 'content'
  | 'reports'
  | 'staff'

export interface StaffMember {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  twoFactorEnabled: boolean
  lastActiveAt: number
}

export type OrderStatus = 'received' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
export type PaymentMethod = 'card' | 'on-delivery'
export type PaymentStatus = 'paid' | 'due' | 'partially-refunded' | 'refunded'
export type CollectedBy = 'cash' | 'card'

export interface OrderItem {
  id: string
  name: string
  summary?: string
  quantity: number
  unitPrice: Pence
}

export interface OrderEvent {
  id: string
  at: number
  actor: string
  message: string
}

export interface Order {
  id: string
  number: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  address: string
  postcode: string
  deliveryNote?: string
  allergyNote?: string
  items: OrderItem[]
  subtotal: Pence
  deliveryFee: Pence
  total: Pence
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  collectedBy?: CollectedBy
  refundedAmount: Pence
  scheduledFor?: number
  etaMinutes: number
  riderId?: string
  status: OrderStatus
  createdAt: number
  events: OrderEvent[]
}

export type DishBadge = 'Popular' | 'Spicy'

export interface Category {
  id: string
  name: string
}

export interface Dish {
  id: string
  categoryId: string
  name: string
  description: string
  price: Pence
  kcal: number
  image: string
  badges: DishBadge[]
  allergens: string[]
  optionGroupIds: string[]
  soldOut: boolean
}

export interface OptionChoice {
  id: string
  label: string
  priceDelta: Pence
}

export interface OptionGroup {
  id: string
  title: string
  required: boolean
  maxChoices: number
  choices: OptionChoice[]
}

export type DealTheme = 'jollof' | 'ewedu' | 'indigo'

export interface Deal {
  id: string
  name: string
  tag: string
  description: string
  price: Pence
  wasPrice: Pence
  image: string
  theme: DealTheme
  active: boolean
  /** Days use `Date.getDay()` numbering, so Sunday is 0. */
  activeDays: number[]
  startsOn?: string
  endsOn?: string
}

export interface DayHours {
  day: number
  open: boolean
  opensAt: string
  closesAt: string
}

export interface Closure {
  id: string
  date: string
  label: string
}

export interface DeliveryZone {
  id: string
  prefix: string
  fee: Pence
  minimumOrder: Pence
  active: boolean
}

export interface ShopSettings {
  ordersPaused: boolean
  hours: DayHours[]
  closures: Closure[]
  zones: DeliveryZone[]
  freeDeliveryThreshold: Pence
  etaMinutes: number
  cardEnabled: boolean
  payOnDeliveryEnabled: boolean
  payOnDeliveryLimit: Pence
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  marketingOptIn: boolean
  blocked: boolean
  blockReason?: string
  deleted: boolean
}

export interface CustomerSummary extends Customer {
  orderCount: number
  totalSpent: Pence
  lastOrderAt?: number
}

export interface SiteContent {
  announcement: string
  heroHeadline: string
  heroText: string
  storyText: string
  phone: string
  email: string
  whatsappNumber: string
  areaLabel: string
  favouriteDishIds: string[]
}

export type EnquiryStatus = 'new' | 'replied' | 'closed'

export interface CateringEnquiry {
  id: string
  name: string
  email: string
  phone: string
  eventDate: string
  guests: number
  message: string
  status: EnquiryStatus
  createdAt: number
}
