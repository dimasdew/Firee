# Firee — On-Chain Marketplace

A full-stack Web3 marketplace where payments settle on-chain through a **USDC escrow contract**. Buyers, sellers, and admins each get their own flow — listings, orders, disputes, reviews, and payouts — on top of **Next.js 15**, **RainbowKit**, and **Supabase**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![RainbowKit](https://img.shields.io/badge/RainbowKit-wallet-7b3fe4) ![Supabase](https://img.shields.io/badge/Supabase-DB%20%2B%20Auth-3ECF8E?logo=supabase) ![Base](https://img.shields.io/badge/Base-Sepolia%20%2F%20Mainnet-0052FF?logo=coinbase) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## How it works

1. Seller lists a product priced in USDC.
2. Buyer pays into the **FireeEscrow** contract (funds locked, not sent directly).
3. Seller ships; buyer confirms delivery → escrow releases funds to the seller.
4. If something goes wrong, either party opens a **dispute** for admin resolution.

Auth, product data, and order metadata live in **Supabase**; settlement lives on **Base**.

---

## Roles

| Role | Can do |
|---|---|
| **Buyer** | Browse, search, filter, buy via escrow, track orders, leave reviews, open disputes |
| **Seller** | Create/edit listings, manage orders, view earnings & analytics, request payout |
| **Admin** | Oversee orders, resolve disputes, moderate products, view platform reports & analytics |

---

## Features

- **On-chain escrow** — `FireeEscrowV2` holds USDC until delivery is confirmed
- **Wallet connect** — RainbowKit (MetaMask, Coinbase, WalletConnect, Rainbow)
- **Hybrid auth** — email/password + Google + wallet, backed by Supabase
- **Order lifecycle** — pending → paid → shipped → delivered → completed, with disputes
- **Reviews** — buyers rate completed orders
- **Dark / light theme** — full palette sync, including RainbowKit modals
- **DiceBear avatars** — unique art per user
- **Responsive** — mobile bottom nav + hamburger, desktop full nav
- **Email notifications** — transactional email via Resend

---

## Design System

Follows a shared design system across my apps ([Design-System.md](../Design-System.md)) — consistent spacing, type, radius, and breakpoints; color stays product-specific (the palette below).

| Token | Scale |
|---|---|
| Spacing | 4px grid — inline styles normalized across the app |
| Type | three heading roles — hero, section, app-title |
| Radius | 8 / 12 / 16 / full |
| Breakpoints | mobile-first — `min-width` 640 / 768 / 1024 |

Mobile gets a bottom nav + hamburger; desktop restores the full nav and multi-column grids at each `min-width` breakpoint.

### Color Palette

| Color | Hex | Usage |
|---|---|---|
| Sand | `#E2E2B6` | CTAs, prices, accents |
| Sky | `#6EACDA` | Links, icons, badges |
| Navy | `#03346E` | Surfaces, buttons |
| Midnight | `#021526` | Dark backgrounds |
| Snow | `#F5F5F5` | Light mode background |

Type: **Space Grotesk** (UI) + **Space Mono** (numeric).

---

## Structure

```
app/
├── page.tsx              Landing page
├── shop/                 Public storefront + product browsing
├── product/[id]/         Product detail + purchase
├── dashboard/            Buyer dashboard (orders, details)
├── order/                Order tracking
├── seller/               Seller: listings, orders, earnings, analytics
├── admin/                Admin: orders, disputes, products, reports, analytics
├── profile/              Settings, address, wallet
├── login/ create/        Auth (email, Google, wallet)
├── about/ support/        Info & FAQ
├── privacy/ terms/        Legal
└── api/                  Auth, notify (Resend), server routes

components/               Navbar, Footer, MarketplaceCard, MobileBottomNav,
                          PurchaseModal, ReviewSection, FireeConnectButton,
                          WalletBridge, AuthGuard, Toast, etc.

context/AppContext.tsx    Global state (user, orders, notifications)
lib/
├── contracts/            FireeEscrow ABIs + useFireeEscrow hook
├── supabase/             Client/server, products, orders
├── orderStatus.ts        Canonical order-status mapping
├── wagmi.ts              Chains (Base Sepolia / Base / mainnet)
└── types.ts, utils.ts

contracts/                Hardhat project (escrow contract + deploy scripts)
```

---

## Tech Stack

- **Next.js 15** — App Router, TypeScript
- **RainbowKit + wagmi + viem** — wallet connection & contract calls
- **Supabase** — Postgres, Auth, storage
- **Solidity + Hardhat** — `FireeEscrow` USDC escrow (Base)
- **@tanstack/react-query** — async state
- **Resend** — transactional email
- **DiceBear** — avatars · **Lucide React** — icons

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in the variables below
npm run dev                   # http://localhost:3000
```

### Environment Variables

```bash
# Wallet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Chain / contract (Base Sepolia by default; set CHAIN=mainnet for Base)
NEXT_PUBLIC_CHAIN=testnet
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Email (optional)
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get a WalletConnect ID at [cloud.walletconnect.com](https://cloud.walletconnect.com).

---

## Smart Contract

The escrow lives in `contracts/` as a Hardhat project.

```bash
cd contracts
npm install
npx hardhat run scripts/deployV2.ts --network baseSepolia
```

Set the deployed address as `NEXT_PUBLIC_ESCROW_ADDRESS`. USDC addresses (Base / Base Sepolia) are wired in `lib/contracts/index.ts`.

---

## Deploy

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add the environment variables above
4. Deploy

---

Built by [@dimasdew](https://github.com/dimasdew)
