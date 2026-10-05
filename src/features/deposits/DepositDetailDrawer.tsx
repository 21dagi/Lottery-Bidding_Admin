import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Deposit } from '@/types'

type Props = {
  deposit: Deposit | null
  onClose: () => void
  onApprove: (d: Deposit) => void
  onReject: (d: Deposit) => void
}

export function DepositDetailDrawer({
  deposit,
  onClose,
  onApprove,
  onReject,
}: Props) {
  if (!deposit) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-panel">
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">Deposit {deposit.id}</h2>
            <p className="text-sm text-fg-muted">{deposit.userName}</p>
          </div>
          <Badge
            variant={
              deposit.status === 'PENDING'
                ? 'warning'
                : deposit.status === 'APPROVED'
                  ? 'success'
                  : 'danger'
            }
          >
            {deposit.status}
          </Badge>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-fg-muted">Amount</dt>
              <dd className="font-mono font-semibold">
                {formatCurrency(deposit.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted">Method</dt>
              <dd>{deposit.method}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Submitted</dt>
              <dd>{formatDate(deposit.createdAt)}</dd>
            </div>
            {deposit.reviewedAt ? (
              <div>
                <dt className="text-fg-muted">Reviewed</dt>
                <dd>{formatDate(deposit.reviewedAt)}</dd>
              </div>
            ) : null}
            {deposit.verificationOutcome ? (
              <div className="col-span-2">
                <dt className="text-fg-muted">Verification</dt>
                <dd className="font-mono text-xs">{deposit.verificationOutcome}</dd>
              </div>
            ) : null}
            {deposit.verifiedAmount !== undefined ? (
              <div>
                <dt className="text-fg-muted">Verified amount</dt>
                <dd className="font-mono">{formatCurrency(deposit.verifiedAmount)}</dd>
              </div>
            ) : null}
            {deposit.verifiedProviderSource ? (
              <div>
                <dt className="text-fg-muted">Receipt source</dt>
                <dd className="font-mono text-xs">{deposit.verifiedProviderSource}</dd>
              </div>
            ) : null}
            {deposit.bankReference ? (
              <div className="col-span-2">
                <dt className="text-fg-muted">Bank reference</dt>
                <dd className="break-all font-mono text-xs">{deposit.bankReference}</dd>
              </div>
            ) : null}
            {deposit.externalReference ? (
              <div className="col-span-2">
                <dt className="text-fg-muted">User submitted</dt>
                <dd className="break-all font-mono text-xs">{deposit.externalReference}</dd>
              </div>
            ) : null}
            {deposit.accountMatch ? (
              <div>
                <dt className="text-fg-muted">Account match</dt>
                <dd>{deposit.accountMatch}</dd>
              </div>
            ) : null}
          </dl>

          {deposit.verificationReason ? (
            <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
              {deposit.verificationReason}
            </p>
          ) : null}

          {deposit.rejectionReason ? (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {deposit.rejectionReason}
            </p>
          ) : null}

          {deposit.screenshotUrl ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Payment screenshot
              </p>
              <img
                src={deposit.screenshotUrl}
                alt="Payment proof"
                className="w-full rounded-lg border border-border object-contain"
              />
            </div>
          ) : (
            <p className="text-sm text-fg-muted">No screenshot attached.</p>
          )}
        </div>

        {deposit.status === 'PENDING' ? (
          <div className="flex gap-2 border-t border-border p-4">
            <Button
              className="flex-1"
              variant="success"
              onClick={() => onApprove(deposit)}
            >
              Approve
            </Button>
            <Button
              className="flex-1"
              variant="danger"
              onClick={() => onReject(deposit)}
            >
              Reject
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}
