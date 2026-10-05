# Lottery Platform — Admin/Owner Panel Implementation Plan (Standalone Web App)

**Stack:** React 18 + Vite + TypeScript · TanStack Query + TanStack Table · Zustand · React Router ·
Tailwind CSS + shadcn/ui · Socket.IO client · Docker (nginx static serve)

This is the **owner's operational control panel** — a standalone web app (not embedded in Telegram),
its own separate repo, own auth realm, own deployment. Structurally mirrors the Owner Panel navigation
defined in the business spec (§6).

---

## 1. Core Libraries

| Concern | Library | Why |
|---|---|---|
| Build tool | Vite | Consistent with the rest of the platform, per your instruction |
| Server state | `@tanstack/react-query` | Caching/refetch for dashboards, lists, entity detail views |
| Data tables | `@tanstack/react-table` | Sortable/filterable tables for Users, Deposits, Transactions, Tickets, Audit Log — all heavily tabular admin screens |
| Client state | `zustand` | Filter/sort UI state, active modal state |
| Routing | `react-router-dom` | Nested routes for the sidebar-driven layout |
| UI components | Tailwind CSS + `shadcn/ui` | Accessible primitives (dialogs, dropdowns, forms) that stay easily themeable — a better fit for a dense admin UI than hand-rolling everything |
| Forms | `react-hook-form` + `zod` | Lottery creation wizard, prize forms, wallet adjustment forms (reason required) |
| Real-time | `socket.io-client` | Live dashboard counters, live deposit queue, live ticket-sales numbers |
| Charts | `recharts` | Dashboard sales/deposit trend visuals |
| HTTP client | Generated client from backend OpenAPI (same approach as user frontend) | Type safety shared across both frontends |
| Auth | JWT stored in memory + httpOnly refresh cookie (coordinate with backend) | Standard SPA session pattern |
| Testing | Vitest + React Testing Library | Vite-native |

---

## 2. Project Structure

```text
src/
├── main.tsx
├── App.tsx
├── app/
│   ├── router.tsx
│   ├── queryClient.ts
│   └── layout/
│       ├── AppShell.tsx           (sidebar + topbar layout)
│       ├── Sidebar.tsx            (nav matching spec §6 exactly)
│       └── Topbar.tsx             (admin identity, logout, notification bell)
│
├── api/
│   ├── client.ts
│   └── endpoints/                 (users, wallets, deposits, transactions, lotteries,
│                                    tickets, prizes, winners, referrals, media, notifications,
│                                    audit, dashboard)
│
├── auth/
│   ├── LoginPage.tsx
│   ├── useAdminAuth.ts
│   └── RequireAuth.tsx            (route guard)
│
├── stores/
│   └── uiStore.ts                 (table filters, active modals)
│
├── sockets/
│   └── adminSocket.ts             (connects to /ws/admin)
│
├── features/
│   ├── dashboard/
│   │   └── DashboardPage.tsx       (spec §7 metrics + charts, live via socket)
│   ├── users/
│   │   ├── UsersListPage.tsx
│   │   └── UserDetailPage.tsx      (ban/unban with reason, ticket/wallet history)
│   ├── wallets/
│   │   ├── WalletsListPage.tsx
│   │   └── WalletAdjustmentModal.tsx  (amount + REQUIRED reason field — Invariant #14)
│   ├── deposits/
│   │   ├── DepositsQueuePage.tsx   (PENDING first, screenshot preview, approve/reject)
│   │   └── DepositDetailDrawer.tsx
│   ├── transactions/
│   │   └── TransactionsPage.tsx    (full ledger view, filterable by type/user/date)
│   ├── lotteries/
│   │   ├── LotteriesListPage.tsx
│   │   ├── LotteryCreateWizard.tsx (multi-step: info → tickets/price → prizes → media → publish)
│   │   ├── LotteryDetailPage.tsx   (tabs: overview, tickets, prizes, sales, actions)
│   │   └── LotteryActionsPanel.tsx (publish/lock/cancel with confirmation dialogs)
│   ├── tickets/
│   │   └── TicketInventoryPage.tsx (per-lottery grid/table view, filter by status)
│   ├── prizes/
│   │   └── PrizeFormModal.tsx      (cash vs product prize forms)
│   ├── draw/
│   │   └── DrawPanel.tsx           (seed-commit display pre-draw, reveal + execute, per backend §7)
│   ├── winners/
│   │   ├── WinnersListPage.tsx
│   │   └── PayoutUpdateModal.tsx   (status + evidence upload)
│   ├── referrals/
│   │   └── ReferralSystemPage.tsx  (rules config, reward history)
│   ├── media/
│   │   └── MediaLibraryPage.tsx    (evidence/screenshots browser)
│   ├── notifications/
│   │   └── NotificationsLogPage.tsx (sent/failed notification visibility)
│   ├── audit/
│   │   └── AuditHistoryPage.tsx    (filterable by actor/action/entity/date)
│   └── settings/
│       └── SettingsPage.tsx        (bot config, payment instructions text, provider toggle display)
│
├── components/ui/                  (shared table wrapper, StatCard, ConfirmDialog, FileUpload, Badge)
├── hooks/
└── types/
```

