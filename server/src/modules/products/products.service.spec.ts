import { jest } from "@jest/globals";
import { ProductsService } from "./products.service.js";

const products = [
  {
    id: "shirt",
    slug: "shirt",
    name: "Oxford Shirt",
    description: "Crisp cotton shirt",
    status: "ACTIVE",
    collection: "New arrivals",
    cardImage: "/shirt.png",
    rating: 4.5,
    category: { slug: "shirts", name: "Shirts" },
    images: [{ url: "/shirt.png", alt: "Oxford Shirt", position: 0 }],
    variants: [{
      id: "shirt-default", sku: "SHOP-SHIRT", color: null, colorValue: null, size: null,
      price: 180, compareAtPrice: 200, active: true,
      inventory: { quantity: 5, reservedQuantity: 0 },
    }],
  },
  {
    id: "jeans",
    slug: "jeans",
    name: "Slim Jeans",
    description: null,
    status: "ACTIVE",
    collection: "Top selling",
    cardImage: "/jeans.png",
    rating: 4,
    category: { slug: "jeans", name: "Jeans" },
    images: [{ url: "/jeans.png", alt: "Slim Jeans", position: 0 }],
    variants: [{
      id: "jeans-default", sku: "SHOP-JEANS", color: null, colorValue: null, size: null,
      price: 240, compareAtPrice: null, active: true,
      inventory: { quantity: 8, reservedQuantity: 0 },
    }],
  },
];

function makeService(records = products) {
  const productFindMany = jest.fn<
    () => Promise<typeof records>
  >(async () => records);

  const productFindUnique = jest.fn<
    (args: { where: { slug: string } }) =>
      Promise<(typeof records)[number] | null>
  >(
    async ({ where }) =>
      records.find((item) => item.slug === where.slug) ?? null,
  );

  const productVariantFindMany = jest.fn<
    () => Promise<unknown[]>
  >(async () => []);

  const prisma = {
    product: {
      findMany: productFindMany,
      findUnique: productFindUnique,
    },
    productVariant: {
      findMany: productVariantFindMany,
    },
  };

  return {
    service: new ProductsService(prisma as never),
    prisma,
  };
}

describe("ProductsService", () => {
  it("filters search, category and maxPrice then sorts and paginates", async () => {
    const { service } = makeService();
    const result = await service.list({
      search: "shirt",
      category: "shirts",
      maxPrice: 190,
      sort: "price-asc",
      page: 1,
      limit: 12,
    });
    expect(result.items.map((item) => item.slug)).toEqual(["shirt"]);
    expect(result.pagination).toEqual({ page: 1, limit: 12, total: 1, totalPages: 1 });
  });

  it("looks products up by stable slug", async () => {
    const { service } = makeService();
    const result = await service.bySlug("jeans");
    expect(result.id).toBe("jeans");
    expect(result.defaultVariantId).toBe("jeans-default");
  });

  it("returns a domain 404 for an unknown slug", async () => {
    const { service } = makeService();
    await expect(service.bySlug("missing")).rejects.toMatchObject({
  statusCode: 404,
  code: "PRODUCT_NOT_FOUND",
});
  });

  it("reconciliation reports a removed variant", async () => {
    const { service, prisma } = makeService();
    prisma.productVariant.findMany.mockResolvedValueOnce([]);
    await expect(service.reconcile({ items: [{ variantId: "gone", quantity: 1 }] })).resolves.toEqual({
      items: [],
      issues: [{ variantId: "gone", type: "REMOVED", message: "This item no longer exists." }],
    });
  });

  it("reconciliation reports inactive and insufficient-stock variants", async () => {
    const { service, prisma } = makeService();
    prisma.productVariant.findMany
      .mockResolvedValueOnce([{
        ...products[0].variants[0],
        active: false,
        product: products[0],
        inventory: { quantity: 5, reservedQuantity: 0 },
      }])
      .mockResolvedValueOnce([{
        ...products[0].variants[0],
        active: true,
        product: products[0],
        inventory: { quantity: 1, reservedQuantity: 0 },
      }]);
    const unavailable = await service.reconcile({ items: [{ variantId: "shirt-default", quantity: 1 }] });
    expect(unavailable.issues[0]).toMatchObject({ type: "UNAVAILABLE" });
    const shortage = await service.reconcile({ items: [{ variantId: "shirt-default", quantity: 2 }] });
    expect(shortage.issues[0]).toMatchObject({ type: "INSUFFICIENT_STOCK" });
  });

});
