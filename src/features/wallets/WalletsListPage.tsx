import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { walletsApi } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { LoadingBlock, PageHeader } from '@/components/ui/Page'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Wallet } from '@/types'
import { WalletAdjustmentModal } from './WalletAdjustmentModal'

export function WalletsListPage() {
  const [selected, setSelected] = useState<Wallet | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => (await walletsApi.list()).data,
  })

  const columns = useMemo<ColumnDef<Wallet>[]>(
    () => [
      { header: 'User', accessorKey: 'userName' },
      {
        header: 'Balance',
        cell: ({ row }) => (
          <span className="font-mono tabular-nums">
            {formatCurrency(row.original.balance)}
          </span>
        ),
      },
      {
        header: 'Updated',
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>
            Adjust
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="Wallets"
        description="View balances and apply manual adjustments (reason required)."
      />
      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <DataTable data={data.items} columns={columns} />
      )}
      {selected ? (
        <WalletAdjustmentModal
          wallet={selected}
          open
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  )
}
