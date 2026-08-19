# SHOP.CO Phase 3 — Fullstack Commerce Architecture

## Scope

Phase 3 turns the existing SHOP.CO storefront into a fullstack commerce application without redesigning the approved fashion-editorial frontend. The Next.js app remains at the repository root. A separate NestJS API lives in `server/` and uses PostgreSQL through Prisma.

Out of scope: payment providers, authentication, customer accounts, admin tooling, transactional email, Redis, queues, GraphQL, microservices, coupons, wishlists, and recommendation AI.

## Runtime architecture

```text
Browser / Next.js 15 storefront
        |
        | REST (NEXT_PUBLIC_API_URL)
        v
NestJS commerce API
        |
        | Prisma 7 + @prisma/adapter-pg
        v
PostgreSQL

Catalog: Category -> Product -> ProductVariant -> Inventory
Orders: Order -> OrderItem snapshots + Address
```

The storefront persists only `variantId + quantity`. Product names, prices, availability, and inventory are refreshed from the API and are never trusted from localStorage.

## Database

Models:

- `Category`: unique stable slug and display name.
- `Product`: stable ID/slug, status (`ACTIVE`, `DRAFT`, `ARCHIVED`), category, collection, card image, rating and description.
- `ProductImage`: ordered product gallery.
- `ProductVariant`: sellable SKU with optional color/size, Decimal price and compare-at price.
- `Inventory`: quantity and reserved quantity for one variant.
- `Order`: numeric ID, public order number, status, customer details and Decimal totals.
- `OrderItem`: immutable product/variant/SKU/name/price snapshot.
- `Address`: shipping snapshot attached to an order.

The migration also adds non-negative stock checks and indexes for product status/category, product slug, category slug, variant SKU, order number, order status and order creation time.

## Money and shipping

Money is persisted as `DECIMAL(10,2)` in PostgreSQL. Order arithmetic converts Decimal values to integer cents before totals are calculated.

Shipping rule for Phase 3:

- flat shipping: **USD 15.00**
- free shipping at **USD 150.00** subtotal

The rule is centralized in `server/src/modules/orders/pricing.ts`. The frontend shows shipping as server-calculated until the order is created.

## Inventory and concurrency

`POST /orders` validates each requested variant inside a Prisma transaction. Stock is decremented with a conditional atomic update that only succeeds when the remaining quantity can satisfy the request. If another order consumes the last unit first, the update count becomes zero and the API returns `409 INSUFFICIENT_STOCK`. Order creation and inventory decrements roll back together if any operation fails.

Temporary inventory reservations are deliberately not implemented in this phase.

## API

### `GET /products`

Query parameters:

- `search`
- `category` — one or multiple comma-separated category slugs/names
- `sort` — `featured`, `price-asc`, `price-desc`, `rating-desc`
- `maxPrice`
- `page`
- `limit` (max 100)

Response:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 24, "total": 12, "totalPages": 1 }
}
```

### `GET /products/:slug`

Returns the active product, images, category, variants and current available quantity. Unknown/inactive products return `404 PRODUCT_NOT_FOUND`.

### `POST /products/reconcile`

Request:

```json
{ "items": [{ "variantId": "one-life-olive-small", "quantity": 2 }] }
```

Returns current product/variant data plus issues such as removed variants, unavailable products and stock shortfalls.

### `GET /categories`

Returns active category facets, product counts and current min/max prices.

### `POST /orders`

The browser sends customer/contact details, shipping address and only `{ variantId, quantity }` lines. There are no client-provided prices or totals.

The API:

1. loads each variant from PostgreSQL;
2. validates active product/variant state;
3. validates and atomically decrements inventory;
4. calculates subtotal from server prices;
5. calculates shipping and total;
6. creates immutable `OrderItem` snapshots;
7. creates the address and order in the same transaction;
8. exposes a `SHOP-000123`-style order number.

Orders begin with status `CREATED`. No payment is implied.

## Seed

The seed migrates the existing 12-product local SHOP.CO catalog into PostgreSQL and preserves current IDs, slugs, names, card images, prices, compare-at prices, ratings, categories and collections. The One Life product also preserves its current gallery, three colors and four sizes; those options become 12 real sellable variants. Products without existing option data receive one default variant only.

Initial inventory is 20 units per seeded variant. Re-running the seed does not reset existing stock.

## Local development

Backend runtime: Node.js 20+ (NestJS 11).

### 1. PostgreSQL

Create a PostgreSQL database and copy the environment files:

```bash
cp server/.env.example server/.env
cp .env.example .env.local
```

Set `DATABASE_URL` in `server/.env`.

### 2. Backend

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

API defaults to `http://localhost:4000`.

### 3. Frontend

From the repository root:

```bash
npm install
npm run dev
```

Frontend defaults to `http://localhost:3000` and reads `NEXT_PUBLIC_API_URL`.

## Migrations

Development:

```bash
cd server
npm run prisma:migrate:dev
```

Production:

```bash
cd server
npm run prisma:migrate:deploy
```

Do not use `prisma db push` as the production migration strategy.

## Testing and quality gates

Frontend:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Backend:

```bash
cd server
npm test
npm run typecheck
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

Run migration + seed against a disposable PostgreSQL database before production deployment.

## Deployment

Recommended dependency order:

1. provision managed PostgreSQL;
2. set API `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV=production`, and `PORT`;
3. run `prisma migrate deploy` and seed once;
4. deploy the NestJS service to a standard Node.js host;
5. set Vercel `NEXT_PUBLIC_API_URL` to the public API origin;
6. redeploy the storefront.

The application code is not coupled to one PostgreSQL or Node hosting provider.

## Error contract and security

API errors use a stable shape:

```json
{ "statusCode": 404, "code": "PRODUCT_NOT_FOUND", "message": "Product not found" }
```

Production responses do not expose stack traces. Bootstrap enables Helmet before route handling, strict CORS, a 100 KB body limit, global DTO validation with unknown fields rejected, environment validation and structured error logging. Sensitive customer data and secrets are not written into error logs.

## Cart migration

Phase 2 used `shopco-cart-v2` lines shaped as `{ productId, quantity }`. On first Phase 3 hydration, the storefront can resolve those products against the API, select each default sellable variant, save `shopco-cart-v3`, and remove the legacy key. Invalid legacy lines are dropped rather than becoming a source of truth.

## Phase 4 handoff

The current schema/order boundary is ready for a future payment/customer-account phase. Phase 4 can add payment intents/sessions, webhooks, authentication, order history, email and admin tooling without changing the core rule that the server owns prices and inventory.
