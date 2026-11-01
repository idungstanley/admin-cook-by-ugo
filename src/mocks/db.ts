import { seedCategories, seedDeals, seedDishes, seedOptionGroups } from './seed/menu'
import { buildSeedOrders, seedCustomers } from './seed/orders'
import { buildSeedEnquiries, buildSeedStaff, seedContent, seedSettings } from './seed/site'

const now = Date.now()
const seededOrders = buildSeedOrders(now)

/**
 * In-memory stand-in for the Appwrite database. Writes last until the page reloads.
 * Only `src/services/**` may touch this, so swapping in Appwrite stays contained.
 */
export const db = {
  staff: buildSeedStaff(now),
  categories: seedCategories,
  dishes: seedDishes,
  optionGroups: seedOptionGroups,
  deals: seedDeals,
  settings: seedSettings,
  content: seedContent,
  customers: seedCustomers,
  enquiries: buildSeedEnquiries(now),
  orders: seededOrders.orders,
  nextOrderSequence: seededOrders.nextSequence,
  random: seededOrders.random,
}
