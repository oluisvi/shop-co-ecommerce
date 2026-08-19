import { jest } from "@jest/globals";
import { CategoriesService } from "./categories.service.js";

describe("CategoriesService", () => {
  it("returns active category facets with a price range", async () => {
    const rows = [
      {
        slug: "shirts",
        name: "Shirts",
        products: [{ variants: [{ price: 180, active: true }] }],
      },
      {
        slug: "jeans",
        name: "Jeans",
        products: [{ variants: [{ price: 240, active: true }] }],
      },
    ];

    const prisma = {
      category: {
        findMany: jest.fn<() => Promise<typeof rows>>(
          async () => rows,
        ),
      },
    };

    const service = new CategoriesService(prisma as never);

    await expect(service.list()).resolves.toEqual({
      items: [
        { slug: "jeans", name: "Jeans", productCount: 1 },
        { slug: "shirts", name: "Shirts", productCount: 1 },
      ],
      priceRange: { min: 180, max: 240 },
    });
  });
});