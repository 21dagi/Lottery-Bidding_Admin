import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: string | number
  hint?: string
  className?: string
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-4 shadow-panel',
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-fg">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  )
}