Navigation is a direct 1:1 mapping of the spec's §6 tree (Dashboard, Users, Wallets, Deposits,
Transactions, Lotteries, Tickets, Prizes, Winners, Referral System, Media/Evidence, Notifications, Audit
History, Settings) — no invented sections, no missing ones.

---

## 3. Dashboard (Spec §7)

`DashboardPage.tsx` renders every metric listed in the spec as `StatCard` components grouped logically
(Lotteries / Users / Deposits / Tickets / Winners / Referrals / Recent Activity), backed by a single
`GET /admin/dashboard` aggregate query on load, then **live-patched** via `adminSocket.ts` for the
counters that change frequently (pending deposits, tickets sold, active lotteries) so the owner doesn't
need to manually refresh mid-shift. Recent transactions and recent admin activity render as compact,
clickable lists linking into their full pages.

---

## 4. High-Risk / High-Care Screens

**Deposits Queue** — the owner's most frequent action. `DepositsQueuePage.tsx` defaults to `PENDING`
sorted oldest-first, shows the payment screenshot inline (not just a download link), and the
approve/reject buttons open a `ConfirmDialog` (spec Invariant #15: "important owner actions require
confirmation"). Reject requires a reason (feeds the audit trail and the user-facing rejection notice).

**Wallet Adjustment** — `WalletAdjustmentModal.tsx` enforces a non-empty reason field client-side
(mirrors the backend's hard requirement, Invariant #14) before the amount field is even enabled, and
shows the resulting projected balance before submission to avoid fat-finger errors.

**Lottery Creation Wizard** — a guided multi-step flow rather than one giant form, matching the spec's
required-field list (§9): Info → Ticket Config (quantity + price, with a clear "cannot be reduced once
sales start" warning shown after publish) → Prizes (add N, cash or product) → Media → Review/Publish.

**Draw Panel** — `DrawPanel.tsx` implements the two-step seed-commit/reveal UX from the backend plan
(§7): shows the committed hash *before* the draw button is enabled, requires an explicit confirmation
step, then displays revealed seed + per-prize winning tickets immediately after, with a permanent link to
the draw's audit record.

**Audit History** — `AuditHistoryPage.tsx` is filterable (actor, action type, entity type, date range)
and every other admin screen deep-links into it (e.g. "View history" on a user's detail page pre-filters
to that entity) — satisfies spec Invariant #20 in a genuinely usable way, not just as a raw log dump.

---

## 5. Real-Time

- `adminSocket.ts` connects on login (JWT-authenticated handshake), subscribes to the admin namespace
  (backend §11), and patches React Query cache for: dashboard counters, new deposit arrivals (queue badge
  count in the sidebar), live ticket sales numbers on an open `LotteryDetailPage`.
- Sidebar shows a live badge on "Deposits" with the current pending count, updated via socket without
  polling.

---

## 6. Auth & Access

- `LoginPage.tsx` — username/password, calls `POST /auth/admin/login`, stores access token in memory
  (Zustand), refresh handled via httpOnly cookie + silent refresh interceptor in `api/client.ts`.
- `RequireAuth.tsx` wraps the entire `AppShell`; unauthenticated access redirects to login, no partial
  admin UI is ever rendered pre-auth.
- Role scaffolding: `useAdminAuth.ts` exposes a `role` field and a `can(permission)` helper today
  backed by a single `OWNER` role that can do everything — wiring is in place so adding a second role
  later (per spec §3.1's explicit future-extensibility note) means adding permission checks to existing
  `can()` calls, not restructuring the app.

---

## 7. Docker

```text
Dockerfile        (multi-stage: node:20-alpine build → nginx:alpine serving /dist)
nginx.conf         (SPA fallback, gzip, cache headers)
```

Same runtime-config pattern as the user frontend (`env.js` templated at container start) so one built
image can point at staging or production APIs without a rebuild — sensible for a Dockerized deployment
where you may run this panel on an internal-only network/VPN separate from the public user app.

---

## 8. Testing

- Component tests for the highest-risk interactions: `WalletAdjustmentModal` reason enforcement,
  `DepositsQueuePage` approve/reject confirmation flow, `DrawPanel` commit-then-reveal sequencing.
- `msw`-backed integration tests for the Lottery Creation Wizard's multi-step validation.

---

## 9. Suggested Build Phases

1. **Shell & Auth** — Vite scaffold, login, `RequireAuth`, `AppShell` with sidebar matching spec §6,
   API client.
2. **Dashboard + Users + Wallets + Deposits** — the owner's daily-driver screens first.
3. **Lotteries + Prizes + Tickets** — creation wizard, detail views, inventory browser.
4. **Draw + Winners** — draw panel, winner list, payout tracking with evidence upload.
5. **Referrals + Media + Notifications log** — supporting operational screens.
6. **Audit History + Settings + live socket wiring across all pages + Docker hardening.**
