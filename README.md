# Firee — Decentralized Marketplace

A Web3-powered marketplace built with **Next.js 15**, **RainbowKit**, and **Tailwind CSS**. Connect your wallet, browse products priced in USDC, and track orders — all with a polished dark/light theme.

## Quick Start

```bash
npm install
cp .env.example .env.local   # add your WalletConnect project ID
npm run dev                   # open http://localhost:3000
```

## Features

- **Wallet connect** — RainbowKit (MetaMask, Coinbase, WalletConnect, Rainbow)
- **Dark / Light theme** — full palette sync including RainbowKit modals
- **Product marketplace** — browse, search, filter, sort, add to cart, redeem
- **Order tracking** — active orders → delivering → completed
- **Profile** — personal info, shipping addresses, wallet management
- **DiceBear avatars** — unique pixel art per user
- **Responsive** — mobile bottom nav, collapsible sidebar, drawer cart

## Structure

```
app/
├── page.tsx              Landing page (hero, features, CTA)
├── dashboard/            Product grid + detail pages
├── order/                Active & previous orders
├── profile/              Settings, address, wallet
├── login/ & create/      Auth pages (email, Google, wallet)
├── about/ & support/     Info & FAQ pages
└── layout.tsx            Root layout + providers

components/               Navbar, Footer, ProductCard, CartDrawer,
                          FireeConnectButton, WalletBridge, etc.

context/AppContext.tsx     Global state (user, cart, orders, notifications)
lib/                      wagmi config, products data, types, utils
```

## Environment Variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get one free at [cloud.walletconnect.com](https://cloud.walletconnect.com).

## Deploy

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel env settings
4. Deploy

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **RainbowKit + wagmi + viem** (wallet connection)
- **Tailwind CSS** + custom CSS variables
- **@tanstack/react-query** (async state)
- **Lucide React** (icons)
- **DiceBear** (pixel art avatars)
- **Google Fonts** — Space Grotesk + Space Mono

## Color Palette

| Color     | Hex       | Usage                  |
|-----------|-----------|------------------------|
| Sand      | `#E2E2B6` | CTAs, prices, accents  |
| Sky       | `#6EACDA` | Links, icons, badges   |
| Navy      | `#03346E` | Surfaces, buttons      |
| Midnight  | `#021526` | Dark backgrounds       |
| Snow      | `#F5F5F5` | Light mode background  |

---

Built by [@dimasdew](https://github.com/dimasdew)
