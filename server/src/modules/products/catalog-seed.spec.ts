import { seedProducts } from "../../../prisma/catalog-seed-data.js";

describe("SHOP.CO catalog seed contract", () => {
  it("preserves exactly the 12 existing stable slugs", () => {
    expect(seedProducts.map((product) => product.slug)).toEqual([
      "one-life",
      "skinny-jeans",
      "checkered-shirt",
      "sleeve-stripe",
      "vertical-stripe",
      "courage",
      "bermuda",
      "faded-jeans",
      "contrast-polo",
      "gradient-graphic",
      "tipping-polo",
      "black-stripe",
    ]);
  });

  it("preserves current product prices and categories", () => {
    const oneLife = seedProducts.find((product) => product.id === "one-life");
    const bermuda = seedProducts.find((product) => product.id === "bermuda");
    expect(oneLife).toMatchObject({ price: 220, category: "T-shirts" });
    expect(bermuda).toMatchObject({ price: 80, category: "Shorts" });
  });
});
