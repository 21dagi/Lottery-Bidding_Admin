import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-fg-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Panel({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-surface p-4 shadow-panel',
        className,
      )}
    >
      {title ? (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-fg-muted">
      {message}
    </div>
  )
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-fg-muted">
      {label}
    </div>
  )
}
