# SHOP.CO Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn SHOP.CO into a fullstack commerce application with a NestJS REST API, PostgreSQL/Prisma catalog and inventory, server-authoritative order creation, API-backed storefront data, cart reconciliation, and a payment-free checkout.

**Architecture:** Keep the approved Next.js storefront at the repository root and add an independent `server/` NestJS application. PostgreSQL is the durable source of truth for products, variants, inventory, categories, and orders; the browser persists only `variantId + quantity`, while API reconciliation refreshes current product, price, and stock data. Product URLs remain stable and the visual system is extended only with checkout-specific styles.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, NestJS 11, Prisma ORM 7, PostgreSQL, `@prisma/adapter-pg`, class-validator/class-transformer, Helmet, Jest, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-19-shopco-phase3-design.md`

## Global Constraints

- Preserve `/`, `/categories`, and `/products/[slug]`; add `/checkout`.
- Preserve the current visual identity, Three.js hero, motion, typography, product cards, newsletter, footer, responsive behavior, and accessibility.
- Do not implement payments, auth, customer accounts, admin, Redis, queues, GraphQL, or microservices.
- Money is stored with PostgreSQL `Decimal`, never float.
- Server is authoritative for price, active status, variant existence, and inventory.
- Orders and stock mutation are atomic and must resist trivial overselling.
- Never commit secrets; use `DATABASE_URL`, `PORT`, `FRONTEND_URL`, `NODE_ENV`, and `NEXT_PUBLIC_API_URL`.
- Keep the 12 existing product names, slugs, prices, discounts, imagery, categories, colors, and sizes.

---

### Task 1: Commerce database and NestJS foundation

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/tsconfig.build.json`, `server/nest-cli.json`
- Create: `server/prisma.config.ts`, `server/prisma/schema.prisma`, `server/prisma/migrations/20260819000100_init_commerce/migration.sql`
- Create: `server/src/main.ts`, `server/src/app.module.ts`, `server/src/config/env.ts`
- Create: `server/src/prisma/prisma.module.ts`, `server/src/prisma/prisma.service.ts`
- Create: `server/src/common/logging/json-logger.ts`, `server/src/common/filters/api-exception.filter.ts`

**Interfaces:**
- Produces Prisma models `Category`, `Product`, `ProductImage`, `ProductVariant`, `Inventory`, `Order`, `OrderItem`, and `Address`.
- Produces validated runtime config and a globally injectable `PrismaService`.

- [ ] Write environment-validation tests before the runtime validator.
- [ ] Add Prisma schema and migration with unique/indexed slugs, SKU, order number, status/date indexes, decimal money columns, and FK behavior for historical order snapshots.
- [ ] Configure Prisma 7 with `prisma.config.ts`, generated client output, PostgreSQL adapter, and ESM.
- [ ] Add Nest bootstrap with Helmet before routes, strict CORS, payload limit, global validation pipe, structured logger, and normalized error filter.
- [ ] Verify backend typecheck/build commands are defined.

### Task 2: Seed the current 12-product catalog

**Files:**
- Create: `server/prisma/seed.ts`
- Test: `server/src/modules/products/catalog-seed.spec.ts`

**Interfaces:**
- Consumes the schema from Task 1.
- Produces the exact existing catalog with stable product IDs/slugs plus sellable variants and inventory.

- [ ] Write a seed-contract test for 12 stable slugs and preserved prices/categories.
- [ ] Create five categories using stable lowercase slugs.
- [ ] Preserve the One Life gallery, colors, and sizes; generate one variant for each existing color/size combination.
- [ ] Create one default sellable variant for products that currently have no option data.
- [ ] Seed deterministic SKU values and a modest initial stock quantity without inventing additional products.

### Task 3: Products and categories REST API

**Files:**
- Create: `server/src/modules/products/*`
- Create: `server/src/modules/categories/*`
- Test: `server/src/modules/products/products.service.spec.ts`, `server/src/modules/categories/categories.service.spec.ts`

**Interfaces:**
- Produces `GET /products`, `GET /products/:slug`, `POST /products/reconcile`, and `GET /categories`.
- Product DTO maps Prisma records into the existing storefront-facing Product shape plus variants and available quantity.

- [ ] Write failing service tests for search, category, sort, max price, pagination, slug lookup, and 404.
- [ ] Implement query DTO validation for `search`, `category`, `sort`, `maxPrice`, `limit`, and `page`.
- [ ] Return `items + pagination` from list endpoint and category/facet metadata from categories endpoint.
- [ ] Implement cart reconciliation that reports removed variants, inactive products/variants, price changes, and stock shortfalls while returning current product/variant details.
- [ ] Add controllers and consistent API errors.

### Task 4: Order domain, shipping, and atomic inventory

**Files:**
- Create: `server/src/modules/orders/*`
- Test: `server/src/modules/orders/pricing.spec.ts`, `server/src/modules/orders/orders.service.spec.ts`

**Interfaces:**
- Produces `POST /orders` accepting customer, shipping address, and `{ variantId, quantity }[]` only.
- Produces order snapshots with server-calculated subtotal, shipping, total, and status `CREATED`.

