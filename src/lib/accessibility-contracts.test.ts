import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("Phase 2 accessibility source contracts", () => {
  it("removes the dismissed promotion from the accessibility tree and tab order", () => {
    const source = readSource("../components/SiteLayout.tsx");
    assert.match(source, /\{promo \? \(/);
  });

  it("keeps the mobile catalog filters keyboard-contained and restores focus", () => {
    const source = readSource("../pages/categories/index.tsx");
    assert.match(source, /event\.key !== "Tab"/);
    assert.match(source, /filterTrigger\.current/);
    assert.match(source, /trigger\?\.focus\(\)/);
    assert.match(source, /role=\{filtersOpen \? "dialog" : undefined\}/);
    assert.match(source, /aria-modal=\{filtersOpen \? true : undefined\}/);
  });

  it("keeps the shopping bag keyboard-contained and restores focus", () => {
    const source = readSource("../components/SiteLayout.tsx");
    assert.match(source, /cartButton\.current/);
    assert.match(source, /id="cart-drawer"/);
    assert.match(source, /role="dialog"/);
    assert.match(source, /aria-modal="true"/);
    assert.match(source, /event\.key !== "Tab"/);
    assert.match(source, /trigger\?\.focus\(\)/);
  });

  it("uses a real search control rather than a disabled Phase 1 placeholder", () => {
    const source = readSource("../components/SiteLayout.tsx");
    assert.match(source, /aria-label="Product search"/);
    assert.match(source, /submitSearch/);
    assert.doesNotMatch(source, /Search available in Phase 2/);
    assert.doesNotMatch(source, /aria-disabled="true"/);
  });

  it("keeps cart announcements available to assistive technology", () => {
    const source = readSource("../components/SiteLayout.tsx");
    assert.match(source, /aria-live="polite"/);
    assert.match(source, /\{announcement\}/);
  });
});
