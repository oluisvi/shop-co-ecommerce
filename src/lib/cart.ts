export const CART_STORAGE_KEY = "shopco-cart-v3";
export const LEGACY_CART_STORAGE_KEY = "shopco-cart-v2";
export const MIN_CART_QUANTITY = 1;
export const MAX_CART_QUANTITY = 9;
export type CartLine = { variantId: string; quantity: number };
export type LegacyCartLine = { productId: string; quantity: number };

export function clampCartQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return MIN_CART_QUANTITY;
  return Math.min(MAX_CART_QUANTITY, Math.max(MIN_CART_QUANTITY, Math.round(quantity)));
}
export function addCartItem(lines: CartLine[], variantId: string, quantity = 1) {
  const existing = lines.find((line) => line.variantId === variantId);
  if (!existing) return [...lines, { variantId, quantity: clampCartQuantity(quantity) }];
  return lines.map((line) => line.variantId === variantId ? { ...line, quantity: clampCartQuantity(line.quantity + quantity) } : line);
}
export function setCartItemQuantity(lines: CartLine[], variantId: string, quantity: number) {
  return lines.map((line) => line.variantId === variantId ? { ...line, quantity: clampCartQuantity(quantity) } : line);
}
export function removeCartItem(lines: CartLine[], variantId: string) { return lines.filter((line) => line.variantId !== variantId); }
export function countCartItems(lines: CartLine[]) { return lines.reduce((sum, line) => sum + line.quantity, 0); }
export function serializeCart(lines: CartLine[]) { return JSON.stringify(lines); }
function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  return typeof line.variantId === "string" && line.variantId.length > 0 && typeof line.quantity === "number" && Number.isFinite(line.quantity);
}
function coalesceCartLines(lines: CartLine[]) {
  const merged = new Map<string, number>();
  for (const line of lines) {
    merged.set(line.variantId, clampCartQuantity((merged.get(line.variantId) ?? 0) + line.quantity));
  }
  return Array.from(merged, ([variantId, quantity]) => ({ variantId, quantity }));
}

export function parseCart(raw: string | null) {
  if (!raw) return [] as CartLine[];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return coalesceCartLines(
      parsed.filter(isLine).map((line) => ({ variantId: line.variantId, quantity: clampCartQuantity(line.quantity) })),
    );
  } catch {
    return [];
  }
}
export function parseLegacyCart(raw: string | null) {
  if (!raw) return [] as LegacyCartLine[];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const merged = new Map<string, number>();
    for (const value of parsed) {
      if (!value || typeof value !== "object") continue;
      const line = value as Partial<LegacyCartLine>;
      if (typeof line.productId !== "string" || typeof line.quantity !== "number") continue;
      merged.set(
        line.productId,
        clampCartQuantity((merged.get(line.productId) ?? 0) + line.quantity),
      );
    }
    return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
  } catch {
    return [];
  }
}
