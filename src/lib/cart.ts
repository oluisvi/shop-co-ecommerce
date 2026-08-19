import type { Product } from "../types/store.ts";

export const CART_STORAGE_KEY = "shopco-cart-v2";
export const MIN_CART_QUANTITY = 1;
export const MAX_CART_QUANTITY = 9;

export type CartLine = {
  productId: string;
  quantity: number;
};

export function clampCartQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return MIN_CART_QUANTITY;
  return Math.min(MAX_CART_QUANTITY, Math.max(MIN_CART_QUANTITY, Math.round(quantity)));
}

export function addCartItem(lines: CartLine[], productId: string, quantity = 1) {
  const existing = lines.find((line) => line.productId === productId);
  if (!existing) {
    return [...lines, { productId, quantity: clampCartQuantity(quantity) }];
  }

  return lines.map((line) =>
    line.productId === productId
      ? { ...line, quantity: clampCartQuantity(line.quantity + quantity) }
      : line,
  );
}

export function setCartItemQuantity(lines: CartLine[], productId: string, quantity: number) {
  return lines.map((line) =>
    line.productId === productId
      ? { ...line, quantity: clampCartQuantity(quantity) }
      : line,
  );
}

export function removeCartItem(lines: CartLine[], productId: string) {
  return lines.filter((line) => line.productId !== productId);
}

export function countCartItems(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function calculateCartSubtotal(lines: CartLine[], products: Product[]) {
  const prices = new Map(products.map((product) => [product.id, product.price]));
  return lines.reduce(
    (total, line) => total + (prices.get(line.productId) ?? 0) * line.quantity,
    0,
  );
}

export function serializeCart(lines: CartLine[]) {
  return JSON.stringify(lines);
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { productId?: unknown; quantity?: unknown };
  return (
    typeof candidate.productId === "string" &&
    candidate.productId.length > 0 &&
    typeof candidate.quantity === "number" &&
    Number.isFinite(candidate.quantity)
  );
}

export function parseCart(raw: string | null) {
  if (!raw) return [] as CartLine[];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isCartLine)
      .map((line) => ({
        productId: line.productId,
        quantity: clampCartQuantity(line.quantity),
      }));
  } catch {
    return [];
  }
}
