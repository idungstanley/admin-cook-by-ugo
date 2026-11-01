import {
  BarChart3,
  Bike,
  ClipboardList,
  FileText,
  History,
  type LucideIcon,
  ListChecks,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import type { Permission } from '@/types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  permission: Permission
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Service',
    items: [
      { label: 'Live orders', to: '/orders', icon: ClipboardList, permission: 'orders' },
      { label: 'My deliveries', to: '/deliveries', icon: Bike, permission: 'deliveries' },
      { label: 'Order history', to: '/history', icon: History, permission: 'history' },
    ],
  },
  {
    title: 'Menu',
    items: [
      { label: 'Dishes', to: '/menu', icon: UtensilsCrossed, permission: 'menu' },
      { label: 'Options', to: '/options', icon: ListChecks, permission: 'options' },
      { label: 'Deals', to: '/deals', icon: Tag, permission: 'deals' },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Customers', to: '/customers', icon: Users, permission: 'customers' },
      { label: 'Reports', to: '/reports', icon: BarChart3, permission: 'reports' },
      { label: 'Content', to: '/content', icon: FileText, permission: 'content' },
      { label: 'Shop settings', to: '/settings', icon: Settings, permission: 'settings' },
      { label: 'Staff and roles', to: '/staff', icon: ShieldCheck, permission: 'staff' },
    ],
  },
]
