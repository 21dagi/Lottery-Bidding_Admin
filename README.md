# Lottery Admin Frontend

Owner panel for **Lottery-Bid**, shaped to match the user mini-app.

## What the admin does

| Area | Purpose |
|---|---|
| **Lotteries** | Create bids with prizes **inside** creation (places 1–3, money ETB or product + image/specs). Detail holds tickets, draw, winners/fulfillment, and lottery history. |
| **Deposits** | Approve/reject user payment proofs (Telebirr, CBE, …). |
| **Users** | Ban / unban. |
| **Wallets** | Manual balance adjust (reason required). |
| **Settings** | Bot + deposit payment accounts shown in the user app. |

Removed as standalone pages (wrong model): Prizes, Tickets, Winners, Referrals, Media, Notifications, Transactions, Audit — those concerns live on the lottery or deposits flow.

## Quick start

```bash
pnpm install
pnpm dev
```

http://localhost:5174 · mock login `owner` / `owner123`
