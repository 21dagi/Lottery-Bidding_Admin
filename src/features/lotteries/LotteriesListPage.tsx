import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { lotteriesApi } from '@/api/endpoints'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { LoadingBlock, PageHeader } from '@/components/ui/Page'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Lottery, LotteryStatus } from '@/types'

function statusVariant(status: LotteryStatus) {
  switch (status) {
    case 'LIVE':
      return 'success' as const
    case 'LOCKED':
      return 'warning' as const
    case 'CANCELLED':
      return 'danger' as const
    case 'COMPLETED':
      return 'accent' as const
    default:
      return 'default' as const
  }
}

export function LotteriesListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['lotteries'],
    queryFn: async () => (await lotteriesApi.list()).data,
  })

  const columns = useMemo<ColumnDef<Lottery>[]>(
    () => [
      {
        header: 'Lottery',
        cell: ({ row }) => (
          <div>
            <Link
              to={`/lotteries/${row.original.id}`}
              className="font-medium text-accent hover:underline"
            >
              {row.original.title}
            </Link>
            <p className="text-xs text-fg-subtle">{row.original.seriesLabel}</p>
          </div>
        ),
      },
      {
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: 'Prizes',
        cell: ({ row }) =>
          row.original.prizes
            .slice()
            .sort((a, b) => a.place - b.place)
            .map((p) => `${p.place}:${p.kind}`)
            .join(' · '),
      },
      {
        header: 'Price',
        cell: ({ row }) => formatCurrency(row.original.ticketPriceEtb),
      },
      {
        header: 'Sold / Qty',
        cell: ({ row }) =>
          `${row.original.ticketsSold} / ${row.original.totalTickets}`,
      },
      {
        header: 'Closes',
        cell: ({ row }) => formatDate(row.original.closesAt),
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="Lotteries"
        description="Create bids with embedded prizes (places 1–3). Tickets, draw, winners, and history live on each lottery."
        actions={
          <Link to="/lotteries/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create lottery
            </Button>
          </Link>
        }
      />
      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <DataTable data={data.items} columns={columns} />
      )}
    </div>
  )
}
