import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { lotteriesApi, mediaApi } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { PageHeader, Panel } from '@/components/ui/Page'
import { FileUpload } from '@/components/ui/FileUpload'
import { cn, formatCurrency } from '@/lib/utils'

const prizeSchema = z
  .object({
    place: z.coerce.number().min(1).max(3),
    kind: z.enum(['money', 'product']),
    title: z.string().min(1, 'Title required'),
    subtitle: z.string().min(1, 'Subtitle required'),
    detail: z.string().min(1, 'Detail required'),
    amountEtb: z.coerce.number().optional(),
    imageFileName: z.string().optional(),
    fulfillmentNote: z.string().optional(),
    specModel: z.string().optional(),
    specStorage: z.string().optional(),
    specOther: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.kind === 'money' && (!val.amountEtb || val.amountEtb <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountEtb'],
        message: 'ETB amount required for money prizes',
      })
    }
    if (val.kind === 'product' && !val.imageFileName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageFileName'],
        message: 'Product image required',
      })
    }
  })

const schema = z.object({
  title: z.string().min(1),
  seriesLabel: z.string().min(1),
  description: z.string().min(1),
  ticketPriceEtb: z.coerce.number().min(1),
  totalTickets: z.coerce.number().min(1),
  closesAt: z.string().min(1),
  coverFileName: z.string().optional(),
  publish: z.boolean(),
  prizes: z.array(prizeSchema).min(1).max(3),
})

type FormValues = z.infer<typeof schema>

const steps = ['Lottery info', 'Tickets', 'Prizes (1–3)', 'Review'] as const

const defaultPrize = (place: 1 | 2 | 3): FormValues['prizes'][number] => ({
  place,
  kind: 'money',
  title: place === 1 ? '100,000 ETB' : place === 2 ? '50,000 ETB' : '10,000 ETB',
  subtitle: 'Cash prize',
  detail: '',
  amountEtb: place === 1 ? 100000 : place === 2 ? 50000 : 10000,
  imageFileName: '',
  fulfillmentNote: '',
  specModel: '',
  specStorage: '',
  specOther: '',
})

