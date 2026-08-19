import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allProducts } from "../data/catalog.ts";
import {
  addCartItem,
  calculateCartSubtotal,
  countCartItems,
  parseCart,
  removeCartItem,
  serializeCart,
  setCartItemQuantity,
} from "./cart.ts";

describe("cart domain", () => {
  it("adds unique lines and increments an existing product", () => {
    const once = addCartItem([], "one-life", 2);
    const twice = addCartItem(once, "one-life", 2);

    assert.deepEqual(twice, [{ productId: "one-life", quantity: 4 }]);
  });

  it("keeps quantities between one and nine", () => {
    const start = [{ productId: "one-life", quantity: 2 }];
    assert.equal(setCartItemQuantity(start, "one-life", 0)[0].quantity, 1);
    assert.equal(setCartItemQuantity(start, "one-life", 100)[0].quantity, 9);
  });

  it("removes a line without touching others", () => {
    const lines = [
      { productId: "one-life", quantity: 1 },
      { productId: "bermuda", quantity: 2 },
    ];
    assert.deepEqual(removeCartItem(lines, "one-life"), [
      { productId: "bermuda", quantity: 2 },
    ]);
  });

  it("calculates count and subtotal from current catalog prices", () => {
    const lines = [
      { productId: "one-life", quantity: 2 },
      { productId: "bermuda", quantity: 1 },
    ];

    assert.equal(countCartItems(lines), 3);
    assert.equal(calculateCartSubtotal(lines, allProducts), 520);
  });

  it("serializes valid state and safely ignores broken localStorage payloads", () => {
    const lines = [{ productId: "one-life", quantity: 2 }];
    assert.deepEqual(parseCart(serializeCart(lines)), lines);
    assert.deepEqual(parseCart("{bad json"), []);
    assert.deepEqual(parseCart('{"not":"an array"}'), []);
    assert.deepEqual(parseCart('[{"productId":"one-life","quantity":50}]'), [
      { productId: "one-life", quantity: 9 },
    ]);
  });
});
