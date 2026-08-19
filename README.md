# SHOP.CO

<p align="center">
  <strong>Portfolio-grade fashion commerce experience</strong><br />
  Editorial art direction, interactive 3D, functional local commerce flows and accessibility-first frontend engineering.
</p>

<p align="center">
  <a href="https://shop-co-store.vercel.app/">Live Demo</a>
  Â·
  <a href="./CHANGELOG.md">Changelog</a>
  Â·
  <a href="#roadmap">Roadmap</a>
</p>

[![SHOP.CO live homepage](https://image.thum.io/get/width/1200/crop/760/png/maxAge/24/wait/4/https://shop-co-store.vercel.app/)](https://shop-co-store.vercel.app/)

> The images in this README are live snapshots of the deployed project, so the gallery follows the current production interface instead of documenting an old mockup.

## Overview

SHOP.CO started as a static fashion storefront and evolved into an **Urban Fashion Journal + functional commerce frontend**.

The current version combines a monochrome editorial system with real client-side shopping interactions: local catalog search, filters, sorting, statically generated product pages, persistent cart state and a custom Three.js fashion hero.

The project is intentionally frontend-only at this stage. Backend APIs, real inventory, authentication, order creation and payment processing are reserved for the next commerce phase.

## Current status

| Area | Status |
| --- | --- |
| Visual system / responsive layout | âœ… Complete |
| Interactive 3D hero | âœ… Complete |
| Product catalog | âœ… Functional local dataset |
| Search / filters / sorting | âœ… Functional |
| Product detail routes | âœ… Functional |
| Persistent shopping bag | âœ… Functional |
| Newsletter UI | âœ… Functional demo validation |
| Accessibility / reduced motion | âœ… Implemented |
| Automated verification | âœ… 40 tests passing + typecheck + lint + production build |
| External catalog API | â³ Planned |
| Checkout / payments | â³ Planned |
| Backend / auth / inventory / orders | â³ Future phase |

## Experience highlights

### Fashion-specific 3D hero

The home hero uses a local GLB fashion figure rendered with Three.js instead of the original abstract experiment.

- local model: `public/models/fashion_figure_base.glb`
- `GLTFLoader` with automatic bounding-box normalization
- pointer / touch drag for 360Â° interaction
- subtle autonomous motion and inertia
- responsive camera / DPR tuning for smaller screens
- `IntersectionObserver` pause when off-screen
- document visibility pause
- `ResizeObserver`-driven resizing
- geometry, texture, material and renderer cleanup
- `prefers-reduced-motion` fallback
- static fashion artwork remains available until the model has loaded

### Functional local commerce

The interface is no longer a collection of static cards.

- 12 normalized products with stable slugs
- `/products/[slug]` statically generated product routes
- real search from the header
- category and maximum-price filters
- deterministic sorting
- URL-synchronized catalog state
- versioned cart persistence with `localStorage`
- quantity bounds from 1â€“9
- add, update, remove, count and subtotal behavior
- accessible cart drawer with Escape, backdrop close, focus containment and focus restoration

The catalog remains intentionally local so the portfolio build stays deterministic. A larger external catalog/API layer is part of the roadmap.

## Screens

### Catalog

[![SHOP.CO catalog](https://image.thum.io/get/width/1200/crop/760/png/maxAge/24/wait/4/https://shop-co-store.vercel.app/categories)](https://shop-co-store.vercel.app/categories)

### Product detail

[![SHOP.CO product page](https://image.thum.io/get/width/1200/crop/760/png/maxAge/24/wait/4/https://shop-co-store.vercel.app/products/one-life)](https://shop-co-store.vercel.app/products/one-life)

## Design direction

The visual system is built around a fashion-editorial language rather than a generic dashboard or template aesthetic.

- monochrome foundation with product photography carrying most of the color
- Integral CF display typography + Satoshi interface/body typography
- editorial serif accents for selected headings
- large type, rules, whitespace and asymmetric composition
- subtle tactile microinteractions instead of heavy animation everywhere
- Uiverse-inspired control feedback
- local React Bits-inspired primitives such as `Reveal`, `MagneticLink` and `LogoLoop`
- Motion Sites-inspired pacing and art direction
- responsive layouts designed from small mobile screens through wide desktop

The newsletter and footer were also rebuilt as editorial surfaces, with stronger typography, responsive form geometry and magnetic navigation interactions.

## Tech stack

- **Next.js 15.5** â€” Pages Router, static generation and optimized routing
- **React 19**
- **TypeScript 5**
- **Three.js 0.185**
- **CSS architecture** â€” `globals.css`, `fixes.css`, `experience.css`, `phase2.css`, `polish.css`
- **next/image**
- **next/font/local**
- **React Context** for the commerce state
- **Node test runner** for domain and source-contract tests
- **ESLint** + TypeScript validation
- **Vercel** deployment

No Redux, GSAP, Framer Motion, Lenis or route-wide WebGL runtime is required by the current experience.

## Architecture

```text
src/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ commerce + navigation
â”‚   â”œâ”€â”€ editorial UI primitives
â”‚   â”œâ”€â”€ HeroExperience.tsx
â”‚   â”œâ”€â”€ HeroScene.tsx
â”‚   â”œâ”€â”€ Newsletter.tsx
â”‚   â””â”€â”€ Footer.tsx
â”œâ”€â”€ data/
â”‚   â”œâ”€â”€ catalog.ts
â”‚   â””â”€â”€ reviews.ts
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ catalog helpers
â”‚   â”œâ”€â”€ cart domain + persistence
â”‚   â”œâ”€â”€ validation
â”‚   â””â”€â”€ regression / accessibility contracts
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ index.tsx
â”‚   â”œâ”€â”€ categories.tsx
â”‚   â””â”€â”€ products/[slug].tsx
â”œâ”€â”€ styles/
â””â”€â”€ types/

public/
â”œâ”€â”€ assets/
â””â”€â”€ models/
    â””â”€â”€ fashion_figure_base.glb
```

### Commerce state

```text
CommerceProvider
â””â”€â”€ localStorage: shopco-cart-v2
    â””â”€â”€ CartLine { productId, quantity }
```

Cart calculations and persistence parsing are kept in pure helpers so the domain can later be moved behind a real commerce API without rewriting every UI component.

## Accessibility and performance

Accessibility is treated as part of the UI architecture rather than a final visual patch.

- semantic landmarks and route-level headings
- visible focus states and skip navigation
- descriptive product images
- labeled search, newsletter and catalog controls
- focus containment / Escape / restoration for modal drawers
- live cart announcements for assistive technology
- body scroll locking while drawers are active
- `prefers-reduced-motion` support for CSS and WebGL behavior

Performance work includes lazy client-only Three.js loading, capped pixel ratio, paused rendering when the hero is not useful, static route generation, local assets and cleanup of GPU resources.

## Verification

The current frontend milestone was closed with all quality gates green:

```bash
npm test
# 40 tests Â· 40 pass Â· 0 fail

npm run typecheck
npm run lint
npm run build
```

The production build statically generates the homepage, catalog and all product detail paths.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Before shipping changes:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Project evolution

### Phase 1 â€” Visual revitalization

Rebuilt the original storefront into a stronger fashion/editorial experience with a responsive design system, accessibility improvements, typography, motion direction and the initial Three.js enhancement.

### Phase 2 â€” Functional fashion frontend

Converted the static storefront into a working local commerce experience and completed the current portfolio presentation.

Major additions include:

- deep product routes
- normalized catalog domain
- real search / filters / sort
- persistent cart
- accessible cart drawer
- 3D GLB fashion figure
- mobile WebGL support when motion is allowed
- reviews carousel
- final newsletter / footer polish
- improved typography and responsive QA

See [`CHANGELOG.md`](./CHANGELOG.md) for the condensed release history.

## Roadmap

The next milestone focuses on the two deliberately deferred, heavier commerce areas.

### Phase 3A â€” Catalog expansion / API

- evaluate a stable fashion-product data source
- normalize external products into the existing `Product` contract
- expand images, categories and product variety
- preserve portfolio stability instead of coupling the UI directly to an unreliable remote API

### Phase 3B â€” Checkout

- complete checkout flow
- contact and shipping information
- delivery selection
- order summary
- validation and error states
- payment integration, likely starting with a test-mode provider

### Later

- backend/API
- database
- authentication
- real inventory
- orders
- server-backed newsletter
- transactional email
- admin tooling

## Credits

- Design and development: **Luis Henrique Vieira Barros**
- 3D fashion figure: **Tiko â€” CC BY 4.0**
- Product imagery and fashion assets are used as part of this portfolio demonstration storefront.

---

<p align="center">
  <strong>SHOP.CO</strong><br />
  Built as a fashion interface, engineered as a frontend system.
</p>