export function LotteryCreateWizard() {
  const [step, setStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const coverFileRef = useRef<File | null>(null)
  const prizeFilesRef = useRef<Record<number, File | null>>({})
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      seriesLabel: '',
      description: '',
      ticketPriceEtb: 100,
      totalTickets: 1000,
      closesAt: new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 16),
      publish: true,
      coverFileName: '',
      prizes: [defaultPrize(1), defaultPrize(2), defaultPrize(3)],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'prizes',
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let coverMediaId: string | undefined
      if (coverFileRef.current) {
        const uploaded = await mediaApi.upload(coverFileRef.current)
        coverMediaId = uploaded.id
      }

      const prizes = []
      for (let i = 0; i < values.prizes.length; i++) {
        const p = values.prizes[i]
        let imageMediaId: string | undefined
        if (p.kind === 'product') {
          const file = prizeFilesRef.current[i]
          if (!file) {
            throw new Error(`Product image required for place ${p.place}`)
          }
          const uploaded = await mediaApi.upload(file)
          imageMediaId = uploaded.id
        }

        prizes.push({
          place: Number(p.place) as 1 | 2 | 3,
          kind: p.kind,
          title:
            p.kind === 'money' && p.amountEtb
              ? formatCurrency(p.amountEtb)
              : p.title,
          subtitle: p.subtitle,
          detail: p.detail,
          amountEtb: p.kind === 'money' ? Number(p.amountEtb) : undefined,
          imageMediaId,
          fulfillmentNote: p.fulfillmentNote || undefined,
          specs:
            p.kind === 'product'
              ? [
                  p.specModel ? { label: 'Model', value: p.specModel } : null,
                  p.specStorage
                    ? { label: 'Storage', value: p.specStorage }
                    : null,
                  p.specOther ? { label: 'Notes', value: p.specOther } : null,
                ].filter(Boolean)
              : undefined,
        })
      }

      return lotteriesApi.create({
        title: values.title,
        seriesLabel: values.seriesLabel,
        description: values.description,
        ticketPriceEtb: Number(values.ticketPriceEtb),
        totalTickets: Number(values.totalTickets),
        closesAt: new Date(values.closesAt).toISOString(),
        coverMediaId,
        publish: values.publish,
        prizes,
      })
    },
    onSuccess: (res) => navigate(`/lotteries/${res.data.id}`),
    onError: (err) => {
      setSubmitError(err instanceof Error ? err.message : 'Create failed')
    },
  })

  const next = async () => {
    const fieldsByStep: (keyof FormValues)[][] = [
      ['title', 'seriesLabel', 'description', 'closesAt'],
      ['ticketPriceEtb', 'totalTickets'],
      ['prizes'],
      [],
    ]
    const ok = await form.trigger(fieldsByStep[step])
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  return (
    <div>
      <PageHeader
        title="Create lottery / bid"
        description="Prizes (places 1–3, money or product) are configured here — not as a separate page."
      />

      <ol className="mb-6 flex flex-wrap gap-2">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              i === step
                ? 'bg-accent text-ink'
                : i < step
                  ? 'bg-accent/20 text-accent'
                  : 'bg-surface-2 text-fg-muted',
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          setSubmitError(null)
          mutation.mutate(values)
        })}
      >
        {step === 0 ? (
          <Panel title="Lottery info">
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input {...form.register('title')} placeholder="Grand Obsidian Draw" />
              </div>
              <div>
                <Label>Series label</Label>
                <Input {...form.register('seriesLabel')} placeholder="Series IX" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...form.register('description')} />
              </div>
              <div>
                <Label>Closes at</Label>
                <Input type="datetime-local" {...form.register('closesAt')} />
              </div>
              <FileUpload
                label="Cover image (shown on user app cards)"
                valueName={form.watch('coverFileName') || undefined}
                onFile={(file) => {
                  coverFileRef.current = file
                  form.setValue('coverFileName', file?.name ?? '', {
                    shouldValidate: true,
                  })
                }}
              />
            </div>
          </Panel>
        ) : null}

        {step === 1 ? (
          <Panel title="Ticket config">
            <p className="mb-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
              Ticket quantity cannot be reduced once sales start after publish.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Total tickets</Label>
                <Input type="number" {...form.register('totalTickets')} />
              </div>
              <div>
                <Label>Ticket price (ETB)</Label>
                <Input type="number" step="1" {...form.register('ticketPriceEtb')} />
              </div>
            </div>
          </Panel>
        ) : null}

        {step === 2 ? (
          <Panel title="Prize places (bound to this lottery)">
            <p className="mb-4 text-sm text-fg-muted">
              Configure place 1, 2, and/or 3. Money prizes need ETB value; product prizes need
              image + description (same fields the user app shows).
            </p>
            <div className="space-y-4">
              {fields.map((field, index) => {
                const kind = form.watch(`prizes.${index}.kind`)
                return (
                  <div key={field.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        Place {form.watch(`prizes.${index}.place`)} prize
                      </p>
                      {fields.length > 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            delete prizeFilesRef.current[index]
                            remove(index)
                          }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label>Place</Label>
                        <Select {...form.register(`prizes.${index}.place`)}>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Kind</Label>
                        <Select {...form.register(`prizes.${index}.kind`)}>
                          <option value="money">Money</option>
                          <option value="product">Product</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input {...form.register(`prizes.${index}.title`)} />
                      </div>
                      <div>
                        <Label>Subtitle</Label>
                        <Input {...form.register(`prizes.${index}.subtitle`)} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Fulfillment note</Label>
                        <Input
                          {...form.register(`prizes.${index}.fulfillmentNote`)}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Detail</Label>
                      <Textarea {...form.register(`prizes.${index}.detail`)} />
                    </div>
                    {kind === 'money' ? (
                      <div className="mt-3">
                        <Label>Amount (ETB)</Label>
                        <Input
                          type="number"
                          {...form.register(`prizes.${index}.amountEtb`)}
                        />
                        {form.formState.errors.prizes?.[index]?.amountEtb ? (
                          <p className="mt-1 text-xs text-danger">
                            {form.formState.errors.prizes[index]?.amountEtb?.message}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        <FileUpload
                          label="Product image"
                          valueName={
                            form.watch(`prizes.${index}.imageFileName`) || undefined
                          }
                          onFile={(file) => {
                            prizeFilesRef.current[index] = file
                            form.setValue(
                              `prizes.${index}.imageFileName`,
                              file?.name ?? '',
                              { shouldValidate: true },
                            )
                          }}
                        />
                        {form.formState.errors.prizes?.[index]?.imageFileName ? (
                          <p className="text-xs text-danger">
                            {
                              form.formState.errors.prizes[index]?.imageFileName
                                ?.message
                            }
                          </p>
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <Label>Model</Label>
                            <Input {...form.register(`prizes.${index}.specModel`)} />
                          </div>
                          <div>
                            <Label>Storage / size</Label>
                            <Input {...form.register(`prizes.${index}.specStorage`)} />
                          </div>
                          <div>
                            <Label>Other spec</Label>
                            <Input {...form.register(`prizes.${index}.specOther`)} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {fields.length < 3 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append(defaultPrize((fields.length + 1) as 1 | 2 | 3))
                  }
                >
                  Add prize place
                </Button>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {step === 3 ? (
          <Panel title="Review">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-fg-muted">Title</dt>
                <dd>{form.watch('title')}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-fg-muted">Cover</dt>
                <dd>{form.watch('coverFileName') || 'None'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-fg-muted">Tickets</dt>
                <dd>
                  {form.watch('totalTickets')} × {form.watch('ticketPriceEtb')} ETB
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">Prizes</dt>
                <ul className="mt-1 space-y-1">
                  {form.watch('prizes').map((p, i) => (
                    <li key={i} className="rounded-md bg-surface-2 px-2 py-1.5">
                      Place {p.place} · {p.kind} · {p.title}
                      {p.kind === 'money' && p.amountEtb
                        ? ` (${formatCurrency(p.amountEtb)})`
                        : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </dl>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('publish')} />
              Publish live immediately (visible in user app)
            </label>
          </Panel>
        ) : null}

        {submitError ? (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || mutation.isPending}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => void next()}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create lottery'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
