# SHOP.CO Phase 3 — Implementation Handoff Report

Date: 2026-08-19
Target branch: `feat/commerce-backend-phase-3`
Baseline inspected: `main` at `f0bfb41646a1a27e2625c5632f28429f76cc0552`

## Architecture

The approved Next.js storefront stays at the repository root. No monorepo conversion or visual redesign was introduced. A standalone NestJS application is added under `server/`.

```text
Next.js storefront
  -> REST commerce client (`src/lib/api`)
  -> NestJS API (`server/src`)
  -> Prisma 7 + @prisma/adapter-pg
  -> PostgreSQL
```

The browser remains guest-first and persists only `variantId + quantity`. PostgreSQL is the durable source of truth for catalog, variants, inventory and orders.

## Database schema

Implemented models:

- `Category`
- `Product`
- `ProductImage`
- `ProductVariant`
- `Inventory`
- `Order`
- `OrderItem`
- `Address`

Implemented enums:

- `ProductStatus`: `ACTIVE`, `DRAFT`, `ARCHIVED`
- `OrderStatus`: `CREATED`, `PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

Money uses PostgreSQL Decimal columns. Slugs, SKUs and order numbers are unique/indexed. Product status/category and order status/created time have supporting indexes. Inventory and order-item quantity checks are present in the versioned SQL migration.

## Catalog seed

The seed preserves the original 12 SHOP.CO products and their stable product IDs/slugs.

- original names preserved
- original card imagery preserved
- original prices/compare-at prices preserved
- original ratings/categories/collections preserved
- One Life gallery preserved
- One Life: 3 colors x 4 sizes = 12 real variants
- products without existing options receive one default variant only
- initial stock: 20 units per seeded variant
- rerunning the seed does not reset existing inventory

## API endpoints

### `GET /products`

Supports:

- `search`
- `category`
- `sort`
- `maxPrice`
- `page`
- `limit`

Returns `items + pagination`.

### `GET /products/:slug`

Returns current product data, category, ordered images, sellable variants and available stock. Unknown/inactive product => `404 PRODUCT_NOT_FOUND`.

### `POST /products/reconcile`

Batch-loads all requested variant IDs and reports:

- removed variants
- inactive product/variant
- insufficient/out-of-stock quantity

Current price and stock data is returned with each valid cart item. There is no N+1 variant lookup loop.

### `GET /categories`

Returns category facets, active product counts and current price range.

### `POST /orders`

Accepts customer/contact data, shipping address, and only `{ variantId, quantity }` lines.

The service:

1. batch-loads requested variants;
2. validates quantity, product status, variant status and inventory;
3. reads unit price only from PostgreSQL;
4. conditionally decrements inventory with a stock predicate;
5. calculates subtotal in integer cents;
6. applies centralized shipping;
7. creates immutable order-item snapshots;
8. creates address + order within the same Prisma transaction;
9. updates the public identifier to `SHOP-000123` style;
10. returns `CREATED`, never a fake payment status.

## Shipping

Phase 3 rule:

- USD 15 flat rate
- free at USD 150 subtotal

The authoritative rule exists only in the backend order pricing domain. Before order creation, checkout labels shipping as server-calculated rather than duplicating a magic amount in the browser.

## Frontend integration

Implemented centralized client layer:

```text
src/lib/api/
  client.ts
  products.ts
  categories.ts
  orders.ts
  mappers.ts
