import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { disconnectAdminSocket } from '@/sockets/adminSocket'

export function Topbar() {
  const admin = useAuthStore((s) => s.admin)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  const logout = () => {
    disconnectAdminSocket()
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-fg">Operations</p>
        <p className="text-xs text-fg-subtle">Live control panel</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-fg">{admin?.displayName}</p>
          <p className="text-xs text-fg-subtle">{admin?.role}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </header>
  )
}
