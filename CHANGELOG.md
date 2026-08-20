# Changelog

All notable portfolio milestones for SHOP.CO are summarized here.

## 2026-08-20 — Final evolution foundation

### Added
- globally installable Supabase Auth session UI and account entry route
- JWKS-based Supabase JWT verifier with issuer/audience validation
- additive Prisma models for profiles, roles, thrift metadata, payment events and seller audit events
- Stripe Checkout parameter and payment-transition domains
- exact inventory reservation/finalization/release helpers
- adaptive A/B/C hero capability selection
- security headers and exact multi-origin CORS parsing

### Quality
- 55 frontend tests passing
- 42 backend tests passing
- frontend/backend typecheck, lint and production builds passing
- Prisma schema validation and client generation passing

### Honest deployment status
- no production migration, Stripe endpoint/webhook, protected account API, Seller Studio, or storage upload was deployed in this checkpoint
- production rollout still requires Supabase/Stripe credentials and completion of those integrations

## Current — Functional Fashion Frontend

### Added
- interactive Three.js fashion hero using `fashion_figure_base.glb`
- pointer and touch drag with inertia and responsive camera behavior
- local commerce context with versioned `localStorage` persistence
- 12 normalized product records with stable slugs
- statically generated `/products/[slug]` routes
- functional header search
- catalog category and price filtering
- deterministic sorting
- URL-synchronized catalog state
- accessible shopping bag drawer
- quantity controls, removal, cart count and subtotal
- animated review carousel
- editorial newsletter treatment
- redesigned editorial footer with magnetic navigation
- local motion primitives inspired by React Bits patterns

### Changed
- hero moved from the earlier abstract / garment-rack experiment to a local GLB fashion figure
- WebGL is now allowed on mobile when reduced motion is not requested
- static hero artwork is used as loading / reduced-motion fallback
- home product sections were rebalanced for cleaner card alignment
- typography was strengthened for readability and contrast
- newsletter layout was rebuilt to prevent input overflow on small screens
- footer hierarchy and spacing were fully redesigned
- README now reflects the real current architecture and roadmap

### Quality
- 40 automated tests passing
- TypeScript typecheck passing
- ESLint passing
- Next.js production build passing
- static generation for homepage, catalog and product detail pages
- reduced-motion behavior
- focus containment / Escape / restoration for drawers
- Three.js lifecycle cleanup and off-screen / hidden-tab pause

## Phase 1 — Visual Revitalization

### Added
- fashion-editorial visual direction
- responsive design system
- Integral CF + Satoshi typography system
- wide desktop composition
- initial Three.js progressive enhancement
- accessibility and responsive hardening
- motion and microinteraction foundation
- catalog responsive geometry
- design / implementation documentation

## Original Baseline

SHOP.CO began as a largely static fashion storefront implementation. Search, filters, individual product routing, persistent cart behavior and the final editorial interaction layer were not yet functional.

## Next

### Catalog expansion / API
The existing `Product` model becomes the normalization boundary for a larger product source while keeping the portfolio build stable.

### Checkout
Build the complete checkout experience and then connect payment processing in test mode before any production-commerce backend work.

### Future commerce infrastructure
- backend/API
- database
- authentication
- inventory
- orders
- payments
- transactional email
- admin tooling