```

Migrated surfaces:

- homepage product sections -> API
- catalog -> API search/filter/sort/facets
- product detail -> API by stable slug
- header suggestions -> debounced API search
- quick add -> real default variant ID
- product option selection -> exact color/size variant
- cart -> API reconciliation
- checkout -> order API

The original local catalog remains in the repository as source/seed reference and for legacy tests; page data is no longer sourced from it.

## Cart behavior

New persistence key:

```text
shopco-cart-v3
CartLine { variantId, quantity }
```

A safe migration path reads legacy `shopco-cart-v2` `{ productId, quantity }` lines, resolves current products through the API and stores each product's deterministic default sellable variant.

Current subtotal is calculated from reconciled server prices, not stale product objects.

## Checkout

Added `/checkout` with the existing editorial visual language.

Fields:

- email
- first name
- last name
- address line 1
- optional address line 2
- city
- state/region
- postal code
- 2-letter country code

Accessibility additions:

- explicit labels
- associated inline validation messages
- `aria-invalid` / `aria-describedby`
- focusable error summary
- stock/error status regions
- normal keyboard navigation
- no forced smooth-scroll motion

Before submission the cart is reconciled again. The payload builder contains variant IDs and quantities only; no trusted client price exists.

Order confirmation displays the returned order number, status and server totals and explicitly states that no payment was processed.

## Security foundation

Implemented:

- startup environment validation
- Helmet before route handling
- strict configured CORS
- 100 KB JSON/form payload limits
- DTO whitelist
- unknown payload fields rejected
- normalized API errors
- production-safe 500 responses without stack traces
- structured startup/database/order failure logs
- no secrets or complete customer payloads in logs
- no client-authoritative prices
- transaction-protected order + inventory mutation

## Environment variables

Frontend:

- `NEXT_PUBLIC_API_URL`

Backend:

- `DATABASE_URL`
- `PORT`
- `FRONTEND_URL`
- `NODE_ENV`

Only `.env.example` files are included.

## Migrations and seed

Development:

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

Production:

```bash
cd server
npm run prisma:migrate:deploy
```

## Testing added

Frontend/domain tests cover:

- variant cart add/update/remove/count/persistence
- current-price reconciliation subtotal
- blocking unavailable/insufficient-stock issues
- API product mapping
- checkout field validation
- order payload excludes prices
- Phase 2 -> Phase 3 source contracts

Backend test specifications cover:

- environment validation
- exact 12-product seed contract
- ProductsService filtering/slug/404
- cart reconciliation removed/unavailable/stock cases
- category facets
- shipping threshold
- server-authoritative order pricing
- invalid variant
- inactive variant
- inactive product
- invalid quantity
- atomic stock conflict
- transaction wrapping
- no order creation when a later line fails

## Verification completed in this execution environment

Completed with fresh checks against the delivered overlay:

- 21/21 executable frontend/domain tests passed
- 15 accessibility source-contract checks passed
- TypeScript transpile/syntax diagnostics: 0 errors across 55 TS/TSX files
- 46/46 static Phase 3 architecture/requirement checks passed
- 27 backend Jest test cases are present across 8 spec files
- all JSON manifests parsed successfully
- 12-product seed data contract checked with 12 unique slugs
- One Life 12-combination variant contract checked
- shipping boundary contract checked: $15 below $150 and free shipping at/above $150
- versioned PostgreSQL migration, lock file, indexes and nonnegative constraints are present
- no real `.env` file is included in the overlay
- secret-pattern scan passed after excluding explicit test fixtures and `.env.example` placeholders
- no font files or `node_modules` directories are included in the deliverable
- baseline `main` remote Vercel status was `success` before Phase 3 changes

## Quality gates not executable here

The following gates are intentionally **not marked successful**, because the execution sandbox could not install backend packages and no PostgreSQL connection was supplied:

- full repository `npm test` including all unchanged baseline files
- frontend `npm run typecheck`
- frontend `npm run lint`
- frontend `npm run build`
- backend Jest suite execution
- backend `npm run typecheck`
- backend `npm run lint`
- backend `npm run build`
- `prisma validate`
- `prisma generate`
- real `prisma migrate deploy`
- real seed against PostgreSQL

`npm install` inside `server/` was attempted and timed out in the network-restricted sandbox before dependencies were available. A fresh `npm test` attempt then stopped at `prisma generate` with `prisma: not found`, confirming that backend Jest/Prisma gates cannot be represented as passing in this environment.

## Git / PR limitation

The GitHub connector successfully read the repository but returned:

```text
403 Resource not accessible by integration
```

when creating `feat/commerce-backend-phase-3`.

No write was attempted against `main` after that failure. Therefore:

- main was not modified
- no remote branch was created
- no remote commits were created
- no PR was opened

The delivered overlay should be applied on a local/remote branch named `feat/commerce-backend-phase-3`, then the blocked quality gates above must be run before merge.

## Suggested commits after applying the overlay

1. `chore: scaffold commerce api`
2. `feat: add prisma commerce schema and seed`
3. `feat: implement product and category api`
4. `feat: add transactional inventory and orders`
5. `feat: integrate storefront with commerce api`
6. `feat: migrate cart to sellable variants`
7. `feat: add accessible checkout flow`
8. `test: cover commerce phase 3 domains`
9. `docs: document fullstack commerce architecture`

## Deployment requirements

1. managed PostgreSQL
2. backend environment variables
3. `prisma migrate deploy`
4. one seed run
5. deployed Node.js 20+ API
6. Vercel `NEXT_PUBLIC_API_URL`
7. frontend redeploy

## Known limitations / deliberate exclusions

Not implemented by design:

- payment provider
- authentication
- user/customer account
- order history UI
- admin dashboard
- transactional email
- temporary stock reservations
- coupons/wishlist
- Redis/queues
- GraphQL/microservices

## Next phase

**SHOP.CO Phase 4 — Payments + Customer Accounts**

The current order boundary is ready for payment intents/sessions, webhooks, authentication, customer order history, transactional email and admin tooling without moving price or inventory authority back to the client.
