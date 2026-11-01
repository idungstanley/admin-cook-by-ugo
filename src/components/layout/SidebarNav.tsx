import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { NAV_SECTIONS } from '@/constants/navigation'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '@/constants/roles'
import { useAuthStore } from '@/stores/auth.store'

export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)

  if (!user) return null

  const permissions = ROLE_PERMISSIONS[user.role]
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(({ permission }) => permissions.includes(permission)),
  })).filter(({ items }) => items.length > 0)

  return (
    <div className="flex h-full flex-col bg-cocoa text-paper">
      <div className="flex items-center gap-3 px-5 pb-1 pt-5">
        <Logo onDark className="size-16" />
        <p className="text-sm font-bold text-paper/80">Admin</p>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map(({ title, items }) => (
          <div key={title} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
              {title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to as '/orders'}
                    onClick={onNavigate}
                    className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-paper/80 transition hover:bg-paper/10 hover:text-paper"
                    activeProps={{ className: 'bg-paper/15 !text-paper' }}
                  >
                    <Icon className="size-[18px]" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-paper/15 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="text-xs text-paper/60">{ROLE_LABELS[user.role]}</p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          title="Sign out"
          onClick={signOut}
          className="grid size-10 place-items-center rounded-full transition hover:bg-paper/10"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </div>
  )
}
