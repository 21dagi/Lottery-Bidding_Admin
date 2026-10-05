import { useAuthStore } from '@/stores/authStore'
import type { AdminPermission } from '@/types'

export function useAdminAuth() {
  const admin = useAuthStore((s) => s.admin)
  const role = useAuthStore((s) => s.role)
  const accessToken = useAuthStore((s) => s.accessToken)
  const can = useAuthStore((s) => s.can)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)

  return {
    admin,
    role,
    accessToken,
    isAuthenticated: Boolean(accessToken),
    can: (permission: AdminPermission) => can(permission),
    setSession,
    clearSession,
  }
}
