export type AdminRole = 'OWNER'

export type AdminPermission =
  | 'dashboard:read'
  | 'users:read'
  | 'users:ban'
  | 'wallets:read'
  | 'wallets:adjust'
  | 'deposits:review'
  | 'lotteries:manage'
  | 'draw:execute'
  | 'settings:manage'

export type AdminUser = {
  id: string
  username: string
  displayName: string
  role: AdminRole
}

export type UserStatus = 'ACTIVE' | 'BANNED'

export type PlatformUser = {
  id: string
  telegramId: string
  displayName: string
  phone: string
  status: UserStatus
  walletBalance: number
  ticketsPurchased: number
  createdAt: string
  banReason?: string
}

export type Wallet = {
  id: string
  userId: string
  userName: string
  balance: number
  updatedAt: string
}

export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type PaymentMethodId =
  | 'telebirr'
  | 'cbe'
  | 'mpesa'
  | 'awash'
  | 'abyssinia'
  | 'amole'

export type Deposit = {
  id: string
  userId: string
  userName: string
  amount: number
  method: PaymentMethodId
  status: DepositStatus
  verificationOutcome?: string
  screenshotUrl?: string
  externalReference?: string
  bankReference?: string
  verifiedAmount?: number
  verifiedProviderSource?: string
  verificationReason?: string
  accountMatch?: string
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
}

/** Mirrors user-app LotteryPrize: place 1|2|3, money or product. */
export type PrizePlace = 1 | 2 | 3
export type PrizeKind = 'money' | 'product'

export type PrizeSpec = { label: string; value: string }

export type LotteryPrize = {
  id: string
  place: PrizePlace
  kind: PrizeKind
  /** Display title — for money usually the ETB amount label */
  title: string
  subtitle: string
  detail: string
  /** Required when kind === 'money' */
  amountEtb?: number
  /** Required when kind === 'product' */
  imageUrl?: string
  specs?: PrizeSpec[]
  fulfillmentNote?: string
}

export type LotteryStatus =
  | 'DRAFT'
  | 'LIVE'
  | 'LOCKED'
  | 'COMPLETED'
  | 'CANCELLED'

export type TicketStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD'

export type Ticket = {
  id: string
  lotteryId: string
  number: number
  status: TicketStatus
  ownerId?: string
  ownerName?: string
  reservedUntil?: string
}

export type WinnerFulfillmentStatus =
  | 'PENDING'
  | 'PAID'
  | 'DELIVERED'
  | 'CREDITED'
  | 'FAILED'

export type LotteryWinner = {
  id: string
  place: PrizePlace
  prizeId: string
  prizeTitle: string
  prizeKind: PrizeKind
  ticketNumber: number
  userId: string
  userName: string
  fulfillmentStatus: WinnerFulfillmentStatus
  evidenceUrl?: string
  drawnAt: string
}

export type LotteryHistoryEvent = {
  id: string
  at: string
  title: string
  detail: string
  tone: 'neutral' | 'accent' | 'success' | 'danger'
}

export type Lottery = {
  id: string
  title: string
  seriesLabel: string
  description: string
  status: LotteryStatus
  ticketPriceEtb: number
  totalTickets: number
  ticketsSold: number
  ticketsReserved: number
  ticketsAvailable: number
  coverUrl?: string
  closesAt: string
  createdAt: string
  /** Always 1–3 place prizes bound to this lottery */
  prizes: LotteryPrize[]
  winners: LotteryWinner[]
  history: LotteryHistoryEvent[]
  commitHash?: string
  revealedSeed?: string
}

export type Settings = {
  botUsername: string
  supportContact: string
  paymentInstructions: string
  paymentAccounts: {
    method: PaymentMethodId
    label: string
    value: string
    enabled: boolean
  }[]
}

export type DashboardMetrics = {
  liveLotteries: number
  finishedLotteries: number
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  pendingDeposits: number
  ticketsSold: number
  walletBalancesTotal: number
  pendingFulfillments: number
  salesTrend: { date: string; sales: number; deposits: number }[]
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type DrawResult = {
  lotteryId: string
  commitHash: string
  revealedSeed: string
  winners: LotteryWinner[]
}
