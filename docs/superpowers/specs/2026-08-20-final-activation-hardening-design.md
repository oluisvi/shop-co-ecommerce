# SHOP.CO Final Activation and Hardening Design

## Goal

Finish the existing single-seller commerce experience without replacing its architecture or visual direction. The work makes navigation reflect the live authentication system, promotes the existing owner profile through a trusted database operation, and proves that Studio, account, payment, and inventory boundaries remain server-authoritative.

## Scope and constraints

- Keep Supabase Auth as identity provider and Prisma `Profile` as the authorization authority.
- Keep `SellerGuard` as the server-side Studio boundary.
- Keep Stripe in test mode; signed webhooks remain payment authority.
- Keep the one-off inventory model and atomic conditional updates.
- Do not add marketplace, Stripe Connect, public role promotion, another profile table, or a new auth store.
- Do not expose or log private credentials.
- Preserve the editorial storefront and avoid new heavy dependencies.

## Design

### Auth-aware shell

`AuthContext` will synchronize the authenticated `/account` Profile in parallel with the Supabase session state and expose `profile`, `role`, `profileLoading`, and a refresh operation. Profile lookup failures do not turn an authenticated identity into a seller; the safe fallback is no privileged UI. Session changes clear stale profile state.

`SiteLayout` will derive account and Studio links from that single context. Guests reach `/auth/sign-in`; authenticated users reach `/account`; only a confirmed `SELLER` sees `/studio`. While profile state is unknown, Studio is not rendered. Desktop and mobile use semantic links with existing focus behavior.

### Account and Studio

The account page will use the existing `PATCH /account` contract for editable name and phone fields, retain order ownership rules, and expose Studio without removing normal account access for sellers. Loading, empty, authorization, expired-session, and API-error states remain explicit.

Studio keeps its existing API and visual structure. Fixes will be limited to demonstrated contract or UX defects, especially load failures, edit functionality, upload cleanup, safe inventory input, and legal fulfillment transitions. Seller authorization remains entirely enforced by the backend.

### Owner activation

A trusted SQL transaction will lock and verify exactly one Profile row for `spineratorgre31@gmail.com`, change only `role` to `SELLER`, and return the preserved UUID/email plus new role. A follow-up read verifies the result. Supabase Auth data is not modified.

### Commerce correctness

Focused tests will exercise a last-unit collision using the actual conditional-update behavior, duplicate webhook delivery, expiry/failure release, and invalid fulfillment transitions. Prices, totals, reservation, inventory, and payment state continue to come from the server/database. Production E2E uses safe test data and reports external limitations honestly.

## Verification

Run focused red/green tests for each behavior, then one final pass of frontend tests, typecheck, lint, build; backend tests, typecheck/build, lint, Prisma validate and generate. Validate desktop/mobile navigation and production endpoints in a browser where authenticated tooling permits. Push a focused branch and open a PR against `main` without merging it automatically.
