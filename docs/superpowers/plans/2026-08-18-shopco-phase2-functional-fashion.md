# SHOP.CO Phase 2 Functional Fashion Implementation Plan

> **For agentic workers:** Execute against the approved 35-phase Prompt Master. This file records the concrete implementation units used for the delivery.

**Goal:** Build the functional local fashion-commerce frontend while upgrading the motion/hero system.

**Architecture:** Keep the Pages Router and static catalog. Add pure catalog/cart domains, one small Commerce context, static product detail routes, URL-driven catalog state, accessible search/cart presentation and a hero-only Three.js fashion scene.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Three.js, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-18-shopco-phase2-functional-fashion-design.md`

## Global constraints

- no backend, auth, payments, orders or inventory
- no fake remote behavior
- no large animation runtime
- Three.js stays hero-only and lazy
- reduced-motion blocks continuous/WebGL motion
- no automatic merge to main
- `npm test`, typecheck, lint and build must pass before commit

---

### Task 1 — Normalize catalog and test pure catalog behavior
Create stable slugs/categories/collections and pure lookup/search/filter/sort helpers.

### Task 2 — Implement pure cart domain and versioned persistence
Create add/update/remove/count/subtotal/parse/serialize helpers with 1–9 quantity bounds.

### Task 3 — Add CommerceProvider
Hydrate localStorage after mount, persist minimal lines, expose cart commands and live announcement state.

### Task 4 — Convert product navigation to deep links
Add `/products/[slug]` static routes and preserve `/products` as a legacy redirect.

### Task 5 — Make search/filter/sort functional
Connect header search to local results and `/categories` query state.

### Task 6 — Build accessible cart drawer
Add focus trap, Escape, backdrop close, focus restoration, quantity controls, remove and subtotal.

### Task 7 — Replace abstract hero
Use local fashion textures on a lightweight digital garment rack and keep the existing lifecycle safety model.

### Task 8 — Integrate motion references
Add local Reveal, MagneticLink and LogoLoop primitives plus Uiverse-inspired micro states.

### Task 9 — Responsive/accessibility/performance pass
Verify mobile/tablet/desktop layouts, reduced motion and no fake commerce controls.

### Task 10 — Final gates and handoff
Run tests, typecheck, lint and build; smoke-test critical flows; review git status/diff; update README.
