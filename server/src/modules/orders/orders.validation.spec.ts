import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateOrderDto } from "./dto/create-order.dto.js";

const valid = {
  customer: { email: "buyer@example.com", firstName: "Ada", lastName: "Lovelace" },
  shippingAddress: {
    firstName: "Ada",
    lastName: "Lovelace",
    addressLine1: "1 Example St",
    city: "London",
    state: "London",
    postalCode: "SW1A 1AA",
    country: "GB",
  },
  items: [{ variantId: "one-life-olive-small", quantity: 1 }],
};

async function errorsFor(payload: unknown) {
  return validate(plainToInstance(CreateOrderDto, payload), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe("CreateOrderDto", () => {
  it("requires customer and shipping address objects", async () => {
    const withoutCustomer = await errorsFor({ ...valid, customer: undefined });
    const withoutAddress = await errorsFor({ ...valid, shippingAddress: undefined });
    expect(withoutCustomer.some((error) => error.property === "customer")).toBe(true);
    expect(withoutAddress.some((error) => error.property === "shippingAddress")).toBe(true);
  });

  it("rejects client-authoritative price fields", async () => {
    const errors = await errorsFor({
      ...valid,
      items: [{ variantId: "one-life-olive-small", quantity: 1, price: 0.01 }],
    });
    expect(errors.some((error) => error.property === "items" && error.children?.length)).toBe(true);
  });
});
