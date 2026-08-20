# SHOP.CO Final Evolution Report — 2026-08-20

## Baseline and design decision

The branch began with 51 frontend and 27 backend tests. The editorial monochrome system, stable URLs/IDs, variant guest cart, API catalog, server pricing, order snapshots, accessibility primitives, and Three.js GLB lifecycle were strong and were kept. Classification: **KEEP** architecture and identity; **REFINE** capability scaling, product truth states, and metadata; **EXTEND** auth, account, Studio, uploads, payments, reservations, and fulfillment; no wholesale replacement.

## Experience

“The Archive in Motion” now has truthful `1 OF 1` and `SOLD / ARCHIVE` states. Sold pieces remain browsable, have no purchase CTA, and publish SoldOut structured data. Product pages expose thrift inspection fields. The hero remains the anchor: Tier A is static, Tier B uses lower DPR, and Tier C uses the higher capped DPR. Reduced-motion, save-data, visibility/off-screen pausing, and GPU cleanup remain intact.

## Store operation and accounts

Seller Studio is JWT- and role-protected server-side. It provides dashboard counts, product intake, safe image upload, product listing/archive, inventory adjustment, order listing, and legal fulfillment transitions. One-off creation defaults to one unit and seller actions create audit events.

Supabase Auth provides sign-up, sign-in, persistent sessions, sign-out, reset request, password update, and protected account routing. NestJS verifies asymmetric JWTs through JWKS (issuer, audience, signature, expiry). Profiles use the verified subject. Orders are owner-scoped; guest orders are not auto-claimed by email.

## Payments and inventory

The client sends variant IDs and quantities only. NestJS reloads prices, atomically reserves stock, creates a `PENDING_PAYMENT` order, and opens Stripe-hosted Checkout with fixed origins. The signed raw-body webhook is payment authority. Success finalizes inventory exactly once; expired/failed sessions release reservations; duplicate IDs are idempotent. The success route clears the bag only after authoritative `PAID` status.

## Security

- exact CORS allowlist, Helmet/frontend headers, bounded bodies, DTO whitelisting;
- server-side JWT/SELLER authorization and owner-scoped data;
- server-only service-role/Stripe secrets;
- magic-byte upload checks, executable/SVG rejection, size/dimension limits, random paths, metadata-stripped WebP;
- global throttling with tighter checkout limits; signed Stripe retries excluded;
- RLS enabled and direct `anon`/`authenticated` privileges revoked by migration;
- production startup fails when Supabase/Stripe secrets are absent;
- webhook signatures/idempotency, DB prices, and atomic reservations protect payment and stock integrity.

Residual risk: provider webhook outages can delay release until Stripe retries; no separate scheduled reconciliation worker exists. Rate limits and Checkout expiry reduce reservation abuse but are not a full fraud platform. Dependency advisories need ongoing framework patch review.

## Data, verification, and deployment

Migrations are additive and preserve catalog/order data. They add profiles/roles, thrift metadata, authenticated order relation, payment timestamps/events, audit events, and RLS/grant hardening.

- Frontend: **62/62 tests**, typecheck and lint pass.
- Backend: **67/67 tests**, typecheck and lint pass.
- Frontend and backend production builds pass; Prisma schema validate/generate pass.
- Playwright Firefox: homepage has content, no Next error overlay, zero horizontal overflow at 390×844; password-update form renders and `/studio` redirects guests to sign-in. Console contained no errors (development warnings only).
- Secret scan found no committed live Stripe/service-role values.
- Production dependency audits report 3 high advisories in each tree. The offered fixes are breaking Next/Prisma changes, so no `--force` upgrade was applied; reassess patched compatible releases before launch.
- Production migrations were applied on 2026-08-20 through the authenticated Supabase management connection. Prisma checksums are recorded; catalog/order counts were preserved. RLS/direct-access hardening and the constrained `shopco-products` bucket are active.

Vercel production runs merge commit `10eda5f`. Render still serves old commit `086e17a` from `feat/commerce-backend-phase-3`; `/account/profile` and `/checkout/sessions` therefore return 404. Vercel Supabase public configuration is incomplete (`Authentication is not configured`). Render branch/env, Supabase Auth redirects, Stripe test secrets/webhook, intended SELLER identity, and credential-backed E2E remain external activation actions.

## Remaining limitations

Production credential-backed account/payment/Studio E2E remains blocked by the external configuration above. Public production responsive smoke passed. Transactional email, carrier tracking, wishlists, and advanced analytics remain future refinements—not claimed features.
