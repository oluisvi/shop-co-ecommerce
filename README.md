# SHOP.CO

SHOP.CO is a static fashion storefront rebuilt as an **Urban Fashion Journal**: a bold monochrome editorial experience focused on products, responsive composition, accessibility, and restrained motion.

## Phase 1 — Visual revitalization

This release modernizes the existing interface without adding commerce infrastructure. It includes the three original routes:

- `/` — editorial home, brands, product edits, dress styles, and reviews
- `/categories` — casual catalog with demonstrative filters and pagination
- `/products` — One Life Graphic T-shirt preview with a gallery and local option states

Every product currently links to the same demonstration product page. Search, filters, sorting, pagination, cart, newsletter delivery, and account controls are explicitly presented as previews or unavailable features.

## Stack

- Next.js 15 Pages Router
- React 19 and TypeScript
- Global CSS with design and motion tokens
- `next/image` and `next/font/local`
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
npm run test       # static data and validation tests
npm run typecheck  # TypeScript without output
npm run lint       # ESLint
npm run build      # optimized production build
npm run start      # serve the production build
```

## Structure

```text
src/
  components/  shared shell, cards, ratings, metadata, and forms
  data/        typed static products and reviews
  lib/         framework-independent validation
  pages/       Pages Router route compositions
  styles/      visual system and local fonts
  types/       store content contracts
```

## Design and motion

The interface uses Integral CF for oversized editorial display type and Satoshi for body and utility text. Its palette stays black, white, and neutral. Strong rules, asymmetric grids, product photography, and compact issue labels provide the journal character.

Motion is CSS-only. Hero content enters with a short coordinated fade/translation, product imagery receives contained hover feedback, and panels use quick transforms. `prefers-reduced-motion` reduces transitions and reveals all content immediately.

## Accessibility

- Semantic landmarks and one `h1` per route
- Skip link, breadcrumbs, visible focus, and keyboard navigation
- Mobile menu closes with Escape, locks scroll, traps focus, and restores focus
- Labeled forms and controls with local `aria-live` feedback
- Descriptive product imagery and hidden decorative graphics
- Honest disabled or explanatory Phase 1 controls

## Performance

- Only the route LCP image receives priority
- Responsive `sizes` and stable aspect-ratio containers for product imagery
- WOFF2 variable Satoshi font and locally hosted display font through `next/font/local`
- No animation, UI, state-management, or API client library
- Static prerendering for all public routes

## Roadmap

1. **Phase 1 — Visual revitalization:** design system, responsive layouts, accessibility, SEO, motion, and performance.
2. **Phase 2 — Functional frontend:** local catalog behavior, search, filters, and cart.
3. **Phase 3 — Real e-commerce:** backend, authentication, inventory, orders, and checkout.

Backend, database, Prisma, authentication, real inventory, payments, checkout, persisted cart, and external newsletter delivery are intentionally outside Phase 1.
