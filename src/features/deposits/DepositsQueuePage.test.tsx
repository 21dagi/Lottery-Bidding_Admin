import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DepositsQueuePage } from '@/features/deposits/DepositsQueuePage'

const approve = vi.fn().mockResolvedValue({ data: {} })
const reject = vi.fn().mockResolvedValue({ data: {} })

vi.mock('@/api/endpoints', () => ({
  depositsApi: {
    list: vi.fn().mockResolvedValue({
      data: {
        items: [
          {
            id: 'd1',
            userId: 'u1',
            userName: 'Abebe Kebede',
            amount: 500,
            method: 'Telebirr',
            status: 'PENDING',
            screenshotUrl: 'https://placehold.co/100x100',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 50,
      },
    }),
    approve: (...args: unknown[]) => approve(...args),
    reject: (...args: unknown[]) => reject(...args),
  },
}))

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <DepositsQueuePage />
    </QueryClientProvider>,
  )
}

describe('DepositsQueuePage', () => {
  beforeEach(() => {
    approve.mockClear()
    reject.mockClear()
  })

  it('requires confirmation before approve', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Abebe Kebede')
    const tableApprove = screen.getAllByRole('button', { name: /^approve$/i })[0]
    await user.click(tableApprove)
    expect(await screen.findByText(/approve this deposit/i)).toBeInTheDocument()
    expect(approve).not.toHaveBeenCalled()
    const dialog = screen.getByRole('dialog')
    await user.click(dialog.querySelector('button:last-of-type') as HTMLButtonElement)
    await waitFor(() => expect(approve).toHaveBeenCalledWith('d1'))
  })

  it('requires reason on reject confirmation', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Abebe Kebede')
    await user.click(screen.getAllByRole('button', { name: /^reject$/i })[0])
    const dialog = await screen.findByRole('dialog')
    const confirmReject = dialog.querySelector(
      'button:last-of-type',
    ) as HTMLButtonElement
    expect(confirmReject).toBeDisabled()
    await user.type(screen.getByPlaceholderText(/explain why/i), 'Bad screenshot')
    await waitFor(() => expect(confirmReject).not.toBeDisabled())
  })
})
