import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { depositsApi } from '@/api/endpoints'
import { connectAdminSocket } from '@/sockets/adminSocket'
import { useUiStore } from '@/stores/uiStore'

export function AppShell() {
  const setPending = useUiStore((s) => s.setPendingDepositsCount)

  const { data } = useQuery({
    queryKey: ['deposits', 'PENDING'],
    queryFn: async () => (await depositsApi.list('PENDING')).data,
  })

  useEffect(() => {
    if (data) setPending(data.total)
  }, [data, setPending])

  useEffect(() => {
    const disconnect = connectAdminSocket()
    return () => {
      disconnect?.()
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
