# SHOP.CO Final Activation and Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate the existing owner safely and finish auth-aware navigation, account/Studio behavior, and commerce correctness verification.

**Architecture:** Extend the existing AuthContext with the server-owned Profile rather than introducing another store. Preserve NestJS guards, Prisma transactions, Stripe webhook authority, and conditional inventory updates; add only regression-driven fixes.

**Tech Stack:** Next.js 15, React 19, TypeScript, NestJS 11, Prisma 7.9.1, PostgreSQL/Supabase, Stripe test mode.

**Spec:** `docs/superpowers/specs/2026-08-20-final-activation-hardening-design.md`

## Global Constraints

- Single seller only; no marketplace or Stripe Connect.
- Supabase Auth identity and Prisma Profile authorization stay authoritative.
- Never expose service-role, Stripe, or database credentials.
- Stripe remains in TEST MODE and signed webhooks control payment state.
- Preserve editorial design and avoid heavy dependencies.
- Work on `codex/final-activation-hardening`; open a PR without automatic merge.

---

### Task 1: Auth profile state and navigation

**Files:**
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/components/SiteLayout.tsx`
- Test: `src/lib/auth-contracts.test.ts`

**Interfaces:**
- Consumes: `getAccountProfile(accessToken)` and the existing Supabase session.
- Produces: `profile`, `role`, `profileLoading`, and `refreshProfile`; desktop/mobile account and Studio links.

- [ ] Add contract assertions that require guest sign-in, authenticated account, seller-only Studio, and removal of stale phase copy.
- [ ] Run `npm test -- src/lib/auth-contracts.test.ts` and confirm failure on the stale shell.
- [ ] Extend `AuthContext` with safe Profile synchronization and implement the semantic links in `SiteLayout`.
- [ ] Re-run the focused frontend test and confirm it passes.

### Task 2: Account editing and seller continuity

**Files:**
- Modify: `src/lib/api/account.ts`
- Modify: `src/pages/account/index.tsx`
- Test: `src/lib/auth-contracts.test.ts`

**Interfaces:**
- Consumes: authenticated access token and `PATCH /account`.
- Produces: `updateAccountProfile()` plus an accessible profile form and seller Studio entry.

- [ ] Add failing assertions for profile editing and seller access to both Account and Studio.
- [ ] Run the focused test and verify the missing behavior causes failure.
- [ ] Implement the minimal API helper and account form with loading/error/success feedback.
- [ ] Re-run the focused test and typecheck.

### Task 3: Studio workflow hardening

**Files:**
- Modify: `src/pages/studio/index.tsx`
- Modify: `src/lib/api/studio.ts`
- Modify only if demonstrated: `server/src/modules/studio/*`
- Test: `src/lib/studio-contracts.test.ts`
- Test: `server/src/modules/studio/*.spec.ts`

**Interfaces:**
- Consumes: current seller-only Studio endpoints.
- Produces: explicit loading/error/empty states, product editing, safe inventory updates, upload feedback, and legal fulfillment actions.

- [ ] Write focused failing contract/domain tests for each demonstrated gap.
- [ ] Run the exact focused test and confirm the expected failure.
- [ ] Implement only the minimal UI or service correction required by the test.
- [ ] Re-run focused frontend/backend Studio tests.

### Task 4: Payment and last-unit safety

**Files:**
- Modify only if demonstrated: `server/src/modules/payments/payments.service.ts`
- Test: `server/src/modules/payments/payments.service.spec.ts`
- Test: `server/src/modules/orders/inventory-reservation.spec.ts`

**Interfaces:**
- Consumes: Prisma conditional `updateMany`, Stripe event IDs and order/session IDs.
- Produces: proof that only one last-unit reservation succeeds and inventory finalization/release is exactly once.

- [ ] Add a failing concurrency-shaped test in which two attempts observe the same last unit but only one conditional update succeeds.
- [ ] Add/strengthen expiry, async failure, duplicate event, and mismatched-state assertions.
- [ ] Run focused backend tests and observe expected failures for any real gaps.
- [ ] Apply the smallest transactional fix if required and re-run focused tests.

### Task 5: Trusted production activation and E2E

**Files:**
- No source file unless a verified defect requires one.

**Interfaces:**
- Consumes: trusted Supabase SQL access, authenticated production browser sessions, Render/Vercel deployment data.
- Produces: exactly-one-row owner promotion and evidence for authorization, Studio, account, Stripe test checkout/webhook, and inventory behavior.

- [ ] Query the target Profile and verify exactly one row before mutation.
- [ ] Update only `role` to `SELLER` in a guarded transaction and verify UUID/email preservation.
- [ ] Verify guest and CUSTOMER rejection plus SELLER authorization where safe credentials/sessions exist.
- [ ] Exercise production flows with safe test data; clean up or archive temporary data.

### Task 6: Final gates and PR

**Files:**
- Update documentation only when evidence or remaining actions must be recorded.

**Interfaces:**
- Consumes: completed branch and all verification evidence.
- Produces: clean commits, pushed branch, and PR against `main`.

- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Run `npm --prefix server test`, `npm --prefix server run typecheck`, `npm --prefix server run lint`, `npm --prefix server run build`, `npx --prefix server prisma validate`, and `npx --prefix server prisma generate`.
- [ ] Review `git diff`, secret exposure, and requirement coverage.
- [ ] Commit meaningful changes, push `codex/final-activation-hardening`, and open a PR against `main`.