- [ ] Write pricing tests for flat shipping and free-shipping threshold.
- [ ] Write order tests for server-side price authority, invalid variant, inactive variant/product, invalid quantity, insufficient stock, and rollback behavior.
- [ ] Implement a centralized shipping rule (`$15`, free at `$150`).
- [ ] Use a Prisma transaction and conditional `inventory.updateMany({ quantity: { gte: requested } })` decrement to avoid trivial overselling.
- [ ] Persist product/variant/SKU/name/price snapshots in `OrderItem` and generate a stable `SHOP-000123`-style order number from the created numeric order ID.

### Task 5: Frontend API contracts and mapping

**Files:**
- Create: `src/lib/api/client.ts`, `src/lib/api/products.ts`, `src/lib/api/categories.ts`, `src/lib/api/orders.ts`, `src/lib/api/mappers.ts`
- Modify: `src/types/store.ts`
- Test: `src/lib/api-mapping.test.ts`

**Interfaces:**
- Produces typed API client functions `listProducts`, `getProduct`, `getCategories`, `reconcileCart`, and `createOrder`.
- Extends `Product` with optional API-backed variants while preserving current card/detail props.

- [ ] Write mapper tests for money conversion, images, colors, sizes, href, and default variant selection.
- [ ] Implement a single `NEXT_PUBLIC_API_URL`-backed fetch client with normalized `ApiError`.
- [ ] Keep the local catalog only as seed/reference/test data; page data must come from the API.

### Task 6: Variant-based cart persistence and reconciliation

**Files:**
- Modify: `src/lib/cart.ts`, `src/lib/cart.test.ts`, `src/context/CommerceContext.tsx`
- Create: `src/lib/cart-reconciliation.test.ts`

**Interfaces:**
- Browser persistence becomes `shopco-cart-v3` with `CartLine { variantId, quantity }`.
- Commerce context exposes reconciled cart details/issues and server-authoritative subtotal.

- [ ] Rewrite cart tests first around variant IDs while preserving add/update/remove/count/serialization coverage.
- [ ] Add safe migration from `shopco-cart-v2` by resolving old product IDs against API products and selecting their default variant.
- [ ] Reconcile cart whenever persisted lines change and surface current price, availability, and stock issues.
- [ ] Never calculate the authoritative subtotal from stale local product objects.

### Task 7: Storefront catalog/product/search migration

**Files:**
- Modify: `src/pages/index.tsx`, `src/pages/categories/index.tsx`, `src/pages/products/[slug].tsx`
- Modify: `src/components/ProductCard.tsx`, `src/components/SiteLayout.tsx`

**Interfaces:**
- Home, catalog, product detail, search suggestions, quick add, and detailed cart all consume API-backed products.

- [ ] Load homepage product sections from API while preserving the existing section layout.
- [ ] Load catalog results from `GET /products` when URL filters/search/sort change and facets from `GET /categories`.
- [ ] Replace product SSG with SSR API lookup so stable slugs remain valid without a static catalog import.
- [ ] Resolve selected color/size to an actual sellable variant and add its variant ID to cart.
- [ ] Make search suggestions API-backed with a short debounce.
- [ ] Preserve all modal focus trapping, keyboard controls, motion, and markup semantics.

### Task 8: Checkout and order confirmation

**Files:**
- Create: `src/pages/checkout.tsx`, `src/lib/checkout.ts`, `src/lib/checkout.test.ts`, `src/styles/phase3.css`
- Modify: `src/pages/_app.tsx`, `src/components/SiteLayout.tsx`

**Interfaces:**
- Checkout creates orders only after reconciled cart validation and sends no client price.

- [ ] Write validation tests for email and all required shipping fields.
- [ ] Add accessible labeled checkout form, inline errors, focus target, `aria-live`, and order summary.
- [ ] Block submission when reconciliation reports unavailable/insufficient inventory.
- [ ] Submit `{ customer, shippingAddress, items: [{ variantId, quantity }] }` and clear the cart only on success.
- [ ] Show order number, actual server totals, and `CREATED` status without implying payment succeeded.
- [ ] Add checkout-only responsive CSS and import it after Phase 2 styles without altering approved sections.

### Task 9: Documentation and environment/deployment contract

**Files:**
- Create: `.env.example`, `server/.env.example`, `docs/PHASE3_FULLSTACK.md`
- Modify: `README.md`, `.gitignore`, root `package.json`

**Interfaces:**
- Documents local frontend/API startup, migrations, seed, endpoints, checkout, testing, deployment, and limitations.

- [ ] Add root helper scripts for API development/build/test without converting the repo into a monorepo.
- [ ] Document `prisma migrate dev`, `prisma migrate deploy`, `prisma db seed`, and `prisma generate`.
- [ ] Document deployment ordering: managed PostgreSQL → API → `NEXT_PUBLIC_API_URL` → Vercel frontend.
- [ ] Explicitly document that payment/auth/admin/email remain Phase 4.

### Task 10: Quality gates and handoff

**Files:**
- Review every changed file and tests.

**Interfaces:**
- Produces a PR-ready Phase 3 patch.

- [ ] Run frontend `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- [ ] Run backend install, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `prisma validate`, and `prisma generate`.
- [ ] Run migration/seed against a disposable PostgreSQL database when `DATABASE_URL` is available.
- [ ] Confirm no secrets or `.env` values are included.
- [ ] Prepare final report with architecture, schema, endpoints, frontend integration, inventory behavior, environment variables, migration/deployment instructions, known limitations, and Phase 4 handoff.
