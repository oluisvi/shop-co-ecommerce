import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addCartItem, countCartItems, parseCart, parseLegacyCart, removeCartItem, serializeCart, setCartItemQuantity } from "./cart.ts";

describe("variant cart domain", () => {
  it("adds and increments lines by variant id", () => {
    const first = addCartItem([], "one-life-olive-small", 2);
    assert.deepEqual(addCartItem(first, "one-life-olive-small", 2), [{ variantId: "one-life-olive-small", quantity: 4 }]);
  });
  it("clamps quantities from one to nine", () => {
    const lines = [{ variantId: "one-life-olive-small", quantity: 2 }];
    assert.equal(setCartItemQuantity(lines, "one-life-olive-small", 0)[0].quantity, 1);
    assert.equal(setCartItemQuantity(lines, "one-life-olive-small", 100)[0].quantity, 9);
  });
  it("removes one variant without touching another", () => {
    const lines = [{ variantId: "a", quantity: 1 }, { variantId: "b", quantity: 2 }];
    assert.deepEqual(removeCartItem(lines, "a"), [{ variantId: "b", quantity: 2 }]);
  });
  it("coalesces duplicate persisted variant lines so localStorage cannot create duplicate cart rows", () => {
    assert.deepEqual(
      parseCart('[{"variantId":"one-life-olive-small","quantity":2},{"variantId":"one-life-olive-small","quantity":3}]'),
      [{ variantId: "one-life-olive-small", quantity: 5 }],
    );
  });
  it("coalesces duplicate legacy product lines before variant migration", () => {
    assert.deepEqual(
      parseLegacyCart('[{"productId":"one-life","quantity":2},{"productId":"one-life","quantity":3}]'),
      [{ productId: "one-life", quantity: 5 }],
    );
  });
  it("counts and safely serializes persisted state", () => {
    const lines = [{ variantId: "a", quantity: 1 }, { variantId: "b", quantity: 2 }];
    assert.equal(countCartItems(lines), 3);
    assert.deepEqual(parseCart(serializeCart(lines)), lines);
    assert.deepEqual(parseCart("{bad"), []);
    assert.deepEqual(parseCart('[{"variantId":"a","quantity":50}]'), [{ variantId: "a", quantity: 9 }]);
  });
});
