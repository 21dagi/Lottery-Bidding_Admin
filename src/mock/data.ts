import type {
  DashboardMetrics,
  Deposit,
  Lottery,
  LotteryPrize,
  PlatformUser,
  Settings,
  Ticket,
  Wallet,
} from '@/types'

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString()
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString()
const closesIn = (ms: number) => new Date(now + ms).toISOString()

export const mockUsers: PlatformUser[] = [
  {
    id: 'u1',
    telegramId: '100001',
    displayName: 'Abebe Kebede',
    phone: '+251911000001',
    status: 'ACTIVE',
    walletBalance: 2500,
    ticketsPurchased: 12,
    createdAt: daysAgo(40),
  },
  {
    id: 'u2',
    telegramId: '100002',
    displayName: 'Sara Hailu',
    phone: '+251911000002',
    status: 'ACTIVE',
    walletBalance: 800,
    ticketsPurchased: 5,
    createdAt: daysAgo(22),
  },
  {
    id: 'u3',
    telegramId: '100003',
    displayName: 'Daniel Mekonnen',
    phone: '+251911000003',
    status: 'BANNED',
    walletBalance: 0,
    ticketsPurchased: 2,
    createdAt: daysAgo(15),
    banReason: 'Fraudulent deposit screenshots',
  },
  {
    id: 'u4',
    telegramId: '100004',
    displayName: 'Hanna Tadesse',
    phone: '+251911000004',
    status: 'ACTIVE',
    walletBalance: 4200,
    ticketsPurchased: 28,
    createdAt: daysAgo(60),
  },
]

export const mockWallets: Wallet[] = mockUsers.map((u) => ({
  id: `w-${u.id}`,
  userId: u.id,
  userName: u.displayName,
  balance: u.walletBalance,
  updatedAt: hoursAgo(2),
}))

export let mockDeposits: Deposit[] = [
  {
    id: 'd1',
    userId: 'u1',
    userName: 'Abebe Kebede',
    amount: 500,
    method: 'telebirr',
    status: 'PENDING',
    screenshotUrl: 'https://placehold.co/400x600/e2e8f0/334155?text=Receipt+1',
    createdAt: hoursAgo(5),
  },
  {
    id: 'd2',
    userId: 'u2',
    userName: 'Sara Hailu',
    amount: 1000,
    method: 'cbe',
    status: 'PENDING',
    screenshotUrl: 'https://placehold.co/400x600/e2e8f0/334155?text=Receipt+2',
    createdAt: hoursAgo(3),
  },
  {
    id: 'd3',
    userId: 'u4',
    userName: 'Hanna Tadesse',
    amount: 2000,
    method: 'telebirr',
    status: 'APPROVED',
    screenshotUrl: 'https://placehold.co/400x600/dcfce7/166534?text=Approved',
    createdAt: daysAgo(1),
    reviewedAt: hoursAgo(20),
  },
]

const obsidianPrizes: LotteryPrize[] = [
  {
    id: 'p1',
    place: 1,
    kind: 'money',
    title: '100,000 ETB',
    subtitle: 'Instant ledger bank transfer',
    detail: 'Winner receives 100,000 ETB within 24 hours after draw audit.',
    amountEtb: 100000,
    fulfillmentNote: 'Secured in Escrow',
  },
  {
    id: 'p2',
    place: 2,
    kind: 'product',
    title: 'iPhone 16 Pro',
    subtitle: 'Natural Titanium (256GB)',
    detail: 'Hand delivery available in Addis Ababa.',
    imageUrl: 'https://placehold.co/400x400/0f766e/ecfdf5?text=iPhone',
    specs: [
      { label: 'Model', value: 'iPhone 16 Pro' },
      { label: 'Storage', value: '256 GB' },
      { label: 'Finish', value: 'Natural Titanium' },
    ],
    fulfillmentNote: 'Addis Ababa Hand Delivery',
  },
  {
    id: 'p3',
    place: 3,
    kind: 'money',
    title: '10,000 ETB',
    subtitle: 'Wallet credit voucher',
    detail: 'Credited to Lottery-Bid wallet.',
    amountEtb: 10000,
    fulfillmentNote: 'Wallet credit',
  },
]

