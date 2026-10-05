import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-fg-muted',
        success: 'bg-success/15 text-success',
        danger: 'bg-danger/15 text-danger',
        warning: 'bg-warning/20 text-warning',
        accent: 'bg-accent/15 text-accent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
