import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("visual revitalization source contracts", () => {
  it("removes the dismissed promotion from the accessibility tree and tab order", () => {
    const source = readSource("../components/SiteLayout.tsx");
    assert.match(source, /\{promo && \(/);
  });

  it("keeps the mobile catalog filters keyboard-contained and restores focus", () => {
    const source = readSource("../pages/categories/index.tsx");
    assert.match(source, /event\.key !== "Tab"/);
    assert.match(source, /filterTrigger\.current/);
    assert.match(source, /trigger\?\.focus\(\)/);
    assert.match(source, /role=\{filtersOpen \? "dialog" : undefined\}/);
    assert.match(source, /aria-modal=\{filtersOpen \? true : undefined\}/);
  });

  it("does not advertise catalog pages or counts that do not exist", () => {
    const source = readSource("../pages/categories/index.tsx");
    assert.doesNotMatch(source, /Showing 9 of 100 products/);
    assert.doesNotMatch(source, /Page 1 of 10/);
    assert.match(source, /categoryProducts\.length/);
  });

  it("replaces the fragile hero image and decorative stars with the rebrand experience", () => {
    const home = readSource("../pages/index.tsx");
    const product = readSource("../pages/products/index.tsx");

    assert.match(home, /HeroExperience/);
    assert.doesNotMatch(home, /main-couple/);
    assert.doesNotMatch(home, /hero-star/);
    assert.doesNotMatch(product, /\bpriority\b/);
  });
});
