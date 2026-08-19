# SHOP.CO Phase 2 — Functional Fashion Design

## Goal

Transform the Phase 1 editorial storefront into a memorable fashion-first portfolio experience with real local commerce behavior while keeping backend/payment/auth concerns explicitly deferred.

## Design direction

- monochrome editorial foundation
- product imagery supplies color
- wide asymmetrical composition
- restrained tactile micro-interactions
- fashion-specific digital rack in the hero
- no generic AI gradients, page-wide WebGL or scroll hijacking

## Reference matrix

| Source | SHOP.CO use | Implementation | Risk control |
|---|---|---|---|
| Uiverse | CTA, add-to-bag, input focus, newsletter micro-feedback | authored CSS | no copied runtime dependency |
| React Bits | reveal, magnetic CTA, logo loop | small local React/CSS primitives | no general animation package |
| Motion Sites | pacing, spatial fashion composition, editorial image motion | art-direction principles | no cloned template/assets |

## Functional architecture

- static catalog remains source of truth
- `src/lib/catalog.ts` owns pure search/filter/sort/lookup functions
- `src/lib/cart.ts` owns pure cart domain functions
- `CommerceProvider` hydrates/version-persists cart state
- `/products/[slug]` is statically generated for every catalog item
- `/categories` derives state from URL query parameters
- `SiteLayout` owns search presentation and accessible cart drawer

## Hero

Replace TorusKnot with Digital Fashion Rack / Floating Garment Edit:

- local product textures
- lightweight planes
- metallic rack geometry
- gentle sway
- pointer parallax
- CSS/image fallback
- dynamic WebGL only on >=768px without reduced motion
- observer-driven pause and full resource cleanup

## Accessibility

Maintain existing mobile/filter focus contracts and add equivalent cart-drawer behavior, live cart announcements and a real labeled search.

## Performance

Do not add GSAP, Motion/Framer Motion, Lenis, Redux, React Three Fiber or a remote 3D model. Three.js stays dynamically isolated to the hero.
