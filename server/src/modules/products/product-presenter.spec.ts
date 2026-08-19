import { presentProduct } from "./product-presenter.js";

function productWithInventory(quantity: number) {
  return {
    id: "shirt",
    slug: "shirt",
    name: "Oxford Shirt",
    description: null,
    status: "ACTIVE",
    collection: "Top selling",
    cardImage: "/shirt.png",
    rating: 4,
    category: { slug: "shirts", name: "Shirts" },
    images: [{ url: "/shirt.png", alt: "Oxford Shirt", position: 0 }],
    variants: [{
      id: "shirt-default",
      sku: "SHOP-SHIRT",
      color: null,
      colorValue: null,
      size: null,
      price: 180,
      compareAtPrice: null,
      active: true,
      inventory: { quantity, reservedQuantity: 0 },
    }],
  };
}

describe("product presenter", () => {
  it("does not expose an out-of-stock active variant as the default sellable variant", () => {
    const product = presentProduct(productWithInventory(0));
    expect(product.defaultVariantId).toBeNull();
    expect(product.price).toBe(180);
  });

  it("uses an in-stock active variant as the default sellable variant", () => {
    expect(presentProduct(productWithInventory(2)).defaultVariantId).toBe("shirt-default");
  });
});
