# SHOP.CO

SHOP.CO is a portfolio fashion storefront built as an **Urban Fashion Journal + functional local commerce experience**. Phase 2 keeps the bold monochrome editorial identity from the visual revitalization while turning the catalog, search, product routes and shopping bag into real client-side interactions.

## Phase 2 — Functional fashion frontend

The storefront now includes:

- `/` — editorial home with a fashion-specific Three.js hero, moving brand rail, product edits, dress styles and reviews
- `/categories` — real local search, category filtering, maximum-price filtering, deterministic sorting and URL-synchronized state
- `/products/[slug]` — a statically generated deep link for every product in the local catalog
- `/products` — legacy redirect to `/products/one-life`
- persistent shopping bag via versioned `localStorage`
- quantity updates, removal, subtotal calculation and live cart count
- accessible cart drawer with focus containment, Escape close, backdrop close and focus restoration
- real header search with quick results and catalog handoff
- progressive motion with `prefers-reduced-motion` support

The application is still intentionally frontend-only. It does not process payments, authenticate users, create orders, check server inventory or send newsletter data.

## Stack

- Next.js 15 Pages Router
- React 19 + TypeScript
- Global CSS layers (`globals.css`, `fixes.css`, `experience.css`, `phase2.css`)
- `next/image` and `next/font/local`
- Three.js, dynamically loaded only for the eligible home hero
- React Context + reducer-style pure cart helpers
- Node's built-in test runner

No new animation framework was added in Phase 2.

## Reference strategy

Phase 2 uses the requested design sources as a coherent reference layer rather than pasting unrelated components together:

### Uiverse

Used as inspiration for tactile micro-interactions:

- sliding-fill dark CTA feedback
- compact add-to-bag button states
- search/input focus treatment
- newsletter field focus/press treatment
- precise icon-button hover states

The implementations are authored in the SHOP.CO design system and do not depend on copied third-party runtime code.

### React Bits

Used as inspiration for reusable creative motion patterns:

- `Reveal` — an IntersectionObserver-based AnimatedContent/FadeContent-style primitive
- `MagneticLink` — a restrained Magnet-style hero CTA interaction
- `LogoLoop` — a CSS-driven Logo Loop-style brand rail
- selective editorial hover motion rather than universal card tilt

The project uses local TS/CSS implementations so the existing bundle remains controlled.

### Motion Sites

Used as art-direction reference for:

- cinematic pacing between sections
- fashion-first spatial hero composition
- image-led motion
- editorial whitespace and asymmetry
- motion that reveals hierarchy instead of hijacking scroll

No Motion Sites template, premium code or external asset is copied into the project.

## Fashion-specific 3D hero

The original abstract TorusKnot proof has been replaced with a **Digital Fashion Rack / Floating Garment Edit**.

The WebGL scene uses real local SHOP.CO product imagery as textures on lightweight garment cards suspended from a minimal metallic rack. Motion is intentionally restrained:

- gentle garment sway
- small pointer-driven camera/rack parallax
- no game controls
- no route-wide WebGL
- no external GLTF
- no post-processing stack

The safety model remains:

- client-only dynamic import
- WebGL disabled below 768px
- WebGL disabled for `prefers-reduced-motion`
- static CSS/image rack fallback
- capped DPR
- `ResizeObserver`
- `IntersectionObserver` pause
- hidden-tab pause
- full texture/geometry/material/renderer disposal

## Catalog data integrity

The static catalog is still the source of truth.

Phase 2 adds only metadata that is grounded in the existing product names, original collection groupings and the already-existing One Life product options:

- stable slugs
- product categories
- collection labels
- product-specific deep links
- existing One Life gallery, colors, sizes and description

Filters are limited to facets the local catalog actually supports. There are no fake product counts, stock claims, pagination pages or remote results.

## Local commerce state

Cart state is intentionally small and dependency-free:

```text
CommerceProvider
  └─ localStorage: shopco-cart-v2
       └─ CartLine { productId, quantity }
```

Pure helpers own:

- add
- update quantity
- remove
- item count
- subtotal
- serialization/parsing
- quantity bounds (1–9)

The first client render starts with an empty cart and hydrates stored state in an effect, avoiding SSR access to browser globals.

## Search, filters and sorting

Header search works immediately against local data and can:

- show up to five quick product results
- deep-link directly to products
- send the query to `/categories?q=...`

Catalog state is synchronized to URL query parameters:

```text
q
category
max
sort
```

That means reload, back/forward navigation and shareable catalog states remain useful without a backend.

## Accessibility

- semantic landmarks and one route-level `h1`
- skip link and visible focus
- accessible product links and image alternatives
- mobile navigation focus trap / Escape / restoration
- catalog filter drawer focus trap / Escape / restoration
- cart drawer dialog semantics / focus trap / Escape / restoration
- body scroll locking for modal drawers
- `aria-live` cart announcements
- labeled search and filter controls
- disabled demo checkout that does not pretend to process money
- reduced-motion fallback that prevents WebGL mounting

## Performance

Phase 2 intentionally avoids a new general-purpose motion runtime.

Key constraints:

- Three.js stays dynamic and hero-only
- search/filter/cart logic is local and small
- no Redux
- no GSAP
- no Framer Motion / Motion
- no Lenis
- no external 3D model
- no autoplay media
- no fake loading delays
- CSS transform/opacity for most visual motion
- versioned/minimal localStorage payload

Compare route output after applying the phase with the Phase 1 baseline:

```text
Phase 1 baseline
/            ~110 kB First Load JS
/categories  ~108 kB
/products    ~108 kB
```

The Phase 2 applicator runs a fresh production build so the final local numbers can be reviewed before commit.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Required verification

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Then smoke-test:

- `/`
- `/categories`
- `/products/one-life`
- another `/products/[slug]`
- search
- filters
- sort
- add to bag
- quantity
- remove
- refresh persistence
- mobile navigation
- filter drawer
- cart drawer
- reduced-motion fallback

## Roadmap

1. **Phase 1 — Visual revitalization:** responsive design system, accessibility, SEO, motion and quality hardening.
2. **Phase 2 — Functional fashion frontend:** search, filters, sort, deep product routes, persistent local cart and fashion-specific motion.
3. **Phase 3 — Real e-commerce backend:** authentication, database, inventory, orders, checkout, payment integration and server-backed commerce.

## Phase 3 boundary

Still intentionally deferred:

- backend/API
- database
- authentication/accounts
- inventory
- orders
- payment processing
- Stripe or another payment provider
- shipping calculations
- transactional email
- admin tooling
- server-backed wishlist