export let mockLotteries: Lottery[] = [
  {
    id: 'obsidian',
    title: 'Grand Obsidian Draw',
    seriesLabel: 'Series IX',
    description: 'Flagship live draw matching the user mini-app.',
    status: 'LIVE',
    ticketPriceEtb: 100,
    totalTickets: 1000,
    ticketsSold: 782,
    ticketsReserved: 18,
    ticketsAvailable: 200,
    coverUrl: 'https://placehold.co/800x400/0f766e/ecfdf5?text=Obsidian',
    closesAt: closesIn(2 * 86_400_000),
    createdAt: daysAgo(5),
    prizes: obsidianPrizes,
    winners: [],
    history: [
      {
        id: 'h1',
        at: daysAgo(5),
        title: 'Lottery published',
        detail: 'Went live with 3 prize places',
        tone: 'accent',
      },
    ],
    commitHash:
      'a3f9c2e1b7d04856ef12ab90cd34ef56a1b2c3d4e5f67890abcdef1234567890',
  },
  {
    id: 'sapphire-fin',
    title: 'Sapphire Classic',
    seriesLabel: 'Archive · Sep',
    description: 'Completed draw with winners and fulfillment history.',
    status: 'COMPLETED',
    ticketPriceEtb: 80,
    totalTickets: 500,
    ticketsSold: 500,
    ticketsReserved: 0,
    ticketsAvailable: 0,
    coverUrl: 'https://placehold.co/800x400/134e4a/ecfdf5?text=Sapphire',
    closesAt: daysAgo(3),
    createdAt: daysAgo(20),
    prizes: [
      {
        id: 'sp1',
        place: 1,
        kind: 'product',
        title: 'iPhone 16 Pro',
        subtitle: 'Natural Titanium · 256GB',
        detail: 'Device fulfillment.',
        imageUrl: 'https://placehold.co/400x400/0f766e/ecfdf5?text=Phone',
        specs: [{ label: 'Storage', value: '256 GB' }],
      },
      {
        id: 'sp2',
        place: 2,
        kind: 'money',
        title: '15,000 ETB',
        subtitle: 'External bank transfer',
        detail: 'Paid externally.',
        amountEtb: 15000,
      },
    ],
    winners: [
      {
        id: 'win1',
        place: 1,
        prizeId: 'sp1',
        prizeTitle: 'iPhone 16 Pro',
        prizeKind: 'product',
        ticketNumber: 482,
        userId: 'u4',
        userName: 'Hanna Tadesse',
        fulfillmentStatus: 'DELIVERED',
        evidenceUrl: 'https://placehold.co/400x600/dcfce7/166534?text=Delivery',
        drawnAt: daysAgo(3),
      },
      {
        id: 'win2',
        place: 2,
        prizeId: 'sp2',
        prizeTitle: '15,000 ETB',
        prizeKind: 'money',
        ticketNumber: 117,
        userId: 'u1',
        userName: 'Abebe Kebede',
        fulfillmentStatus: 'PAID',
        evidenceUrl: 'https://placehold.co/400x600/dcfce7/166534?text=Payout',
        drawnAt: daysAgo(3),
      },
    ],
    history: [
      {
        id: 'sh1',
        at: daysAgo(4),
        title: 'Draw locked',
        detail: 'All 500 tickets sold',
        tone: 'neutral',
      },
      {
        id: 'sh2',
        at: daysAgo(3),
        title: 'Draw executed',
        detail: 'Winners selected for places 1–2',
        tone: 'accent',
      },
      {
        id: 'sh3',
        at: daysAgo(2),
        title: 'Fulfillment complete',
        detail: 'Product delivered · payout evidence filed',
        tone: 'success',
      },
    ],
    commitHash: 'deadbeefcafebabe0123456789abcdef0123456789abcdef0123456789abcdef',
    revealedSeed: 'seed-sapphire-2026',
  },
  {
    id: 'draft-1',
    title: 'Draft Promo',
    seriesLabel: 'Series Draft',
    description: 'Not published yet.',
    status: 'DRAFT',
    ticketPriceEtb: 50,
    totalTickets: 200,
    ticketsSold: 0,
    ticketsReserved: 0,
    ticketsAvailable: 200,
    closesAt: closesIn(10 * 86_400_000),
    createdAt: hoursAgo(6),
    prizes: [
      {
        id: 'dp1',
        place: 1,
        kind: 'money',
        title: '25,000 ETB',
        subtitle: 'Cash prize',
        detail: 'Wallet or bank transfer',
        amountEtb: 25000,
      },
    ],
    winners: [],
    history: [
      {
        id: 'dh1',
        at: hoursAgo(6),
        title: 'Draft created',
        detail: 'Awaiting publish',
        tone: 'neutral',
      },
    ],
  },
]

export let mockTickets: Ticket[] = Array.from({ length: 40 }, (_, i) => {
  const n = i + 1
  const status: Ticket['status'] =
    n <= 25 ? 'SOLD' : n <= 30 ? 'RESERVED' : 'AVAILABLE'
  return {
    id: `tk-${n}`,
    lotteryId: 'obsidian',
    number: n,
    status,
    ownerId: status === 'SOLD' ? mockUsers[n % mockUsers.length].id : undefined,
    ownerName:
      status === 'SOLD' ? mockUsers[n % mockUsers.length].displayName : undefined,
    reservedUntil:
      status === 'RESERVED'
        ? new Date(now + 10 * 60_000).toISOString()
        : undefined,
  }
})

export const mockSettings: Settings = {
  botUsername: 'LuckyDrawBot',
  supportContact: '@LotterySupport',
  paymentInstructions:
    'Send payment using one of the enabled methods below, then upload a clear screenshot with the transaction ID.',
  paymentAccounts: [
    { method: 'telebirr', label: 'Telebirr phone', value: '0911 234 567', enabled: true },
    { method: 'cbe', label: 'CBE account', value: '1000 1234 5678', enabled: true },
    { method: 'mpesa', label: 'M-Pesa phone', value: '0700 123 456', enabled: true },
    { method: 'awash', label: 'Awash account', value: '0132 9876 5432', enabled: false },
    { method: 'abyssinia', label: 'BOA account', value: '5678 9012 3456', enabled: false },
    { method: 'amole', label: 'Amole phone', value: '0912 345 678', enabled: false },
  ],
}

export function buildDashboard(): DashboardMetrics {
  return {
    liveLotteries: mockLotteries.filter((l) => l.status === 'LIVE').length,
    finishedLotteries: mockLotteries.filter((l) => l.status === 'COMPLETED').length,
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter((u) => u.status === 'ACTIVE').length,
    bannedUsers: mockUsers.filter((u) => u.status === 'BANNED').length,
    pendingDeposits: mockDeposits.filter((d) => d.status === 'PENDING').length,
    ticketsSold: mockLotteries.reduce((s, l) => s + l.ticketsSold, 0),
    walletBalancesTotal: mockWallets.reduce((s, w) => s + w.balance, 0),
    pendingFulfillments: mockLotteries
      .flatMap((l) => l.winners)
      .filter((w) => w.fulfillmentStatus === 'PENDING').length,
    salesTrend: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86400_000)
      return {
        date: d.toISOString().slice(0, 10),
        sales: 800 + i * 120,
        deposits: 600 + i * 90,
      }
    }),
  }
}
