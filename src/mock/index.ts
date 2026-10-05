import type { ApiResponse } from '@/api/client'
import {
  buildDashboard,
  mockDeposits,
  mockLotteries,
  mockSettings,
  mockTickets,
  mockUsers,
  mockWallets,
} from './data'
import type {
  Deposit,
  DrawResult,
  Lottery,
  LotteryPrize,
  LotteryWinner,
  PlatformUser,
  Settings,
  Ticket,
} from '@/types'

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
}

function ok<T>(data: T): ApiResponse<T> {
  return { data }
}

function delay(ms = 160) {
  return new Promise((r) => setTimeout(r, ms))
}

function parseQuery(path: string) {
  const idx = path.indexOf('?')
  if (idx === -1) return { pathname: path, params: new URLSearchParams() }
  return {
    pathname: path.slice(0, idx),
    params: new URLSearchParams(path.slice(idx + 1)),
  }
}

function pushHistory(
  lottery: Lottery,
  title: string,
  detail: string,
  tone: Lottery['history'][0]['tone'] = 'neutral',
) {
  lottery.history.unshift({
    id: `h-${Date.now()}`,
    at: new Date().toISOString(),
    title,
    detail,
    tone,
  })
}

export async function mockRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  await delay()
  const method = (options.method ?? 'GET').toUpperCase()
  const { pathname, params } = parseQuery(path)
  const body = options.body as Record<string, unknown> | undefined

  if (pathname === '/auth/admin/login' && method === 'POST') {
    const username = String(body?.username ?? '')
    const password = String(body?.password ?? '')
    if (username === 'owner' && password === 'owner123') {
      return ok({
        accessToken: 'mock-admin-token',
        admin: {
          id: 'admin1',
          username: 'owner',
          displayName: 'Platform Owner',
          role: 'OWNER',
        },
      }) as ApiResponse<T>
    }
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  if (pathname === '/admin/dashboard' && method === 'GET') {
    return ok(buildDashboard()) as ApiResponse<T>
  }

  if (pathname === '/admin/users' && method === 'GET') {
    const q = (params.get('q') ?? '').toLowerCase()
    const status = params.get('status')
    let items = [...mockUsers]
    if (q) {
      items = items.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.telegramId.includes(q),
      )
    }
    if (status) items = items.filter((u) => u.status === status)
    return ok({ items, total: items.length, page: 1, pageSize: 50 }) as ApiResponse<T>
  }

  const userMatch = pathname.match(/^\/admin\/users\/([^/]+)$/)
  if (userMatch && method === 'GET') {
    const user = mockUsers.find((u) => u.id === userMatch[1])
    if (!user) throw Object.assign(new Error('Not found'), { status: 404 })
    return ok(user) as ApiResponse<T>
  }

  const banMatch = pathname.match(/^\/admin\/users\/([^/]+)\/ban$/)
  if (banMatch && method === 'POST') {
    const user = mockUsers.find((u) => u.id === banMatch[1]) as PlatformUser
    user.status = 'BANNED'
    user.banReason = String(body?.reason ?? '')
    return ok(user) as ApiResponse<T>
  }

  const unbanMatch = pathname.match(/^\/admin\/users\/([^/]+)\/unban$/)
  if (unbanMatch && method === 'POST') {
    const user = mockUsers.find((u) => u.id === unbanMatch[1]) as PlatformUser
    user.status = 'ACTIVE'
    user.banReason = undefined
    return ok(user) as ApiResponse<T>
  }

  if (pathname === '/admin/wallets' && method === 'GET') {
    return ok({
      items: mockWallets,
      total: mockWallets.length,
      page: 1,
      pageSize: 50,
    }) as ApiResponse<T>
  }

  const adjustMatch = pathname.match(/^\/admin\/wallets\/([^/]+)\/adjust$/)
  if (adjustMatch && method === 'POST') {
    const reason = String(body?.reason ?? '').trim()
    const amount = Number(body?.amount ?? 0)
    if (!reason) throw Object.assign(new Error('Reason is required'), { status: 400 })
    const wallet = mockWallets.find(
      (w) => w.userId === adjustMatch[1] || w.id === adjustMatch[1],
    )
    if (!wallet) throw Object.assign(new Error('Not found'), { status: 404 })
    wallet.balance += amount
    wallet.updatedAt = new Date().toISOString()
    const user = mockUsers.find((u) => u.id === wallet.userId)
    if (user) user.walletBalance = wallet.balance
    return ok(wallet) as ApiResponse<T>
  }

  if (pathname === '/admin/deposits' && method === 'GET') {
    const status = params.get('status')
    let items = [...mockDeposits]
    if (status) items = items.filter((d) => d.status === status)
    items.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1
      if (b.status === 'PENDING' && a.status !== 'PENDING') return 1
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    return ok({ items, total: items.length, page: 1, pageSize: 50 }) as ApiResponse<T>
  }

  const approveMatch = pathname.match(/^\/admin\/deposits\/([^/]+)\/approve$/)
  if (approveMatch && method === 'POST') {
    const deposit = mockDeposits.find((d) => d.id === approveMatch[1]) as Deposit
    deposit.status = 'APPROVED'
    deposit.reviewedAt = new Date().toISOString()
    const wallet = mockWallets.find((w) => w.userId === deposit.userId)
    if (wallet) {
      wallet.balance += deposit.amount
      const user = mockUsers.find((u) => u.id === deposit.userId)
      if (user) user.walletBalance = wallet.balance
    }
    return ok(deposit) as ApiResponse<T>
  }

  const rejectMatch = pathname.match(/^\/admin\/deposits\/([^/]+)\/reject$/)
  if (rejectMatch && method === 'POST') {
    const reason = String(body?.reason ?? '').trim()
    if (!reason) throw Object.assign(new Error('Rejection reason required'), { status: 400 })
    const deposit = mockDeposits.find((d) => d.id === rejectMatch[1]) as Deposit
    deposit.status = 'REJECTED'
    deposit.rejectionReason = reason
    deposit.reviewedAt = new Date().toISOString()
    return ok(deposit) as ApiResponse<T>
  }

  if (pathname === '/admin/lotteries' && method === 'GET') {
    return ok({
      items: mockLotteries,
      total: mockLotteries.length,
      page: 1,
      pageSize: 50,
    }) as ApiResponse<T>
  }

  if (pathname === '/admin/lotteries' && method === 'POST') {
    const prizes = (body?.prizes as LotteryPrize[]) ?? []
    if (prizes.length < 1) {
      throw Object.assign(new Error('At least one prize place is required'), {
        status: 400,
      })
    }
    const id = `l-${Date.now()}`
    const totalTickets = Number(body?.totalTickets ?? 0)
    const lottery: Lottery = {
      id,
      title: String(body?.title ?? 'Untitled'),
      seriesLabel: String(body?.seriesLabel ?? ''),
      description: String(body?.description ?? ''),
      status: body?.publish ? 'LIVE' : 'DRAFT',
      ticketPriceEtb: Number(body?.ticketPriceEtb ?? 0),
      totalTickets,
      ticketsSold: 0,
      ticketsReserved: 0,
      ticketsAvailable: totalTickets,
      coverUrl: body?.coverUrl ? String(body.coverUrl) : undefined,
      closesAt: String(body?.closesAt ?? new Date().toISOString()),
      createdAt: new Date().toISOString(),
      prizes: prizes.map((p, i) => ({
        ...p,
        id: p.id || `p-${id}-${i}`,
        place: p.place,
      })),
      winners: [],
      history: [
        {
          id: `h-${id}`,
          at: new Date().toISOString(),
          title: body?.publish ? 'Lottery published' : 'Draft created',
          detail: `${prizes.length} prize place(s) configured`,
          tone: 'accent',
        },
      ],
    }
    mockLotteries.unshift(lottery)
    return ok(lottery) as ApiResponse<T>
  }

  const lotteryMatch = pathname.match(/^\/admin\/lotteries\/([^/]+)$/)
  if (lotteryMatch && method === 'GET') {
    const lottery = mockLotteries.find((l) => l.id === lotteryMatch[1])
    if (!lottery) throw Object.assign(new Error('Not found'), { status: 404 })
    return ok(lottery) as ApiResponse<T>
  }

  const lotteryAction = pathname.match(
    /^\/admin\/lotteries\/([^/]+)\/(publish|lock|cancel)$/,
  )
  if (lotteryAction && method === 'POST') {
    const lottery = mockLotteries.find((l) => l.id === lotteryAction[1]) as Lottery
    const action = lotteryAction[2]
    if (action === 'publish') {
      lottery.status = 'LIVE'
      pushHistory(lottery, 'Published', 'Sales opened', 'accent')
    }
    if (action === 'lock') {
      lottery.status = 'LOCKED'
      pushHistory(lottery, 'Locked', 'Sales closed · ready for draw', 'neutral')
    }
    if (action === 'cancel') {
      lottery.status = 'CANCELLED'
      pushHistory(lottery, 'Cancelled', 'Lottery cancelled by owner', 'danger')
    }
    return ok(lottery) as ApiResponse<T>
  }

  const drawCommit = pathname.match(/^\/admin\/lotteries\/([^/]+)\/draw\/commit$/)
  if (drawCommit && method === 'POST') {
    const lottery = mockLotteries.find((l) => l.id === drawCommit[1]) as Lottery
    lottery.commitHash =
      lottery.commitHash ??
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(
        '',
      )
    pushHistory(lottery, 'Seed committed', lottery.commitHash.slice(0, 16) + '…', 'neutral')
    return ok({ commitHash: lottery.commitHash }) as ApiResponse<T>
  }

  const drawReveal = pathname.match(/^\/admin\/lotteries\/([^/]+)\/draw\/reveal$/)
  if (drawReveal && method === 'POST') {
    const lottery = mockLotteries.find((l) => l.id === drawReveal[1]) as Lottery
    if (!lottery.commitHash) {
      throw Object.assign(new Error('Commit hash required before reveal'), { status: 400 })
    }
    lottery.revealedSeed = `seed-${lottery.id}-${Date.now()}`
    lottery.status = 'COMPLETED'
    const winners: LotteryWinner[] = lottery.prizes.map((prize, i) => ({
      id: `win-${Date.now()}-${i}`,
      place: prize.place,
      prizeId: prize.id,
      prizeTitle: prize.title,
      prizeKind: prize.kind,
      ticketNumber: 10 + i * 7,
      userId: mockUsers[i % mockUsers.length].id,
      userName: mockUsers[i % mockUsers.length].displayName,
      fulfillmentStatus: 'PENDING',
      drawnAt: new Date().toISOString(),
    }))
    lottery.winners = winners
    pushHistory(lottery, 'Draw executed', `${winners.length} winner(s) selected`, 'accent')
    const result: DrawResult = {
      lotteryId: lottery.id,
      commitHash: lottery.commitHash,
      revealedSeed: lottery.revealedSeed,
      winners,
    }
    return ok(result) as ApiResponse<T>
  }

  const fulfillMatch = pathname.match(
    /^\/admin\/lotteries\/([^/]+)\/winners\/([^/]+)\/fulfill$/,
  )
  if (fulfillMatch && method === 'POST') {
    const lottery = mockLotteries.find((l) => l.id === fulfillMatch[1]) as Lottery
    const winner = lottery.winners.find((w) => w.id === fulfillMatch[2])
    if (!winner) throw Object.assign(new Error('Not found'), { status: 404 })
    winner.fulfillmentStatus = body?.status as LotteryWinner['fulfillmentStatus']
    if (body?.evidenceUrl) winner.evidenceUrl = String(body.evidenceUrl)
    pushHistory(
      lottery,
      'Fulfillment updated',
      `${winner.userName} · place ${winner.place} → ${winner.fulfillmentStatus}`,
      'success',
    )
    return ok(winner) as ApiResponse<T>
  }

  if (pathname === '/admin/tickets' && method === 'GET') {
    const lotteryId = params.get('lotteryId')
    const status = params.get('status')
    let items: Ticket[] = [...mockTickets]
    if (lotteryId) items = items.filter((t) => t.lotteryId === lotteryId)
    if (status) items = items.filter((t) => t.status === status)
    return ok({ items, total: items.length, page: 1, pageSize: 100 }) as ApiResponse<T>
  }

  if (pathname === '/admin/settings' && method === 'GET') {
    return ok(mockSettings) as ApiResponse<T>
  }
  if (pathname === '/admin/settings' && method === 'PUT') {
    Object.assign(mockSettings, body as Settings)
    return ok(mockSettings) as ApiResponse<T>
  }

  throw Object.assign(new Error(`Mock route not found: ${method} ${pathname}`), {
    status: 404,
  })
}
