import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { walletsApi } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import type { Wallet } from '@/types'

export const walletAdjustmentSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required'),
  amount: z.coerce.number().refine((n) => n !== 0, 'Amount cannot be zero'),
})

export type WalletAdjustmentFormValues = z.infer<typeof walletAdjustmentSchema>

type Props = {
  wallet: Wallet
  open: boolean
  onClose: () => void
}

export function WalletAdjustmentModal({ wallet, open, onClose }: Props) {
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<WalletAdjustmentFormValues>({
    resolver: zodResolver(walletAdjustmentSchema),
    defaultValues: { reason: '', amount: 0 },
    mode: 'onChange',
  })

  const reason = watch('reason') ?? ''
  const amount = Number(watch('amount') || 0)
  const reasonOk = reason.trim().length > 0
  const projected = wallet.balance + (Number.isFinite(amount) ? amount : 0)

  const mutation = useMutation({
    mutationFn: (values: WalletAdjustmentFormValues) =>
      walletsApi.adjust(wallet.userId, values.amount, values.reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wallets'] })
      void qc.invalidateQueries({ queryKey: ['users'] })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      reset()
      onClose()
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-adjust-title"
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-panel"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <h2 id="wallet-adjust-title" className="text-lg font-semibold text-fg">
          Adjust wallet — {wallet.userName}
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Current balance: {formatCurrency(wallet.balance)}
        </p>

        <div className="mt-4">
          <Label htmlFor="reason">Reason (required)</Label>
          <Textarea
            id="reason"
            placeholder="Why is this adjustment needed?"
            {...register('reason')}
          />
          {errors.reason ? (
            <p className="mt-1 text-xs text-danger">{errors.reason.message}</p>
          ) : null}
        </div>

        <div className="mt-4">
          <Label htmlFor="amount">Amount (+ credit / − debit)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            disabled={!reasonOk}
            {...register('amount')}
          />
          {!reasonOk ? (
            <p className="mt-1 text-xs text-fg-subtle">
              Enter a reason before setting the amount.
            </p>
          ) : null}
          {errors.amount ? (
            <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>
          ) : null}
        </div>

        <div className="mt-4 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm">
          Projected balance:{' '}
          <span className="font-mono font-semibold">{formatCurrency(projected)}</span>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!reasonOk || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Apply adjustment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
