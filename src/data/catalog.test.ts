import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allProducts, newArrivals, topSelling } from "./catalog.ts";

describe("static catalog", () => {
  it("keeps identifiers unique", () => {
    assert.equal(new Set(allProducts.map((product) => product.id)).size, allProducts.length);
  });

  it("uses only the existing demonstration product route", () => {
    assert.equal(allProducts.every((product) => product.href === "/products"), true);
  });

  it("preserves four products in each home collection", () => {
    assert.equal(newArrivals.length, 4);
    assert.equal(topSelling.length, 4);
  });
});
