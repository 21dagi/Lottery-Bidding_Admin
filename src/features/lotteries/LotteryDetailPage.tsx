import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { lotteriesApi, ticketsApi } from '@/api/endpoints'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable } from '@/components/ui/DataTable'
import { FileUpload } from '@/components/ui/FileUpload'
import { Select } from '@/components/ui/Input'
import { LoadingBlock, PageHeader, Panel } from '@/components/ui/Page'
import { DrawPanel } from '@/features/draw/DrawPanel'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { LotteryWinner, Ticket } from '@/types'

const tabs = ['overview', 'prizes', 'tickets', 'draw', 'winners', 'history'] as const

export function LotteryDetailPage() {
  const { id = '' } = useParams()
  const [tab, setTab] = useState<(typeof tabs)[number]>('overview')
  const [action, setAction] = useState<'publish' | 'lock' | 'cancel' | null>(null)
  const [fulfillWinner, setFulfillWinner] = useState<LotteryWinner | null>(null)
  const [fulfillStatus, setFulfillStatus] =
    useState<LotteryWinner['fulfillmentStatus']>('PAID')
  const [evidenceUrl, setEvidenceUrl] = useState<string>()
  const qc = useQueryClient()

  const { data: lottery, isLoading } = useQuery({
    queryKey: ['lotteries', id],
    queryFn: async () => (await lotteriesApi.get(id)).data,
    enabled: Boolean(id),
  })

  const { data: tickets } = useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => (await ticketsApi.list({ lotteryId: id })).data,
    enabled: Boolean(id) && tab === 'tickets',
  })

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!action) return
      if (action === 'publish') return lotteriesApi.publish(id)
      if (action === 'lock') return lotteriesApi.lock(id)
      return lotteriesApi.cancel(id)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lotteries', id] })
      void qc.invalidateQueries({ queryKey: ['lotteries'] })
      setAction(null)
    },
  })

  const fulfillMutation = useMutation({
    mutationFn: () =>
      lotteriesApi.updateFulfillment(id, fulfillWinner!.id, {
        status: fulfillStatus,
        evidenceUrl,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lotteries', id] })
      setFulfillWinner(null)
    },
  })

  const ticketColumns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      { header: '#', accessorKey: 'number' },
      {
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.status
          return (
            <Badge
              variant={
                s === 'SOLD' ? 'success' : s === 'RESERVED' ? 'warning' : 'default'
              }
            >
              {s}
            </Badge>
          )
        },
      },
      {
        header: 'Owner',
        cell: ({ row }) =>
          row.original.ownerId ? (
            <Link
              to={`/users/${row.original.ownerId}`}
              className="text-accent hover:underline"
            >
              {row.original.ownerName}
            </Link>
          ) : (
            '—'
          ),
      },
    ],
    [],
  )

  if (isLoading || !lottery) return <LoadingBlock />

  return (
    <div>
      <PageHeader
        title={lottery.title}
        description={`${lottery.seriesLabel} · ${lottery.description}`}
        actions={
          <>
            <Badge
              variant={
                lottery.status === 'LIVE'
                  ? 'success'
                  : lottery.status === 'CANCELLED'
                    ? 'danger'
                    : 'default'
              }
            >
              {lottery.status}
            </Badge>
            {lottery.status === 'DRAFT' ? (
              <Button onClick={() => setAction('publish')}>Publish</Button>
            ) : null}
            {lottery.status === 'LIVE' ? (
              <Button variant="secondary" onClick={() => setAction('lock')}>
                Lock
              </Button>
            ) : null}
            {lottery.status !== 'CANCELLED' && lottery.status !== 'COMPLETED' ? (
              <Button variant="danger" onClick={() => setAction('cancel')}>
                Cancel
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? 'rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg'
                : 'rounded-md px-3 py-1.5 text-sm text-fg-muted hover:bg-surface-2'
            }
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Details">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-fg-muted">Ticket price</dt>
                <dd className="font-mono">{formatCurrency(lottery.ticketPriceEtb)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Sold / total</dt>
                <dd>
                  {lottery.ticketsSold} / {lottery.totalTickets}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Reserved</dt>
                <dd>{lottery.ticketsReserved}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Closes</dt>
                <dd>{formatDate(lottery.closesAt)}</dd>
              </div>
            </dl>
            {lottery.coverUrl ? (
              <img
                src={lottery.coverUrl}
                alt=""
                className="mt-4 w-full rounded-lg border border-border object-cover"
              />
            ) : null}
          </Panel>
          <Panel title="Prize summary">
            <ul className="space-y-2">
              {lottery.prizes
                .slice()
                .sort((a, b) => a.place - b.place)
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      Place {p.place} · <Badge className="ml-1">{p.kind}</Badge>
                    </span>
                    <span className="font-medium">{p.title}</span>
                  </li>
                ))}
            </ul>
          </Panel>
        </div>
      ) : null}

      {tab === 'prizes' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lottery.prizes
            .slice()
            .sort((a, b) => a.place - b.place)
            .map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-lg border border-border bg-surface shadow-panel"
              >
                {p.kind === 'product' && p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/1] items-center justify-center bg-accent/10 font-mono text-2xl font-semibold text-accent">
                    {p.amountEtb ? formatCurrency(p.amountEtb) : p.title}
                  </div>
                )}
                <div className="space-y-1 p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">Place {p.place}</Badge>
                    <Badge>{p.kind}</Badge>
                  </div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-fg-muted">{p.subtitle}</p>
                  <p className="text-xs text-fg-subtle">{p.detail}</p>
                  {p.specs?.length ? (
                    <ul className="mt-2 space-y-0.5 text-xs text-fg-muted">
                      {p.specs.map((s) => (
                        <li key={s.label}>
                          {s.label}: {s.value}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
        </div>
      ) : null}

      {tab === 'tickets' ? (
        <Panel title="Ticket inventory">
          <p className="mb-3 text-sm text-fg-muted">
            Sold {lottery.ticketsSold} · Reserved {lottery.ticketsReserved} · Available{' '}
            {lottery.ticketsAvailable}
          </p>
          {tickets ? (
            <DataTable data={tickets.items} columns={ticketColumns} />
          ) : (
            <LoadingBlock label="Loading tickets…" />
          )}
        </Panel>
      ) : null}

      {tab === 'draw' ? <DrawPanel lottery={lottery} /> : null}

      {tab === 'winners' ? (
        <Panel title="Winners & fulfillment">
          {lottery.winners.length === 0 ? (
            <p className="text-sm text-fg-muted">
              No winners yet. Run the draw after locking sales.
            </p>
          ) : (
            <ul className="space-y-3">
              {lottery.winners.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Place {w.place} · {w.prizeTitle}
                    </p>
                    <p className="text-xs text-fg-muted">
                      Ticket #{w.ticketNumber} · {w.userName} · {w.prizeKind}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        w.fulfillmentStatus === 'PENDING' ? 'warning' : 'success'
                      }
                    >
                      {w.fulfillmentStatus}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFulfillWinner(w)
                        setFulfillStatus(
                          w.prizeKind === 'product' ? 'DELIVERED' : 'PAID',
                        )
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}

      {tab === 'history' ? (
        <Panel title="Lottery history">
          <ol className="space-y-3">
            {lottery.history.map((h) => (
              <li
                key={h.id}
                className="border-l-2 border-accent/40 pl-3"
              >
                <p className="text-xs text-fg-subtle">{formatDate(h.at)}</p>
                <p className="text-sm font-semibold text-fg">{h.title}</p>
                <p className="text-sm text-fg-muted">{h.detail}</p>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      <ConfirmDialog
        open={Boolean(action)}
        title={`${action ? action.charAt(0).toUpperCase() + action.slice(1) : ''} lottery?`}
        description="This is written into this lottery’s history."
        danger={action === 'cancel'}
        confirmLabel={action ? action.charAt(0).toUpperCase() + action.slice(1) : 'Confirm'}
        onCancel={() => setAction(null)}
        onConfirm={() => actionMutation.mutate()}
        loading={actionMutation.isPending}
      />

      {fulfillWinner ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close"
            onClick={() => setFulfillWinner(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-panel">
            <h2 className="text-lg font-semibold">Update fulfillment</h2>
            <p className="mt-1 text-sm text-fg-muted">
              {fulfillWinner.userName} · place {fulfillWinner.place}
            </p>
            <div className="mt-4">
              <Select
                value={fulfillStatus}
                onChange={(e) =>
                  setFulfillStatus(e.target.value as LotteryWinner['fulfillmentStatus'])
                }
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="CREDITED">Credited</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
              </Select>
            </div>
            <div className="mt-3">
              <FileUpload
                label="Payout / delivery evidence"
                onFile={(file) =>
                  setEvidenceUrl(
                    file
                      ? `https://placehold.co/400x600/dcfce7/166534?text=${encodeURIComponent(file.name)}`
                      : undefined,
                  )
                }
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFulfillWinner(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => fulfillMutation.mutate()}
                disabled={fulfillMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
