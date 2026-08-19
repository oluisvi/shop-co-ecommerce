import { jest } from "@jest/globals";
import { OrdersService } from "./orders.service.js";

function activeVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: "one-life-olive-small",
    sku: "SHOP-ONE-LIFE-OLIVE-SMALL",
    color: "Olive",
    size: "Small",
    price: 220,
    active: true,
    productId: "one-life",
    product: {
      id: "one-life",
      name: "One Life Graphic T-shirt",
      status: "ACTIVE",
    },
    inventory: {
      quantity: 3,
      reservedQuantity: 0,
    },
    ...overrides,
  };
}

const dto = {
  customer: {
    email: "buyer@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
  },
  shippingAddress: {
    firstName: "Ada",
    lastName: "Lovelace",
    addressLine1: "1 Example St",
    city: "London",
    state: "London",
    postalCode: "SW1A 1AA",
    country: "GB",
  },
  items: [
    {
      variantId: "one-life-olive-small",
      quantity: 1,
    },
  ],
};

function makeService(variant = activeVariant(), decrementCount = 1) {
  const createdOrder = {
    id: 123,
  };

  const updatedOrder = {
    id: 123,
    orderNumber: "SHOP-000123",
    status: "CREATED",
    email: dto.customer.email,
    subtotal: 220,
    shipping: 0,
    discount: 0,
    total: 220,
    currency: "USD",
    items: [],
    address: dto.shippingAddress,
  };

  const variants = variant ? [variant] : [];

  const orderCreate = jest.fn<
    (...args: unknown[]) => Promise<typeof createdOrder>
  >(async () => createdOrder);

  const orderUpdate = jest.fn<
    (...args: unknown[]) => Promise<typeof updatedOrder>
  >(async () => updatedOrder);

  const productVariantFindMany = jest.fn<
    (...args: unknown[]) => Promise<typeof variants>
  >(async () => variants);

  const inventoryUpdateMany = jest.fn<
    (...args: unknown[]) => Promise<{ count: number }>
  >(async () => ({
    count: decrementCount,
  }));

  const tx = {
    productVariant: {
      findMany: productVariantFindMany,
    },
    inventory: {
      updateMany: inventoryUpdateMany,
    },
    order: {
      create: orderCreate,
      update: orderUpdate,
    },
  };

  const transaction = jest.fn(
    async (fn: (client: typeof tx) => unknown) => fn(tx),
  );

  const prisma = {
    $transaction: transaction,
  };

  return {
    service: new OrdersService(prisma as never),
    tx,
    prisma,
  };
}

describe("OrdersService", () => {
  it("uses the server variant price and never accepts a client price", async () => {
    const { service, tx } = makeService();

    await service.create(dto);

    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: "220.00",
          total: "220.00",
        }),
      }),
    );
  });

  it("rejects an invalid variant", async () => {
    const { service } = makeService(null as never);

    await expect(service.create(dto)).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_VARIANT",
    });
  });

  it("rejects inactive products and variants", async () => {
    const inactive = activeVariant({
      active: false,
    });

    const { service } = makeService(inactive);

    await expect(service.create(dto)).rejects.toMatchObject({
      statusCode: 409,
      code: "VARIANT_UNAVAILABLE",
    });
  });

  it("rejects an inactive product even when the variant flag is active", async () => {
    const inactiveProduct = activeVariant({
      product: {
        id: "one-life",
        name: "One Life Graphic T-shirt",
        status: "ARCHIVED",
      },
    });

    const { service } = makeService(inactiveProduct);

    await expect(service.create(dto)).rejects.toMatchObject({
      statusCode: 409,
      code: "VARIANT_UNAVAILABLE",
    });
  });

  it("rejects invalid quantities inside the domain service", async () => {
    const { service } = makeService();

    await expect(
      service.create({
        ...dto,
        items: [
          {
            variantId: "one-life-olive-small",
            quantity: 0,
          },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_QUANTITY",
    });
  });

  it("returns conflict when the atomic inventory decrement loses the race", async () => {
    const { service } = makeService(activeVariant(), 0);

    await expect(service.create(dto)).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
    });
  });

  it("wraps lookup, stock decrement and order creation in one transaction", async () => {
    const { service, prisma } = makeService();

    await service.create(dto);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("does not create an order when any line fails", async () => {
    const { service, tx } = makeService();

    tx.productVariant.findMany.mockResolvedValueOnce([
      activeVariant(),
    ]);

    await expect(
      service.create({
        ...dto,
        items: [
          {
            variantId: "one-life-olive-small",
            quantity: 1,
          },
          {
            variantId: "missing",
            quantity: 1,
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "INVALID_VARIANT",
    });

    expect(tx.order.create).not.toHaveBeenCalled();
  });
});