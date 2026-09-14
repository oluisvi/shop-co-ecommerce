import assert from "node:assert/strict";
import test from "node:test";
import { fallbackFacets, getFallbackProduct, getFallbackProducts } from "./catalog-fallback.ts";

test("builds fallback facets from the static catalog", () => {
  assert.equal(fallbackFacets.items.length, 5);
  assert.equal(fallbackFacets.priceRange.min, 80);
  assert.equal(fallbackFacets.priceRange.max, 240);
});

test("filters fallback products by category, search and price", () => {
  const jeans = getFallbackProducts({ category: "jeans", limit: 100 }).items;
  assert.ok(jeans.length > 0);
  assert.ok(jeans.every((product) => product.category === "Jeans"));

  const shirts = getFallbackProducts({ search: "shirt", maxPrice: 180, limit: 100 }).items;
  assert.ok(shirts.length > 0);
  assert.ok(shirts.every((product) => product.price <= 180));
});

test("finds a fallback product by slug", () => {
  assert.equal(getFallbackProduct("one-life")?.name, "One Life Graphic T-shirt");
  assert.equal(getFallbackProduct("missing-product"), undefined);
});
