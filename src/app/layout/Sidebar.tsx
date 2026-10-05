import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Landmark,
  Settings,
  Dices,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'

/** Slim nav aligned to user-app ops — prizes/tickets/winners live inside Lotteries. */
const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/lotteries', label: 'Lotteries', icon: Dices },
  { to: '/deposits', label: 'Deposits', icon: Landmark, badge: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/wallets', label: 'Wallets', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const pending = useUiStore((s) => s.pendingDepositsCount)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-white/10 bg-sidebar text-sidebar-fg transition-[width]',
        collapsed ? 'w-[72px]' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-white/10 px-3">
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">Lottery Admin</p>
            <p className="truncate text-[11px] text-sidebar-muted">Owner panel</p>
          </div>
        ) : (
          <span className="mx-auto font-mono text-sm font-bold text-accent">LA</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-sidebar-muted hover:bg-white/10 hover:text-white"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition',
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-sidebar-muted hover:bg-white/5 hover:text-white',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
              {item.badge && pending > 0 ? (
                <span
                  className={cn(
                    'rounded-full bg-warning px-1.5 text-[10px] font-bold text-slate-900',
                    collapsed ? 'absolute right-1 top-1' : 'ml-auto',
                  )}
                >
                  {pending}
                </span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
