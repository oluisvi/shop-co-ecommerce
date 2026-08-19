import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildOrderInput, validateCheckout } from "./checkout.ts";

const valid = {
  email: "buyer@example.com", firstName: "Ada", lastName: "Lovelace", addressLine1: "1 Example St",
  addressLine2: "", city: "London", state: "London", postalCode: "SW1A 1AA", country: "GB",
};

describe("checkout validation", () => {
  it("accepts a complete valid shipping form", () => assert.deepEqual(validateCheckout(valid), {}));
  it("rejects invalid email", () => assert.equal(validateCheckout({ ...valid, email: "bad" }).email, "Enter a valid email address."));
  it("requires an ISO-style two-letter country code", () => assert.equal(validateCheckout({ ...valid, country: "1!" }).country, "Use a 2-letter country code."));
  it("requires every shipping field except address line 2", () => {
    for (const field of ["firstName", "lastName", "addressLine1", "city", "state", "postalCode", "country"] as const) {
      assert.ok(validateCheckout({ ...valid, [field]: "" })[field]);
    }
  });
  it("builds an order payload with variant IDs and quantities but no prices", () => {
    const payload = buildOrderInput(valid, [{ variantId: "one-life-olive-small", quantity: 2 }]);
    assert.deepEqual(payload.items, [{ variantId: "one-life-olive-small", quantity: 2 }]);
    assert.equal("price" in payload.items[0], false);
    assert.equal(payload.customer.email, "buyer@example.com");
  });
});
