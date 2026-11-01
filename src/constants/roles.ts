import type { Permission, Role } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  kitchen: 'Kitchen',
  rider: 'Rider',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Everything, including money, settings and staff.',
  kitchen: 'Live orders and sold-out switches.',
  rider: 'Assigned deliveries and payment at the door.',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'orders',
    'refunds',
    'deliveries',
    'history',
    'menu',
    'menu.edit',
    'options',
    'deals',
    'settings',
    'customers',
    'content',
    'reports',
    'staff',
  ],
  kitchen: ['orders', 'menu'],
  rider: ['deliveries'],
}

export const HOME_ROUTE: Record<Role, '/orders' | '/deliveries'> = {
  owner: '/orders',
  kitchen: '/orders',
  rider: '/deliveries',
}
