import { create } from 'zustand'
import type { AdminPermission, AdminRole, AdminUser } from '@/types'

const OWNER_PERMISSIONS: AdminPermission[] = [
  'dashboard:read',
  'users:read',
  'users:ban',
  'wallets:read',
  'wallets:adjust',
  'deposits:review',
  'lotteries:manage',
  'draw:execute',
  'settings:manage',
]

type AuthState = {
  accessToken: string | null
  admin: AdminUser | null
  role: AdminRole | null
  setSession: (token: string, admin: AdminUser) => void
  clearSession: () => void
  can: (permission: AdminPermission) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  admin: null,
  role: null,
  setSession: (token, admin) =>
    set({
      accessToken: token,
      admin,
      role: admin.role,
    }),
  clearSession: () =>
    set({
      accessToken: null,
      admin: null,
      role: null,
    }),
  can: (permission) => {
    const role = get().role
    if (!role) return false
    if (role === 'OWNER') return OWNER_PERMISSIONS.includes(permission)
    return false
  },
}))
