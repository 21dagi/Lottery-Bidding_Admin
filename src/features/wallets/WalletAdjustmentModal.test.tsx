import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  WalletAdjustmentModal,
  walletAdjustmentSchema,
} from '@/features/wallets/WalletAdjustmentModal'

vi.mock('@/api/endpoints', () => ({
  walletsApi: {
    adjust: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

function renderModal() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <WalletAdjustmentModal
        open
        onClose={() => undefined}
        wallet={{
          id: 'w-u1',
          userId: 'u1',
          userName: 'Abebe Kebede',
          balance: 1000,
          updatedAt: new Date().toISOString(),
        }}
      />
    </QueryClientProvider>,
  )
}

describe('WalletAdjustmentModal', () => {
  it('requires a non-empty reason before amount is enabled', async () => {
    const user = userEvent.setup()
    renderModal()
    const amount = screen.getByLabelText(/amount/i)
    expect(amount).toBeDisabled()

    await user.type(screen.getByLabelText(/reason/i), 'Support goodwill credit')
    await waitFor(() => expect(amount).not.toBeDisabled())
  })

  it('rejects empty reason via schema', () => {
    const result = walletAdjustmentSchema.safeParse({ reason: '  ', amount: 10 })
    expect(result.success).toBe(false)
  })

  it('shows projected balance', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.type(screen.getByLabelText(/reason/i), 'Credit')
    const amount = screen.getByLabelText(/amount/i)
    await waitFor(() => expect(amount).not.toBeDisabled())
    await user.clear(amount)
    await user.type(amount, '250')
    await waitFor(() => {
      expect(screen.getByText(/projected balance/i)).toBeInTheDocument()
    })
  })
})
