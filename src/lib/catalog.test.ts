import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allProducts } from "../data/catalog.ts";
import {
  deriveCategoryFacets,
  filterProducts,
  getProductBySlug,
  searchProducts,
  sortProducts,
} from "./catalog.ts";

describe("catalog helpers", () => {
  it("finds products by stable slug", () => {
    assert.equal(getProductBySlug(allProducts, "one-life")?.name, "One Life Graphic T-shirt");
    assert.equal(getProductBySlug(allProducts, "missing"), undefined);
  });

  it("searches names, categories and collection labels", () => {
    assert.equal(searchProducts(allProducts, "jeans").every((product) => product.category === "Jeans"), true);
    assert.equal(searchProducts(allProducts, "top selling").length, 4);
    assert.equal(searchProducts(allProducts, "polo").length, 2);
  });

  it("filters by category and maximum current price", () => {
    const result = filterProducts(allProducts, {
      categories: ["T-shirts"],
      maxPrice: 150,
    });

    assert.equal(result.length > 0, true);
    assert.equal(result.every((product) => product.category === "T-shirts" && product.price <= 150), true);
  });

  it("sorts deterministically without mutating the input", () => {
    const original = allProducts.map((product) => product.id);
    const lowFirst = sortProducts(allProducts, "price-asc");
    const highFirst = sortProducts(allProducts, "price-desc");
    const rated = sortProducts(allProducts, "rating-desc");

    assert.equal(lowFirst[0].price <= lowFirst.at(-1)!.price, true);
    assert.equal(highFirst[0].price >= highFirst.at(-1)!.price, true);
    assert.equal(rated[0].rating >= rated.at(-1)!.rating, true);
    assert.deepEqual(allProducts.map((product) => product.id), original);
  });

  it("derives only facets present in the catalog", () => {
    const facets = deriveCategoryFacets(allProducts);
    assert.deepEqual(facets, ["Jeans", "Polos", "Shirts", "Shorts", "T-shirts"]);
  });
});
