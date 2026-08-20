# SHOP.CO Final Experience + Commerce Design

## Purpose

Evolve the existing Phase 3 application into an operable single-seller digital thrift store while preserving its Next.js Pages Router storefront, NestJS REST API, Prisma/PostgreSQL catalog, stable product URLs, guest cart, editorial identity, and Three.js hero.

## Decisions

- **KEEP:** framework boundaries, stable IDs/slugs, variant cart, server-authoritative pricing, order snapshots, monochrome typography, and the existing GLB hero.
- **REFINE:** product storytelling, one-of-one/sold states, product detail, checkout handoff, responsive performance tiers, metadata, and security headers.
- **EXTEND:** Supabase Auth, profiles/roles, customer order history, Seller Studio, thrift metadata, image management, Stripe Checkout, reservations, webhook idempotency, and seller audit events.
- **REPLACE ONLY IF NECESSARY:** no architectural component is replaced. Existing order creation becomes a compatibility wrapper around pending checkout creation only where payment credentials are configured.

## Architecture and boundaries

The browser keeps public catalog and guest-cart behavior. Supabase Auth manages sessions; the browser sends its access token to protected NestJS endpoints. NestJS verifies signature, issuer, audience, and expiry against Supabase JWKS, then loads the Profile row for authorization. SELLER is assigned only by a database/server operation.

Prisma remains the only commerce data authority. Product extensions are nullable/defaulted so existing rows remain valid. Orders may remain guest orders, but authenticated future orders store the verified profile ID. Old guest orders are never claimed by email.

Stripe-hosted Checkout is created by NestJS from live database prices and fixed server origins. A transaction reserves inventory and creates a PENDING_PAYMENT order. Stripe webhooks, verified from the raw request body, finalize or release inventory exactly once using a unique PaymentEvent ID. Browser redirects never mark payment successful.

Seller Studio calls authenticated REST endpoints for dashboard, products, inventory, uploads, and fulfillment status. Uploads are SELLER-only, content-limited, randomized, and sent to Supabase Storage through the server. The public storefront never receives service-role or Stripe secrets.

## Product and experience

Product gains conservative thrift metadata: brand, condition, condition notes, material, measurements, imperfections, featured, publishedAt, and soldAt. One-off products default to one variant and quantity one; the existing multi-variant catalog remains valid. Sold/archive pieces remain browseable with truthful availability and no purchase CTA.

“The Archive in Motion” is expressed through editorial labels, contact-sheet rhythm, and live-to-sold states. The existing 3D figure stays optional progressive enhancement. Capability tiers use reduced motion, save-data, viewport, DPR, memory, and CPU hints to cap rendering quality without changing information architecture.

## Security and threats

Assets include identities, addresses, orders, inventory, seller privileges, catalog, payment state, secrets, and media. Trust boundaries are Browser → Vercel → Render/NestJS → Supabase/PostgreSQL/Storage and Stripe. Controls include verified bearer tokens, server-side role lookup, owner-scoped order queries, DTO whitelisting, exact CORS origins, throttling on mutations, size limits, server prices, atomic stock predicates, signed/idempotent webhooks, RLS/grant hardening, restrictive headers, and secret scanning.

Validation proves invalid/expired JWT rejection, IDOR denial, customer denial from seller endpoints, price tamper resistance, last-unit concurrency, Stripe rollback, duplicate/invalid webhook behavior, reservation expiry, upload authorization/type/size validation, and compatibility of all Phase 3 flows.

## Failure handling

Protected APIs return stable 401/403 responses without revealing resource existence. Stripe-session failure releases reservations. Duplicate/stale webhooks are acknowledged idempotently. Missing external credentials fail clearly in production and leave local mocked tests usable. Storage failures do not create product image records and orphan cleanup is attempted.

## Delivery constraint

Code, migrations, tests, env examples, README, CHANGELOG, and deployment instructions are completed locally. Live Supabase/Stripe/Vercel/Render changes occur only when authenticated credentials and project access are already available; otherwise the exact remaining configuration is documented without fabricating secrets.
