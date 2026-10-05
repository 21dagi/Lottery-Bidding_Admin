import { useEffect } from 'react'
import { Button } from './Button'
import { Textarea } from './Input'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  requireReason?: boolean
  reason?: string
  onReasonChange?: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  requireReason,
  reason = '',
  onReasonChange,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const canConfirm = !requireReason || reason.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-panel"
      >
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-fg-muted">{description}</p>
        ) : null}
        {requireReason ? (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-fg-muted">
              Reason (required)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => onReasonChange?.(e.target.value)}
              placeholder="Explain why…"
              autoFocus
            />
          </div>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'default'}
            onClick={onConfirm}
            disabled={!canConfirm || loading}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
