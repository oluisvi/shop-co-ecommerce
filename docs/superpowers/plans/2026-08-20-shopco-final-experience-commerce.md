# SHOP.CO Final Experience + Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an operable, secure single-seller digital thrift store with accounts, Seller Studio, Stripe Checkout, reserved inventory, and an adaptive editorial storefront.

**Architecture:** Preserve Next.js Pages Router + NestJS REST + Prisma/PostgreSQL. Add Supabase Auth/Storage at explicit boundaries and make signed Stripe webhooks the payment authority.

**Tech Stack:** Next.js 15, React 19, Three.js, NestJS 11, Prisma 7, PostgreSQL/Supabase, jose, Stripe Checkout.

**Spec:** `docs/superpowers/specs/2026-08-20-shopco-final-experience-commerce-design.md`

## Global Constraints

- Preserve current product IDs/slugs, Phase 3 orders, guest cart migration, URLs, and visual identity.
- Never expose Stripe or Supabase privileged secrets to the browser.
- Use test-first red/green cycles for behavior changes and versioned non-destructive migrations.
- Payment success is webhook-authoritative; server prices and inventory are authoritative.

---

### Task 1: Schema and domain foundation

**Files:** Modify `server/prisma/schema.prisma`; create a versioned migration; test domain helpers under `server/src/modules`.

**Interfaces:** Produces Profile/Role, thrift fields, authenticated Order relation, payment identifiers/expiry, PaymentEvent, and AuditEvent.

- [ ] Write failing schema/domain contract tests for nullable compatibility, one-off defaults, legal status transitions, and reservation arithmetic.
- [ ] Run the focused tests and confirm failures are caused by missing domain behavior.
- [ ] Add the conservative Prisma models/enums/check constraints and pure domain helpers.
- [ ] Generate Prisma and run focused + existing tests.
- [ ] Commit the schema/domain checkpoint.

### Task 2: Supabase authentication and authorization

**Files:** Create backend auth module/guards/decorators and frontend Supabase/AuthContext/auth pages; modify app/layout navigation and env validation.

**Interfaces:** Produces verified `RequestUser { id, email }`, `RequireSeller` guard, authenticated API client, persistent auth UI, and profile/order endpoints.

- [ ] Write failing tests for valid/invalid/expired JWT, missing token, seller role, customer denial, own order, and IDOR denial.
- [ ] Verify focused failures.
- [ ] Implement JWKS verification with issuer/audience checks, profile lookup, owner-scoped queries, and frontend sign-up/sign-in/sign-out/reset flows.
- [ ] Run auth tests and existing suites; refactor only while green.
- [ ] Commit the auth/account checkpoint.

### Task 3: Seller Studio and safe catalog operations

**Files:** Create backend studio/products/uploads modules and DTOs; add `/studio` pages/components/styles; modify product presenter/types.

**Interfaces:** Produces dashboard metrics, product create/update/archive, inventory adjustment, fulfillment transitions, and validated image upload.

- [ ] Write failing tests for one-off quantity one, invalid price/stock, archive preservation, upload authorization/type/size, and fulfillment transitions.
- [ ] Verify focused failures.
- [ ] Implement SELLER-protected endpoints and a fast editorial Studio UI without WebGL.
- [ ] Run focused and regression suites.
- [ ] Commit the studio checkpoint.

### Task 4: Stripe Checkout and inventory reservations

**Files:** Create payments module, Stripe gateway, webhook controller/service and DTOs; modify order service/controller, main bootstrap, schema migration, checkout API/UI, success/cancel pages.

**Interfaces:** Produces `POST /checkout/sessions`, `POST /webhooks/stripe`, authoritative order status lookup, atomic reserve/finalize/release operations.

- [ ] Write failing tests for server-derived amounts, insufficient stock, last-unit race, session failure rollback, invalid/missing signature, duplicate completion, expiration, and exact-once finalization.
- [ ] Verify focused failures.
- [ ] Implement Stripe-hosted Checkout using fixed origins, raw-body signature verification, unique event IDs, and `reservedQuantity` transactions.
- [ ] Run focused and full backend/frontend suites.
- [ ] Commit the payment checkpoint.

### Task 5: Archive experience, adaptive rendering, SEO and accessibility

**Files:** Modify hero/card/catalog/detail/layout/head/styles/types and add capability helper tests.

**Interfaces:** Produces capability tier A/B/C, truthful one-of-one/sold states, archive browsing, Product structured data, and accessible commerce/auth/studio states.

- [ ] Write failing source/domain tests for tier selection, sold CTA removal, structured availability, and required accessible labels/status regions.
- [ ] Verify focused failures.
- [ ] Implement CSS-first archive motion, capability-aware Three.js DPR/autoplay, product inspection metadata, responsive operational layouts, and headers/metadata.
- [ ] Run tests/typecheck/lint/build and perform responsive visual QA.
- [ ] Commit the experience checkpoint.

### Task 6: Security hardening, documentation and release

**Files:** Modify env examples, CORS/bootstrap, headers, README, CHANGELOG; add threat model/final report and deployment checklist.

**Interfaces:** Produces explicit origin allowlist, throttled sensitive routes, body limits, RLS/grant SQL guidance, accurate deployment handoff, and evidence-based report.

- [ ] Add failing security contract tests for CORS, headers, env validation, secrets, and protected endpoints.
- [ ] Implement the controls and rerun tests.
- [ ] Run frontend/backend test, typecheck, lint, build, Prisma validate/generate, dependency audit, and secret scan.
- [ ] Verify production pages and API where external access permits; record credentials-only blockers honestly.
- [ ] Update README/CHANGELOG/report with actual counts, commit, push, and open a PR if GitHub auth permits.
