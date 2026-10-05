import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import { RequireAuth } from '@/auth/RequireAuth'
import { LoginPage } from '@/auth/LoginPage'
import { LoadingBlock } from '@/components/ui/Page'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const UsersListPage = lazy(() =>
  import('@/features/users/UsersListPage').then((m) => ({
    default: m.UsersListPage,
  })),
)
const UserDetailPage = lazy(() =>
  import('@/features/users/UserDetailPage').then((m) => ({
    default: m.UserDetailPage,
  })),
)
const WalletsListPage = lazy(() =>
  import('@/features/wallets/WalletsListPage').then((m) => ({
    default: m.WalletsListPage,
  })),
)
const DepositsQueuePage = lazy(() =>
  import('@/features/deposits/DepositsQueuePage').then((m) => ({
    default: m.DepositsQueuePage,
  })),
)
const LotteriesListPage = lazy(() =>
  import('@/features/lotteries/LotteriesListPage').then((m) => ({
    default: m.LotteriesListPage,
  })),
)
const LotteryCreateWizard = lazy(() =>
  import('@/features/lotteries/LotteryCreateWizard').then((m) => ({
    default: m.LotteryCreateWizard,
  })),
)
const LotteryDetailPage = lazy(() =>
  import('@/features/lotteries/LotteryDetailPage').then((m) => ({
    default: m.LotteryDetailPage,
  })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
)

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingBlock />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <SuspensePage>
                <DashboardPage />
              </SuspensePage>
            }
          />
          <Route
            path="lotteries"
            element={
              <SuspensePage>
                <LotteriesListPage />
              </SuspensePage>
            }
          />
          <Route
            path="lotteries/new"
            element={
              <SuspensePage>
                <LotteryCreateWizard />
              </SuspensePage>
            }
          />
          <Route
            path="lotteries/:id"
            element={
              <SuspensePage>
                <LotteryDetailPage />
              </SuspensePage>
            }
          />
          <Route
            path="deposits"
            element={
              <SuspensePage>
                <DepositsQueuePage />
              </SuspensePage>
            }
          />
          <Route
            path="users"
            element={
              <SuspensePage>
                <UsersListPage />
              </SuspensePage>
            }
          />
          <Route
            path="users/:id"
            element={
              <SuspensePage>
                <UserDetailPage />
              </SuspensePage>
            }
          />
          <Route
            path="wallets"
            element={
              <SuspensePage>
                <WalletsListPage />
              </SuspensePage>
            }
          />
          <Route
            path="settings"
            element={
              <SuspensePage>
                <SettingsPage />
              </SuspensePage>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
