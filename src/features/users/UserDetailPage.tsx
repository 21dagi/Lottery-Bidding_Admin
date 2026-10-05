import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/endpoints'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LoadingBlock, PageHeader, Panel } from '@/components/ui/Page'
import { formatCurrency, formatDate } from '@/lib/utils'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const [banOpen, setBanOpen] = useState(false)
  const [unbanOpen, setUnbanOpen] = useState(false)
  const [reason, setReason] = useState('')

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: async () => (await usersApi.get(id)).data,
    enabled: Boolean(id),
  })

  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      setBanOpen(false)
      setReason('')
    },
  })

  const unbanMutation = useMutation({
    mutationFn: () => usersApi.unban(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      setUnbanOpen(false)
    },
  })

  if (isLoading || !user) return <LoadingBlock />

  return (
    <div>
      <PageHeader
        title={user.displayName}
        description={`Telegram ${user.telegramId} · ${user.phone}`}
        actions={
          user.status === 'BANNED' ? (
            <Button variant="success" onClick={() => setUnbanOpen(true)}>
              Unban
            </Button>
          ) : (
            <Button variant="danger" onClick={() => setBanOpen(true)}>
              Ban user
            </Button>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Profile">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Status</dt>
              <dd>
                <Badge variant={user.status === 'BANNED' ? 'danger' : 'success'}>
                  {user.status}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Wallet</dt>
              <dd className="font-mono">{formatCurrency(user.walletBalance)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Tickets bought</dt>
              <dd>{user.ticketsPurchased}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-fg-muted">Joined</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
            {user.banReason ? (
              <div>
                <dt className="text-fg-muted">Ban reason</dt>
                <dd className="mt-1 text-danger">{user.banReason}</dd>
              </div>
            ) : null}
          </dl>
        </Panel>
        <Panel title="Quick links" className="md:col-span-2">
          <div className="flex flex-wrap gap-3">
            <Link className="text-sm text-accent hover:underline" to="/wallets">
              Wallets
            </Link>
            <Link className="text-sm text-accent hover:underline" to="/deposits">
              Deposits
            </Link>
            <Link className="text-sm text-accent hover:underline" to="/lotteries">
              Lotteries
            </Link>
          </div>
        </Panel>
      </div>

      <ConfirmDialog
        open={banOpen}
        title="Ban this user?"
        description="They will lose access to the mini app."
        danger
        requireReason
        reason={reason}
        onReasonChange={setReason}
        confirmLabel="Ban user"
        onCancel={() => setBanOpen(false)}
        onConfirm={() => banMutation.mutate()}
        loading={banMutation.isPending}
      />
      <ConfirmDialog
        open={unbanOpen}
        title="Unban this user?"
        description="They will regain platform access."
        confirmLabel="Unban"
        onCancel={() => setUnbanOpen(false)}
        onConfirm={() => unbanMutation.mutate()}
        loading={unbanMutation.isPending}
      />
    </div>
  )
}
