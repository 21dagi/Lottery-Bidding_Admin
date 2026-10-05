import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DrawPanel } from '@/features/draw/DrawPanel'
import type { Lottery } from '@/types'

const commitDraw = vi.fn().mockResolvedValue({
  data: { commitHash: 'abc123commit' },
})
const revealDraw = vi.fn().mockResolvedValue({
  data: {
    lotteryId: 'l1',
    commitHash: 'abc123commit',
    revealedSeed: 'seed-1',
    winners: [],
  },
})

vi.mock('@/api/endpoints', () => ({
  lotteriesApi: {
    commitDraw: (...args: unknown[]) => commitDraw(...args),
    revealDraw: (...args: unknown[]) => revealDraw(...args),
  },
}))

const baseLottery: Lottery = {
  id: 'l1',
  title: 'Summer',
  seriesLabel: 'Series I',
  description: 'desc',
  status: 'LOCKED',
  ticketPriceEtb: 50,
  totalTickets: 100,
  ticketsSold: 100,
  ticketsReserved: 0,
  ticketsAvailable: 0,
  closesAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  prizes: [],
  winners: [],
  history: [],
}

function wrap(ui: React.ReactNode) {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DrawPanel', () => {
  it('requires commit before reveal is available', () => {
    wrap(<DrawPanel lottery={baseLottery} />)
    expect(screen.getByRole('button', { name: /commit seed hash/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /reveal seed & execute draw/i }),
    ).not.toBeInTheDocument()
  })

  it('shows confirm dialog before reveal', async () => {
    wrap(<DrawPanel lottery={{ ...baseLottery, commitHash: 'existing-hash' }} />)
    await userEvent.click(
      screen.getByRole('button', { name: /reveal seed & execute draw/i }),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/execute draw now/i)).toBeInTheDocument()
    expect(revealDraw).not.toHaveBeenCalled()
  })
})
