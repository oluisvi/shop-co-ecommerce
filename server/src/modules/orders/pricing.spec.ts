import { calculateShippingCents, FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_FLAT_CENTS } from "./pricing.js";

describe("shipping pricing", () => {
  it("charges the flat rate below the free-shipping threshold", () => {
    expect(calculateShippingCents(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(SHIPPING_FLAT_CENTS);
  });

  it("makes shipping free at and above the threshold", () => {
    expect(calculateShippingCents(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
    expect(calculateShippingCents(FREE_SHIPPING_THRESHOLD_CENTS + 5000)).toBe(0);
  });
});
