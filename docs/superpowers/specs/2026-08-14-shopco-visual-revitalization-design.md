# SHOP.CO Visual Revitalization Design

## Direction

SHOP.CO will become an Urban Fashion Journal: a bold monochrome storefront with the rhythm of a contemporary streetwear publication. The existing products, imagery, brand name, and three-route scope remain intact. Oversized Integral CF headlines, Satoshi utility typography, strong rules, asymmetric editorial grids, and restrained rounded product imagery create the new voice.

## Visual System

- Ink `#000000`, charcoal `#171717`, graphite `#737373`, rule `#E7E7E7`, paper `#F5F5F3`, and white `#FFFFFF`.
- Fluid type and spacing scales use `clamp()`; content is constrained by a shared 1240px container.
- Product and category photography remains the visual focus. Shadows are avoided; contrast, scale, rules, and whitespace establish hierarchy.
- The signature element is a reusable editorial label and rule treatment derived from existing section meaning (for example `New arrivals / Latest drop`). It never introduces unsupported commercial claims.
- Motion uses CSS opacity and short transforms, with 140ms, 220ms, and 420ms tokens and a complete reduced-motion override.

## Architecture

The Pages Router is preserved. Shared site chrome is composed by `SiteLayout`; product, rating, review, breadcrumb, newsletter, and interactive controls become focused components. Static catalog and review content moves into typed data modules. Each page owns only route-specific composition and metadata.

## Route Design

### Home `/`

The hero reads as a magazine cover: oversized title, primary model image, CTA to `#new-arrivals`, and compact editorial statistics. Brand marks become a responsive monochrome strip. New Arrivals, Top Selling, dress styles, and customer reviews use distinct but related editorial grids.

### Category `/categories`

The page opens with an editorial masthead and honest catalog count. Desktop filters occupy a structured sidebar; mobile filters open an accessible dialog-like drawer. All demonstrative controls provide local feedback or are visibly disabled. Product data uses the shared card grid.

### Product `/products`

The product page uses an accessible gallery, selectable thumbnails, local color and size state, separated quantity controls, and an honest add-to-cart notice. Product information and reviews use semantic sections; recommendations reuse product cards.

## Interaction and Accessibility

The dismissible promotion and mobile navigation maintain local state. The navigation traps focus, closes by button, destination, backdrop, and Escape, locks document scrolling, and restores trigger focus. Newsletter validation provides local error/success feedback through `aria-live`. Native elements supply semantics; decorative imagery is hidden from assistive technology. Each route has one `h1`, visible focus, meaningful alternative text, and route metadata.

## Performance and Assets

Local WOFF2 fonts load through `next/font/local`; duplicate public font files and unused formats are removed only after usage verification. `next/image` reserves dimensions, sets responsive `sizes`, and prioritizes only the home hero LCP. Below-fold imagery remains lazy. No motion library is added.

## Validation

Automated checks cover static data and local interaction helpers. Required gates are `npm ci`, tests, `npm run typecheck`, `npm run lint`, and `npm run build`. Browser smoke tests cover all routes, keyboard navigation, feedback states, console errors, reduced motion, overflow, and the requested viewport widths.

## Phase Boundaries

Phase 1 remains a static demonstration. Search, filters, sorting, pagination, cart, authentication, inventory, checkout, and newsletter delivery are not implemented or simulated as real operations. Every product may route to the single demonstration product page; this limitation is documented.
