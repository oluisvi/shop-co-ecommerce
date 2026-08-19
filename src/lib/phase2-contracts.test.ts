import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
function readSource(relativePath: string) { return readFileSync(new URL(relativePath, import.meta.url), "utf8"); }

describe("Phase 2 contracts preserved through Phase 3", () => {
  it("keeps commerce state and the approved Phase 2 style layer", () => {
    const source = readSource("../pages/_app.tsx");
    assert.match(source, /CommerceProvider/);
    assert.match(source, /phase2\.css/);
    assert.match(source, /phase3\.css/);
  });
  it("preserves stable product slugs while moving detail data to the commerce API", () => {
    const source = readSource("../pages/products/[slug].tsx");
    assert.match(source, /getServerSideProps/);
    assert.match(source, /getProduct\(slug\)/);
    assert.match(source, /notFound: true/);
    assert.doesNotMatch(source, /allProducts/);
  });
  it("keeps catalog state URL-synchronized while API-driving filters and sorting", () => {
    const source = readSource("../pages/categories/index.tsx");
    assert.match(source, /router\.query/);
    assert.match(source, /router\.replace/);
    assert.match(source, /shallow: true/);
    assert.match(source, /listProducts/);
    assert.match(source, /skipInitialCatalogFetch/);
    assert.match(source, /catalogFetchTimer/);
  });
  it("persists the guest bag with a versioned localStorage key", () => {
    const source = readSource("../context/CommerceContext.tsx");
    assert.match(source, /window\.localStorage\.getItem/);
    assert.match(source, /window\.localStorage\.setItem/);
    assert.match(source, /CART_STORAGE_KEY/);
    assert.match(source, /LEGACY_CART_STORAGE_KEY/);
    assert.match(readSource("../components/SiteLayout.tsx"), /removeFromCart\(issue\.variantId\)/);
  });
  it("adds order creation without introducing a fake payment provider", () => {
    const layout = readSource("../components/SiteLayout.tsx");
    const checkout = readSource("../pages/checkout.tsx");
    assert.match(layout, /href=\{cartIssues\.length \? "\/categories" : "\/checkout"\}/);
    assert.match(checkout, /createOrder/);
    assert.match(checkout, /does not charge a card/i);
    assert.doesNotMatch(layout + checkout, /stripe/i);
  });
});
