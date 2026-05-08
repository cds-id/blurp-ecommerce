# Blurp E-Commerce

A modern beauty & cosmetics e-commerce storefront built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**. Deployable to **Cloudflare Workers** via the OpenNextJS adapter.

> Powered by [Blurp Engine](https://github.com/cds-id/blurp-engine)

---

## Features

- **Storefront** — product catalog, product detail, cart, multi-step checkout, order tracking
- **Wishlist** — client-side wishlist management
- **Admin Dashboard** — orders, products, and reconciliation views (WIP)
- **Responsive UI** — separate mobile and desktop component trees toggled at the `md:` breakpoint
- **Cart persistence** — localStorage-backed cart with SSR-safe hydration
- **Cloudflare Workers ready** — full-stack deployment via OpenNextJS + Wrangler

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.x (App Router) |
| UI | React 19, Tailwind CSS v4, Radix UI, shadcn/ui |
| Icons | Lucide React |
| State | React Context + useReducer |
| Deployment | Cloudflare Workers (OpenNextJS + Wrangler) |
| Language | TypeScript 5 (strict) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). The root path (`/`) redirects to `/store`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Build for Node.js production |
| `npm run start` | Start Node.js production server |
| `npm run build:worker` | Build for Cloudflare Workers (OpenNextJS) |
| `npm run preview:worker` | Preview worker locally via Wrangler |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
app/                        # Next.js App Router pages
├── store/                  # Storefront routes
│   ├── catalog/            # Product listing & filtering
│   ├── product/[id]/       # Product detail (dynamic)
│   ├── keranjang/          # Cart
│   ├── checkout/           # Multi-step checkout
│   ├── order/[id]/         # Order tracking
│   └── tracker/            # Delivery tracker
├── admin/                  # Admin dashboard (WIP)
├── login/
├── profile/
├── lokasi/                 # Store locations
└── wishlist/

src/
├── components/
│   ├── desktop/            # Desktop-only UI components
│   ├── mobile/             # Mobile-only UI components
│   ├── shared/             # Shared components (CartProvider, ProductCard, etc.)
│   └── ui/                 # Base Radix/shadcn UI primitives
├── data/                   # Static TypeScript data (products, categories, shipping, stores)
├── hooks/                  # useCart, useIsMobile, useIsDesktop, useMediaQuery
└── lib/                    # cn(), formatPrice(), calculateDiscount()
```

---

## Architecture

### Mobile / Desktop Split

Rather than relying on CSS responsive variants alone, this project renders two separate component trees and toggles them at the `md:` breakpoint:

```tsx
<div className="md:hidden"><MobileShell /></div>
<div className="hidden md:block"><DesktopShell /></div>
```

This allows fully independent UX for each breakpoint without compromising either experience.

### Cart State

`CartProvider` (`src/components/shared/cart-provider.tsx`) wraps the app and manages cart state via `useReducer`. State is persisted to `localStorage` under the key `sorastore.cart.v1` and hydrated safely on the client. Use the `useCart()` hook anywhere inside the provider.

### Data Layer

All product, category, shipping, and store data lives as typed static arrays in `src/data/`. This makes it easy to swap with real API calls without changing component logic.

---

## Deployment (Cloudflare Workers)

This project uses [`@opennextjs/cloudflare`](https://github.com/opennextjs/cloudflare) to run the Next.js app on the Cloudflare Workers runtime.

```bash
# 1. Build the worker bundle
npm run build:worker

# 2. Preview locally
npm run preview:worker

# 3. Deploy
npm run deploy
```

Configuration is in `wrangler.toml`. The worker entry point is `.open-next/worker.js` and static assets are served from `.open-next/assets`.

---

## Design System

Custom Airbnb-inspired design tokens defined as CSS variables in `app/globals.css`:

- **Primary color**: `#ff385c` (brand red)
- **Typography scale**: `text-display-xl` → `text-body-sm` → `text-button-sm`
- **Utilities**: `cn()` for safe class merging (clsx + tailwind-merge), CVA for component variants
- **Animations**: `fadeIn`, `slideUp`, `cartBump`, `float`, `revealUp` + stagger delay utilities

---

## License

Private — all rights reserved.