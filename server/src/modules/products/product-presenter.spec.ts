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
    brand: "Atelier North",
    condition: "EXCELLENT",
    conditionNotes: "Barely worn",
    material: "Organic cotton",
    measurements: { chest: "54 cm" },
    imperfections: "Small mark at cuff",
    soldAt: quantity === 0 ? new Date("2026-08-20T12:00:00.000Z") : null,
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

  it("presents truthful archive and garment inspection metadata", () => {
    const product = presentProduct(productWithInventory(0));
    expect(product.availability).toBe("SOLD");
    expect(product.soldAt).toBe("2026-08-20T12:00:00.000Z");
    expect(product.condition).toBe("EXCELLENT");
    expect(product.measurements).toEqual({ chest: "54 cm" });
    expect(product.imperfections).toBe("Small mark at cuff");
  });

  it("marks a single physical unit as one of one", () => {
    const product = presentProduct(productWithInventory(1));
    expect(product.availability).toBe("AVAILABLE");
    expect(product.isOneOfOne).toBe(true);
  });
});
