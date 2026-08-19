import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("Phase 2 functional source contracts", () => {
  it("wraps the app with local commerce state and imports the Phase 2 style layer", () => {
    const source = readSource("../pages/_app.tsx");
    assert.match(source, /CommerceProvider/);
    assert.match(source, /phase2\.css/);
  });

  it("deep-links static products and builds every slug at compile time", () => {
    const source = readSource("../pages/products/[slug].tsx");
    assert.match(source, /getStaticPaths/);
    assert.match(source, /allProducts\.map/);
    assert.match(source, /fallback: false/);
  });

  it("connects catalog state to URL query parameters", () => {
    const source = readSource("../pages/categories/index.tsx");
    assert.match(source, /router\.query/);
    assert.match(source, /router\.replace/);
    assert.match(source, /shallow: true/);
    assert.match(source, /filterProducts/);
    assert.match(source, /sortProducts/);
  });

  it("persists the shopping bag with a versioned localStorage key", () => {
    const source = readSource("../context/CommerceContext.tsx");
    assert.match(source, /window\.localStorage\.getItem/);
    assert.match(source, /window\.localStorage\.setItem/);
    assert.match(source, /CART_STORAGE_KEY/);
  });

  it("does not introduce a fake payment implementation", () => {
    const source = readSource("../components/SiteLayout.tsx");
    assert.match(source, /Checkout connects in Phase 3/);
    assert.match(source, /demo-checkout/);
    assert.match(source, /disabled/);
    assert.doesNotMatch(source, /stripe/i);
    assert.doesNotMatch(source, /fetch\(/);
  });
});
