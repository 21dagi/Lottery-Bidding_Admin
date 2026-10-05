import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { depositsApi } from '@/api/endpoints'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Input'
import { LoadingBlock, PageHeader } from '@/components/ui/Page'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Deposit } from '@/types'
import { DepositDetailDrawer } from './DepositDetailDrawer'

export function DepositsQueuePage() {
  const [status, setStatus] = useState('PENDING')
  const [selected, setSelected] = useState<Deposit | null>(null)
  const [approveTarget, setApproveTarget] = useState<Deposit | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Deposit | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['deposits', status],
    queryFn: async () =>
      (await depositsApi.list(status || undefined)).data,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => depositsApi.approve(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['deposits'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      void qc.invalidateQueries({ queryKey: ['wallets'] })
      setApproveTarget(null)
      setSelected(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      depositsApi.reject(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['deposits'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      setRejectTarget(null)
      setRejectReason('')
      setSelected(null)
    },
  })

  const columns = useMemo<ColumnDef<Deposit>[]>(
    () => [
      {
        header: 'User',
        accessorKey: 'userName',
      },
      {
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-mono">{formatCurrency(row.original.amount)}</span>
        ),
      },
      { header: 'Method', accessorKey: 'method' },
      {
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.status
          return (
            <Badge
              variant={
                s === 'PENDING' ? 'warning' : s === 'APPROVED' ? 'success' : 'danger'
              }
            >
              {s}
            </Badge>
          )
        },
      },
      {
        header: 'Submitted',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        header: 'Screenshot',
        cell: ({ row }) => (
          <img
            src={row.original.screenshotUrl}
            alt="Payment screenshot"
            className="h-12 w-9 rounded object-cover"
            onClick={(e) => {
              e.stopPropagation()
              setSelected(row.original)
            }}
          />
        ),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) =>
          row.original.status === 'PENDING' ? (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="success"
                onClick={() => setApproveTarget(row.original)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setRejectTarget(row.original)}
              >
                Reject
              </Button>
            </div>
          ) : null,
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="Deposits"
        description="Review payment screenshots. Pending queue is sorted oldest-first."
      />
      <div className="mb-4">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[200px]"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </Select>
      </div>

      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <DataTable
          data={data.items}
          columns={columns}
          onRowClick={setSelected}
          emptyMessage="No deposits in this queue"
        />
      )}

      <DepositDetailDrawer
        deposit={selected}
        onClose={() => setSelected(null)}
        onApprove={(d) => setApproveTarget(d)}
        onReject={(d) => setRejectTarget(d)}
      />

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve this deposit?"
        description={
          approveTarget
            ? `Credit ${formatCurrency(approveTarget.amount)} to ${approveTarget.userName}.`
            : undefined
        }
        confirmLabel="Approve"
        onCancel={() => setApproveTarget(null)}
        onConfirm={() => approveTarget && approveMutation.mutate(approveTarget.id)}
        loading={approveMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject this deposit?"
        description="A reason is required for the audit trail and user notice."
        danger
        requireReason
        reason={rejectReason}
        onReasonChange={setRejectReason}
        confirmLabel="Reject"
        onCancel={() => {
          setRejectTarget(null)
          setRejectReason('')
        }}
        onConfirm={() =>
          rejectTarget &&
          rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason })
        }
        loading={rejectMutation.isPending}
      />
    </div>
  )
}
