# SHOP.CO

SHOP.CO is a static fashion storefront rebuilt as an **Urban Fashion Journal**: a bold monochrome editorial experience focused on products, responsive composition, accessibility, restrained motion, and one intentionally scoped 3D hero enhancement.

## Phase 1 — Visual revitalization

This release modernizes the existing interface without adding commerce infrastructure. It includes the three original routes:

- `/` — editorial home, brands, product edits, dress styles, reviews, and the rebranded interactive hero
- `/categories` — casual catalog with demonstrative filters and an honest single-page preview
- `/products` — One Life Graphic T-shirt preview with a gallery and local option states

Every product currently links to the same demonstration product page. Search, filters, sorting, cart, newsletter delivery, and account controls are explicitly presented as previews or unavailable features.

## Stack

- Next.js 15 Pages Router
- React 19 and TypeScript
- Global CSS with design and motion tokens
- `next/image` and `next/font/local`
- Three.js, isolated to the home hero enhancement
- Node's built-in test runner

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev        # development server
npm run test       # data, validation, and regression-contract tests
npm run typecheck  # TypeScript without output
npm run lint       # ESLint
npm run build      # optimized production build
npm run start      # serve the production build
```

## Structure

```text
src/
  components/  shared shell, cards, ratings, metadata, forms, and hero experience
  data/        typed static products and reviews
  lib/         validation, interaction helpers, and regression contracts
  pages/       Pages Router route compositions
  styles/      visual system, responsive experience layer, and local fonts
  types/       store content contracts
```

## Design and motion

The interface uses Integral CF for oversized editorial display type and Satoshi for body and utility text. Its palette stays black, white, and neutral. Strong rules, asymmetric grids, product photography, and compact issue labels provide the journal character.

Motion remains CSS-first. The home hero replaces the fragile model background and decorative star treatment with a static monochrome editorial sculpture that is always available. On screens at least 768px wide, and only when reduced motion is not requested, that sculpture is progressively enhanced by a dynamically loaded Three.js scene. Product imagery, buttons, drawers, and cards keep restrained transform/opacity feedback.

The 3D scene is intentionally limited to one surface. It uses no external model, texture, post-processing stack, React Three Fiber, Drei, video, or route-wide animation runtime.

## Responsive layout

The visual system is verified around these intended layout ranges:

- 320–767px: single-column hero with static artwork; mobile navigation and filter drawers
- 768–899px: two-column catalog; tablet filter drawer
- 900–1099px: three-column catalog where space permits; tablet filter drawer
- 1100px+: persistent catalog sidebar with three-column products
- 1280px+ and large desktop: capped editorial content width

The home dress-style section uses an explicit 12-column desktop mosaic, a balanced two-column tablet composition, and one column on mobile.

## Accessibility

- Semantic landmarks and one `h1` per route
- Skip link, breadcrumbs, visible focus, and keyboard navigation
- Mobile navigation closes with Escape, locks scroll, traps focus, and restores focus
- Catalog filters become a dialog drawer on tablet/mobile, trap focus, close with Escape/backdrop/button, and restore focus
- Labeled forms and controls with local `aria-live` feedback
- Descriptive product imagery and hidden decorative graphics
- Honest disabled or explanatory Phase 1 controls
- Dismissed promotion content is removed from the accessibility tree and tab order
- `prefers-reduced-motion` prevents the WebGL enhancement from mounting and reduces CSS motion

## Performance

- The former `main-couple.png` hero is no longer rendered, removing the fragile hero-image dependency from the first viewport
- Three.js is dynamically imported only after hydration and only on eligible wider screens
- Mobile and reduced-motion users receive the complete static hero without loading or running the 3D scene
- Renderer pixel ratio is capped, resize work is observer-driven, and the animation loop pauses when the hero is off-screen or the document is hidden
- Geometries, materials, observers, listeners, and the renderer are disposed during cleanup
- Responsive `sizes` and stable aspect-ratio containers remain in use for product/category imagery
- Satoshi loads from its local WOFF2 file through `next/font/local`
- Duplicate public font copies and unused Satoshi EOT/TTF/WOFF formats remain removed
- Static prerendering remains the target for all public routes

## Data integrity

- Catalog counts and pagination copy describe only the products that actually exist in the static preview
- Discount badges match the current and previous prices
- Rating stars visually represent whole and half-star values
- Quantity controls are bounded from 1 to 9 and disable at both limits

## Roadmap

1. **Phase 1 — Visual revitalization:** design system, responsive layouts, accessibility, SEO, motion, performance, and quality hardening.
2. **Phase 2 — Functional frontend:** local catalog behavior, search, filters, and cart.
3. **Phase 3 — Real e-commerce:** backend, authentication, inventory, orders, and checkout.

Backend, database, Prisma, authentication, real inventory, payments, checkout, persisted cart, and external newsletter delivery are intentionally outside Phase 1.
