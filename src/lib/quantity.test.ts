import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { changeQuantity } from "./quantity.ts";

describe("changeQuantity", () => {
  it("never goes below one", () => {
    assert.equal(changeQuantity(1, -1), 1);
  });

  it("never goes above nine", () => {
    assert.equal(changeQuantity(9, 1), 9);
  });

  it("moves by one inside the allowed range", () => {
    assert.equal(changeQuantity(4, -1), 3);
    assert.equal(changeQuantity(4, 1), 5);
  });
});
