import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingBlock, PageHeader, Panel } from '@/components/ui/Page'
import type { Settings } from '@/types'

export function SettingsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await settingsApi.get()).data,
  })

  const form = useForm<Settings>({ values: data })

  const mutation = useMutation({
    mutationFn: (values: Settings) => settingsApi.update(values),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['settings'] }),
  })

  if (isLoading || !data) return <LoadingBlock />

  const accounts = form.watch('paymentAccounts') ?? []

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Bot identity and deposit payment accounts shown in the user wallet deposit flow."
      />

      <form
        className="mx-auto max-w-2xl space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Panel title="Bot">
          <div>
            <Label>Bot username</Label>
            <Input {...form.register('botUsername')} />
          </div>
          <div className="mt-3">
            <Label>Support contact</Label>
            <Input {...form.register('supportContact')} />
          </div>
        </Panel>

        <Panel title="Deposit instructions">
          <Label>Instructions shown to users</Label>
          <Textarea rows={4} {...form.register('paymentInstructions')} />
        </Panel>

        <Panel title="Payment methods (user deposit picker)">
          <div className="space-y-3">
            {accounts.map((account, index) => (
              <div
                key={account.method}
                className="rounded-md border border-border p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase">{account.method}</p>
                  <Badge variant={account.enabled ? 'success' : 'default'}>
                    {account.enabled ? 'Enabled' : 'Off'}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label>Pay-to label</Label>
                    <Input {...form.register(`paymentAccounts.${index}.label`)} />
                  </div>
                  <div>
                    <Label>Pay-to value</Label>
                    <Input {...form.register(`paymentAccounts.${index}.value`)} />
                  </div>
                </div>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...form.register(`paymentAccounts.${index}.enabled`)}
                  />
                  Show in user deposit flow
                </label>
              </div>
            ))}
          </div>
        </Panel>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </form>
    </div>
  )
}
