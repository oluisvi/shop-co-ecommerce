# SHOP.CO Visual Revitalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revitalize all three SHOP.CO routes as an accessible, responsive, performant Urban Fashion Journal while preserving the static Phase 1 scope.

**Architecture:** Preserve Next.js Pages Router, centralize static typed content, and compose route-specific views from shared accessible components. Use local state only for demonstrative interactions and CSS tokens for layout and motion.

**Tech Stack:** Next.js 15 Pages Router, React 19, TypeScript 5, CSS, `next/image`, `next/font/local`, Vitest and Testing Library.

## Global Constraints

- Do not implement backend, persistence, authentication, real cart, inventory, checkout, or external integrations.
- Preserve current products, imagery, routes, and monochrome identity.
- Support 320, 375, 390, 430, 768, 1024, 1280, 1366, 1440px and larger widths.
- Respect `prefers-reduced-motion`; animate primarily `transform` and `opacity`.
- Keep Pages Router and add no motion or component library.

---

### Task 1: Tooling, data, and test foundation

**Files:** Modify `package.json`, `package-lock.json`; create `src/types/store.ts`, `src/data/catalog.ts`, `src/data/reviews.ts`, `src/lib/validation.ts`, and unit tests.

- [ ] Add `test`, `typecheck`, and compatible ESLint scripts with a lightweight Vitest/jsdom setup.
- [ ] Write failing tests for newsletter validation and catalog invariants; run them to confirm RED.
- [ ] Add typed product/review data and the validation helper; run tests to confirm GREEN.
- [ ] Remove dependencies only after repository-wide usage checks.

### Task 2: Shared shell and accessible interactions

**Files:** Create shared layout, promotion, header, mobile navigation, newsletter, footer, metadata, breadcrumb, rating, and product-card components with component tests.

- [ ] Write failing interaction tests for promotion dismissal, mobile menu Escape/focus restoration, and newsletter feedback.
- [ ] Implement native semantic controls and local state to make the tests pass.
- [ ] Replace hash links and unavailable destinations with honest text or real internal links.

### Task 3: Home editorial composition

**Files:** Rewrite `src/pages/index.tsx`; create focused home section components.

- [ ] Add a route structure test that requires exactly one `h1`, a real hero CTA target, and section headings.
- [ ] Implement the cover-style hero, brand strip, shared product sections, dress-style grid, and review grid.
- [ ] Use `next/image` with only the hero marked priority.

### Task 4: Category experience

**Files:** Rewrite `src/pages/categories/index.tsx`; create category filter and catalog components.

- [ ] Add failing tests for mobile filter open/close and demonstrative feedback.
- [ ] Implement desktop sidebar, accessible mobile drawer, honest sort/pagination states, and shared product grid.

### Task 5: Product experience

**Files:** Rewrite `src/pages/products/index.tsx`; create gallery, option selectors, quantity, notice, tabs, and review components.

- [ ] Add failing tests for gallery selection, color/size state, quantity bounds, and add-to-cart notice.
- [ ] Implement local interactions and correct breadcrumb `/` target.
- [ ] Reuse reviews and recommendations without fake controls.

### Task 6: Urban Fashion Journal CSS and assets

**Files:** Replace `src/styles/globals.css`; update font configuration; remove confirmed duplicate/unused files.

- [ ] Define color, type, spacing, container, radius, motion, focus, and z-index tokens.
- [ ] Implement fluid grids and all required responsive states without large transform offsets.
- [ ] Implement coordinated hero and micro-interaction motion plus a comprehensive reduced-motion override.
- [ ] Verify asset references before removing empty/default/duplicate files.

### Task 7: SEO, documentation, and verification

**Files:** Update `_app.tsx`, `_document.tsx`, route metadata, `README.md`; remove default API and empty component.

- [ ] Add route-specific title, description, canonical, viewport, and Open Graph metadata.
- [ ] Document architecture, scripts, accessibility, motion, performance choices, Phase 1 limitations, and roadmap.
- [ ] Run fresh `npm ci`, tests, typecheck, lint, and production build.
- [ ] Run browser smoke tests at required widths and interactions; inspect console, overflow, and reduced motion.
- [ ] Review final diff, commit, push `feat/visual-revitalization`, and open a PR to `main` without merging.
