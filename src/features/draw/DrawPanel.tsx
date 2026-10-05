import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { lotteriesApi } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Panel } from '@/components/ui/Page'
import type { DrawResult, Lottery } from '@/types'

type Props = { lottery: Lottery }

export function DrawPanel({ lottery }: Props) {
  const qc = useQueryClient()
  const [confirmReveal, setConfirmReveal] = useState(false)
  const [result, setResult] = useState<DrawResult | null>(null)

  const commitMutation = useMutation({
    mutationFn: () => lotteriesApi.commitDraw(lottery.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lotteries', lottery.id] })
    },
  })

  const revealMutation = useMutation({
    mutationFn: () => lotteriesApi.revealDraw(lottery.id),
    onSuccess: (res) => {
      setResult(res.data)
      setConfirmReveal(false)
      void qc.invalidateQueries({ queryKey: ['lotteries', lottery.id] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const canDraw =
    lottery.status === 'LOCKED' ||
    lottery.status === 'LIVE' ||
    lottery.status === 'COMPLETED'

  return (
    <Panel title="Draw (seed commit → reveal)">
      {!canDraw ? (
        <p className="text-sm text-fg-muted">
          Publish and lock the lottery before running the draw.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
              Committed hash
            </p>
            {lottery.commitHash ? (
              <p className="mt-1 break-all font-mono text-xs text-fg">
                {lottery.commitHash}
              </p>
            ) : (
              <div className="mt-2">
                <p className="mb-2 text-sm text-fg-muted">
                  Commit a seed hash before the draw button is enabled.
                </p>
                <Button
                  onClick={() => commitMutation.mutate()}
                  disabled={commitMutation.isPending}
                >
                  {commitMutation.isPending ? 'Committing…' : 'Commit seed hash'}
                </Button>
              </div>
            )}
          </div>

          {lottery.commitHash && lottery.status !== 'COMPLETED' ? (
            <Button
              variant="danger"
              disabled={!lottery.commitHash}
              onClick={() => setConfirmReveal(true)}
            >
              Reveal seed & execute draw
            </Button>
          ) : null}

          {lottery.revealedSeed || result ? (
            <div className="rounded-md border border-border bg-surface-2 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Revealed seed
              </p>
              <p className="mt-1 font-mono text-sm">
                {result?.revealedSeed ?? lottery.revealedSeed}
              </p>
              {(result?.winners ?? lottery.winners).length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {(result?.winners ?? lottery.winners).map((w) => (
                    <li key={w.id}>
                      Place {w.place}: ticket #{w.ticketNumber} → {w.userName} (
                      {w.prizeTitle})
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-xs text-fg-subtle">
                Full timeline is on the History tab for this lottery.
              </p>
            </div>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={confirmReveal}
        title="Execute draw now?"
        description="Reveals the seed, assigns winning tickets per prize place, and records lottery history."
        danger
        confirmLabel="Reveal & draw"
        onCancel={() => setConfirmReveal(false)}
        onConfirm={() => revealMutation.mutate()}
        loading={revealMutation.isPending}
      />
    </Panel>
  )
}
