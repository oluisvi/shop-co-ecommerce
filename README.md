# SHOP.CO

<p align="center">
  <strong>Fullstack fashion commerce application</strong><br />
  Editorial art direction, interactive 3D, persistent catalog, server-controlled inventory, real order creation and an accessibility-first storefront.
</p>

<p align="center">
  <a href="https://shop-co-store.vercel.app/">Live Demo</a>
  ·
  <a href="./CHANGELOG.md">Changelog</a>
  ·
  <a href="./docs/PHASE3_FULLSTACK.md">Phase 3 Architecture</a>
</p>

[![SHOP.CO live homepage](https://image.thum.io/get/width/1200/crop/760/png/maxAge/24/wait/4/https://shop-co-store.vercel.app/)](https://shop-co-store.vercel.app/)

## Overview

SHOP.CO started as a static fashion storefront, evolved into an **Urban Fashion Journal + functional commerce frontend**, and now adds a real commerce backend without replacing the approved interface.

The storefront remains a Next.js 15 Pages Router application with the same monochrome editorial system, custom Three.js fashion hero, product cards, motion language, responsive behavior, newsletter and footer. Phase 3 moves commerce authority behind a NestJS REST API and PostgreSQL database.

```text
Next.js storefront
      ↓ REST                         Supabase Auth
NestJS Commerce API ← JWT/JWKS      Supabase Storage
      ↓ Prisma 7                    Stripe Checkout/Webhooks
Supabase PostgreSQL
      ↓
Catalog · Profiles · Inventory · Orders · Events
```

## Current status

| Area | Status |
| --- | --- |
| Visual system / responsive layout | ✅ Preserved |
| Interactive 3D hero | ✅ Preserved |
| Product catalog | ✅ PostgreSQL-backed |
| Search / filters / sorting | ✅ API-backed |
| Product detail routes | ✅ Stable slugs + API data |
| Persistent guest shopping bag | ✅ `variantId + quantity` in localStorage |
| Cart reconciliation | ✅ Current price / availability / inventory |
| Checkout / payments | ✅ Stripe-hosted flow + signed webhook authority |
| Inventory | ✅ Atomic reserve, finalize, and release |
| Authentication / accounts | ✅ Supabase Auth + protected profile/order history |
| Seller Studio | ✅ Catalog, uploads, stock, orders, fulfillment |
| Production database / Storage | ✅ Final migrations, RLS hardening, and image bucket applied |
| Production frontend | ✅ Vercel commit `10eda5f` live; public responsive smoke passed |
| Production backend/auth/payment | ⚠️ Render still on old branch; Supabase Auth env and Stripe test setup pending |

## Final evolution foundation

The `codex/final-experience-commerce` branch delivers the approved “Archive in Motion” implementation:

- additive Profile/role, thrift metadata, payment event, audit event, and Stripe order fields;
- non-destructive migration preserving the existing catalog and orders;
- complete Supabase account recovery and protected owner-scoped account APIs;
- SELLER-protected Studio operations and hostile-input-aware Storage uploads;
- server-created Stripe Checkout, atomic reservations, signed raw-body webhooks, idempotency, and status polling;
- truthful one-of-one/sold archive UI, Product structured data, and thrift inspection fields;
- adaptive 3D tiers, exact CORS, security headers, throttling, and RLS/direct-access hardening.

The code is complete and locally verified. Production activation is intentionally not claimed until private Supabase/Stripe/Render values are configured and credential-backed test-mode scenarios pass.

## Fullstack commerce behavior

### Persistent catalog

The original 12 SHOP.CO products are migrated into PostgreSQL with the same IDs, slugs, names, prices, compare-at prices, imagery, ratings, categories and collections. Existing product URLs such as `/products/one-life` remain valid.

The One Life product keeps its existing gallery, three colors and four sizes. Those options are represented as real sellable variants with deterministic SKUs and independent inventory. Products that did not previously expose options receive one default variant rather than invented product data.

### Server-authoritative cart and inventory

The guest bag is still local and fast, but localStorage is no longer a source of commerce truth.

```text
shopco-cart-v3
└── CartLine { variantId, quantity }
```

When the bag changes, the storefront calls the commerce API to reconcile current product data, price, active state and stock. Legacy `shopco-cart-v2` product lines are migrated to each product's default sellable variant when possible.

### Checkout and orders

`/checkout` collects contact and shipping information, displays the reconciled order summary, validates the form and creates an order.

The frontend sends only:

```json
{
  "customer": { "email": "...", "firstName": "...", "lastName": "..." },
  "shippingAddress": { "addressLine1": "...", "city": "..." },
  "items": [{ "variantId": "one-life-olive-small", "quantity": 1 }]
}
```

It does **not** send trusted prices or totals. The API loads the real variant price, validates stock, calculates subtotal/shipping/total, decrements inventory atomically and stores immutable order-item snapshots inside one database transaction.

Orders receive a public number such as `SHOP-000123` and begin in `CREATED`. Phase 3 does not pretend payment happened.

## Tech stack

### Storefront

- Next.js 15.5 — Pages Router
- React 19
- TypeScript 5
- Three.js 0.185
- CSS layers: `globals.css`, `fixes.css`, `experience.css`, `phase2.css`, `polish.css`, `phase3.css`
- React Context for guest cart state
- Node test runner
- Vercel

### Commerce API

- NestJS 11
- TypeScript
- Prisma ORM 7
- `@prisma/adapter-pg`
- PostgreSQL
- class-validator / class-transformer
- Helmet
- Jest

No GraphQL, Redis, queues, Kafka, event sourcing, CQRS or microservices are required for this phase.

## Repository architecture

```text
.
├── src/                         # existing Next.js storefront
│   ├── components/
│   ├── context/
│   │   └── CommerceContext.tsx
│   ├── data/                    # original catalog retained as reference/tests
│   ├── lib/
│   │   ├── api/
│   │   ├── cart.ts
│   │   ├── cart-reconciliation.ts
│   │   └── checkout.ts
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── categories/index.tsx
│   │   ├── products/[slug].tsx
│   │   └── checkout.tsx
│   ├── styles/
│   └── types/
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── catalog-seed-data.ts
│   │   └── seed.ts
│   └── src/
│       ├── common/
│       ├── config/
│       ├── prisma/
│       └── modules/
│           ├── products/
│           ├── categories/
│           └── orders/
└── docs/PHASE3_FULLSTACK.md
```

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/products` | search, category filter, sort, max price, pagination |
| GET | `/products/:slug` | product + images + variants + available stock |
| POST | `/products/reconcile` | validate guest cart against current commerce state |
| GET | `/categories` | category facets + price range |
| POST | `/orders` | backward-compatible route to server-created Checkout |
| POST | `/checkout/sessions` | reserve stock and create Stripe Checkout |
| GET | `/checkout/sessions/:id` | authoritative payment/order status |
| POST | `/webhooks/stripe` | signed Stripe event processing |
| GET/PATCH | `/account/*` | owner-scoped profile and orders |
| GET/POST/PATCH | `/studio/*` | SELLER-only operations and uploads |

Errors use a stable contract:

```json
{
  "statusCode": 404,
  "code": "PRODUCT_NOT_FOUND",
  "message": "Product not found"
}
```

## Database and migrations

Prisma is configured in `server/prisma.config.ts`; the PostgreSQL schema is versioned in `server/prisma/migrations`.

Development:

```bash
cd server
npm run prisma:migrate:dev
npm run prisma:seed
```

Production:

```bash
cd server
npm run prisma:migrate:deploy
```

`prisma db push` is not the production deployment strategy.

## Environment variables

Root `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`server/.env`:

```bash
DATABASE_URL=postgresql://...
PORT=4000
FRONTEND_URLS=http://localhost:3000,https://shop-co-store.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only
SUPABASE_STORAGE_BUCKET=shopco-products
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=development
```

Examples are committed; real `.env` files remain ignored.

## Run locally

**Requirements:** Node.js 20+ and PostgreSQL.

Backend:

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

Frontend, in a second terminal:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

Frontend gates:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Backend gates:

```bash
cd server
npm test
npm run typecheck
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

Latest branch evidence: 62/62 frontend tests and 67/67 backend tests pass; both production builds, typechecks, lints, and Prisma validation/generation pass. Browser smoke QA confirms meaningful desktop/mobile content, no framework overlay, no 390 px horizontal overflow, password recovery rendering, and Studio guest protection.

Migration and seed should also be executed against a disposable PostgreSQL database before production deployment.

## Security foundation

- environment validation fails fast
- Helmet before routes
- strict configured CORS
- 100 KB body limit
- DTO whitelist with unknown fields rejected
- no client-authoritative prices
- server-side product/variant/inventory validation
- atomic order + inventory transaction
- structured errors without production stack traces
- logs avoid secrets and full sensitive payloads

## Accessibility and performance

Phase 3 keeps the existing accessibility and WebGL performance work: semantic landmarks/headings, skip navigation, visible focus states, drawer focus containment, Escape/backdrop behavior, live cart announcements, reduced-motion support, capped WebGL DPR, visibility/intersection pausing and GPU cleanup.

Checkout adds labels, associated inline errors, a focusable error summary, keyboard navigation, `aria-live`/status messaging and clear inventory failure states.

## Deployment

1. provision managed PostgreSQL;
2. deploy the NestJS API with `DATABASE_URL` and `FRONTEND_URL`;
3. run `prisma migrate deploy` and seed;
4. expose the API from a normal Node.js hosting platform;
5. set Vercel `NEXT_PUBLIC_API_URL`;
6. redeploy the Next.js storefront.

The backend uses `DATABASE_URL` and is not coupled to a specific PostgreSQL or Node host.

## Roadmap

### Phase 1 — Visual revitalization

Fashion-editorial redesign, responsive system, accessibility and Three.js direction.

### Phase 2 — Functional frontend

Search, filters, sorting, stable product routes, persistent guest cart, 3D GLB fashion figure and final portfolio polish.

### Phase 3 — Fullstack commerce foundation

PostgreSQL catalog, variants, inventory, orders, API-backed storefront, cart reconciliation and checkout without payment.

### Final evolution — Operational digital thrift store

Implemented on the final-evolution branch: Supabase accounts, Seller Studio/uploads, Stripe Checkout/webhooks, inventory reservations, fulfillment, sold archive, adaptive rendering, and security hardening. True future refinements include transactional email, carrier tracking, wishlists, and advanced seller analytics.

## Credits

- Design and development: **Luis Henrique Vieira Barros**
- 3D fashion figure: **Tiko — CC BY 4.0**
- Product imagery and fashion assets are used as part of this portfolio demonstration storefront.
