import { apiRequest } from '@/api/client'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'
import type {
  AdminUser,
  DashboardMetrics,
  Deposit,
  DrawResult,
  Lottery,
  LotteryWinner,
  Paginated,
  PlatformUser,
  Settings,
  Ticket,
  Wallet,
} from '@/types'

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ accessToken: string; admin: AdminUser }>('/auth/admin/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    }),
}

export const dashboardApi = {
  get: () => apiRequest<DashboardMetrics>('/admin/dashboard'),
}

export const usersApi = {
  list: (params?: { q?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.status) qs.set('status', params.status)
    const q = qs.toString()
    return apiRequest<Paginated<PlatformUser>>(`/admin/users${q ? `?${q}` : ''}`)
  },
  get: (id: string) => apiRequest<PlatformUser>(`/admin/users/${id}`),
  ban: (id: string, reason: string) =>
    apiRequest<PlatformUser>(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: { reason },
    }),
  unban: (id: string) =>
    apiRequest<PlatformUser>(`/admin/users/${id}/unban`, { method: 'POST' }),
}

export const walletsApi = {
  list: () => apiRequest<Paginated<Wallet>>('/admin/wallets'),
  adjust: (userId: string, amount: number, reason: string) =>
    apiRequest<Wallet>(`/admin/wallets/${userId}/adjust`, {
      method: 'POST',
      body: { amount, reason },
    }),
}

export const depositsApi = {
  list: (status?: string) => {
    const q = status ? `?status=${status}` : ''
    return apiRequest<Paginated<Deposit>>(`/admin/deposits${q}`)
  },
  approve: (id: string) =>
    apiRequest<Deposit>(`/admin/deposits/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string) =>
    apiRequest<Deposit>(`/admin/deposits/${id}/reject`, {
      method: 'POST',
      body: { reason },
    }),
}

export const mediaApi = {
  upload: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const token = useAuthStore.getState().accessToken
    const base = env.VITE_API_BASE_URL.replace(/\/$/, '')
    const res = await fetch(`${base}/media/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      let message = 'Upload failed'
      try {
        const payload = (await res.json()) as { message?: string }
        message = payload.message ?? message
      } catch {
        // ignore
      }
      throw new Error(message)
    }
    const json = (await res.json()) as { data: { id: string; url: string } }
    return json.data
  },
}

export const lotteriesApi = {
  list: () => apiRequest<Paginated<Lottery>>('/admin/lotteries'),
  get: (id: string) => apiRequest<Lottery>(`/admin/lotteries/${id}`),
  create: (payload: Record<string, unknown>) =>
    apiRequest<Lottery>('/admin/lotteries', { method: 'POST', body: payload }),
  publish: (id: string) =>
    apiRequest<Lottery>(`/admin/lotteries/${id}/publish`, { method: 'POST' }),
  lock: (id: string) =>
    apiRequest<Lottery>(`/admin/lotteries/${id}/lock`, { method: 'POST' }),
  cancel: (id: string) =>
    apiRequest<Lottery>(`/admin/lotteries/${id}/cancel`, { method: 'POST' }),
  commitDraw: (id: string) =>
    apiRequest<{ commitHash: string }>(`/admin/lotteries/${id}/draw/commit`, {
      method: 'POST',
    }),
  revealDraw: (id: string) =>
    apiRequest<DrawResult>(`/admin/lotteries/${id}/draw/reveal`, { method: 'POST' }),
  updateFulfillment: (
    lotteryId: string,
    winnerId: string,
    payload: { status: LotteryWinner['fulfillmentStatus']; evidenceUrl?: string },
  ) =>
    apiRequest<LotteryWinner>(
      `/admin/lotteries/${lotteryId}/winners/${winnerId}/fulfill`,
      { method: 'POST', body: payload },
    ),
}

export const ticketsApi = {
  list: (params?: { lotteryId?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.lotteryId) qs.set('lotteryId', params.lotteryId)
    if (params?.status) qs.set('status', params.status)
    const q = qs.toString()
    return apiRequest<Paginated<Ticket>>(`/admin/tickets${q ? `?${q}` : ''}`)
  },
}

export const settingsApi = {
  get: () => apiRequest<Settings>('/admin/settings'),
  update: (payload: Settings) =>
    apiRequest<Settings>('/admin/settings', { method: 'PUT', body: payload }),
}
