import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { usersApi } from '@/api/endpoints'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { Input, Select } from '@/components/ui/Input'
import { LoadingBlock, PageHeader } from '@/components/ui/Page'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PlatformUser } from '@/types'

export function UsersListPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', q, status],
    queryFn: async () =>
      (await usersApi.list({ q: q || undefined, status: status || undefined })).data,
  })

  const columns = useMemo<ColumnDef<PlatformUser>[]>(
    () => [
      {
        header: 'User',
        cell: ({ row }) => (
          <div>
            <Link
              to={`/users/${row.original.id}`}
              className="font-medium text-accent hover:underline"
            >
              {row.original.displayName}
            </Link>
            <p className="text-xs text-fg-subtle">TG {row.original.telegramId}</p>
          </div>
        ),
      },
      { header: 'Phone', accessorKey: 'phone' },
      {
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'BANNED' ? 'danger' : 'success'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: 'Wallet',
        cell: ({ row }) => formatCurrency(row.original.walletBalance),
      },
      { header: 'Tickets', accessorKey: 'ticketsPurchased' },
      {
        header: 'Joined',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="Users"
        description="Browse platform users, ban/unban, and inspect wallet history."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search name, phone, telegram…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[160px]"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </Select>
      </div>
      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <DataTable data={data.items} columns={columns} />
      )}
    </div>
  )
}
