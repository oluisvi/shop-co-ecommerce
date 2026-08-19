import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasBlockingCartIssues, reconciledSubtotal } from "./cart-reconciliation.ts";

describe("cart reconciliation", () => {
  it("calculates display subtotal only from current server prices", () => {
    assert.equal(reconciledSubtotal([
      { quantity: 2, variant: { price: 220 } },
      { quantity: 1, variant: { price: 80 } },
    ]), 520);
  });
  it("blocks unavailable and insufficient-stock issues before checkout", () => {
    assert.equal(hasBlockingCartIssues([{ type: "UNAVAILABLE" }]), true);
    assert.equal(hasBlockingCartIssues([{ type: "INSUFFICIENT_STOCK" }]), true);
    assert.equal(hasBlockingCartIssues([]), false);
  });
});
