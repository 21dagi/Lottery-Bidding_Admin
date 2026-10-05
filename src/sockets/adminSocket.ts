import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'
import { queryClient } from '@/app/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import type { DashboardMetrics, Lottery } from '@/types'

let socket: Socket | null = null

export function connectAdminSocket() {
  if (env.VITE_USE_MOCKS) {
    const interval = window.setInterval(() => {
      queryClient.setQueryData<DashboardMetrics>(['dashboard'], (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          ticketsSold: prev.ticketsSold + (Math.random() > 0.7 ? 1 : 0),
        }
      })
    }, 12_000)
    return () => window.clearInterval(interval)
  }

  const token = useAuthStore.getState().accessToken
  if (!token || socket?.connected) return () => undefined

  socket = io(`${env.VITE_WS_URL}/ws/admin`, {
    auth: { token },
    transports: ['websocket'],
  })

  socket.on('dashboard:counters', (payload: Partial<DashboardMetrics>) => {
    queryClient.setQueryData<DashboardMetrics>(['dashboard'], (prev) =>
      prev ? { ...prev, ...payload } : prev,
    )
  })

  socket.on('deposits:pending_count', (count: number) => {
    useUiStore.getState().setPendingDepositsCount(count)
    void queryClient.invalidateQueries({ queryKey: ['deposits'] })
  })

  socket.on(
    'lottery:sales',
    (payload: { lotteryId: string; ticketsSold: number; ticketsAvailable: number }) => {
      queryClient.setQueryData<Lottery>(['lotteries', payload.lotteryId], (prev) =>
        prev
          ? {
              ...prev,
              ticketsSold: payload.ticketsSold,
              ticketsAvailable: payload.ticketsAvailable,
            }
          : prev,
      )
    },
  )

  return () => {
    socket?.disconnect()
    socket = null
  }
}

export function disconnectAdminSocket() {
  socket?.disconnect()
  socket = null
}
