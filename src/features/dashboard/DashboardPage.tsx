import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dashboardApi } from '@/api/endpoints'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingBlock, PageHeader, Panel } from '@/components/ui/Page'
import { formatCurrency } from '@/lib/utils'

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await dashboardApi.get()).data,
  })

  if (isLoading || !data) return <LoadingBlock />

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ops overview aligned to the user mini-app: lotteries, deposits, wallets."
      />

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Live lotteries" value={data.liveLotteries} />
          <StatCard label="Finished lotteries" value={data.finishedLotteries} />
          <StatCard label="Pending deposits" value={data.pendingDeposits} hint="Review queue" />
          <StatCard label="Tickets sold" value={data.ticketsSold} />
          <StatCard label="Users" value={data.totalUsers} />
          <StatCard label="Active users" value={data.activeUsers} />
          <StatCard label="Banned" value={data.bannedUsers} />
          <StatCard
            label="Wallet balances"
            value={formatCurrency(data.walletBalancesTotal)}
          />
          <StatCard label="Pending fulfillments" value={data.pendingFulfillments} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Sales & deposits (7 days)" className="xl:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesTrend}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#0f766e"
                    fill="url(#salesFill)"
                    name="Ticket sales"
                  />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    stroke="#0369a1"
                    fill="transparent"
                    name="Deposits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Quick links">
            <ul className="space-y-2 text-sm">
              <li>
                <Link className="text-accent hover:underline" to="/lotteries/new">
                  Create lottery with prizes
                </Link>
              </li>
              <li>
                <Link className="text-accent hover:underline" to="/deposits">
                  Review pending deposits
                </Link>
              </li>
              <li>
                <Link className="text-accent hover:underline" to="/lotteries">
                  Manage live / finished draws
                </Link>
              </li>
              <li>
                <Link className="text-accent hover:underline" to="/settings">
                  Payment accounts (user deposit methods)
                </Link>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
