import type { ChangeEvent } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

type FileUploadProps = {
  label?: string
  accept?: string
  valueName?: string
  onFile: (file: File | null) => void
  className?: string
}

export function FileUpload({
  label = 'Upload file',
  accept = 'image/*',
  valueName,
  onFile,
  className,
}: FileUploadProps) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFile(e.target.files?.[0] ?? null)
  }

  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-2/50 px-4 py-6 text-center hover:bg-surface-2',
        className,
      )}
    >
      <Upload className="h-5 w-5 text-fg-muted" />
      <span className="text-sm font-medium text-fg">{label}</span>
      {valueName ? (
        <span className="text-xs text-accent">{valueName}</span>
      ) : (
        <span className="text-xs text-fg-subtle">PNG, JPG up to 5MB</span>
      )}
      <input type="file" accept={accept} className="hidden" onChange={onChange} />
    </label>
  )
}
