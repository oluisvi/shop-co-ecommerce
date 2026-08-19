import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapApiProduct } from "./api/mappers.ts";

describe("API product mapping", () => {
  it("preserves money, imagery, options, href and default variant", () => {
    const product = mapApiProduct({
      id: "one-life", slug: "one-life", name: "One Life", image: "/card.png", price: 220,
      previousPrice: 260, discount: 15, rating: 4, category: "T-shirts", categorySlug: "t-shirts",
      collection: "New arrivals", href: "/products/one-life", description: "Graphic tee",
      gallery: [{ src: "/front.png", alt: "Front" }], colors: [{ name: "Olive", value: "#4f4631" }],
      sizes: ["Small"], defaultVariantId: "one-life-olive-small",
      variants: [{ id: "one-life-olive-small", sku: "SKU", color: { name: "Olive", value: "#4f4631" }, size: "Small", price: 220, previousPrice: 260, active: true, availableQuantity: 4 }],
    });
    assert.equal(product.price, 220);
    assert.equal(product.gallery?.[0].src, "/front.png");
    assert.equal(product.colors?.[0].name, "Olive");
    assert.equal(product.sizes?.[0], "Small");
    assert.equal(product.href, "/products/one-life");
    assert.equal(product.defaultVariantId, "one-life-olive-small");
  });
});
