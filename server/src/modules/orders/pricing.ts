export const SHIPPING_FLAT_CENTS = 1500;
export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;

export function moneyToCents(value: number | string | { toString(): string }) {
  const normalized = typeof value === "object" ? value.toString() : String(value);
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) throw new Error("Invalid money value");
  return Math.round(numeric * 100);
}

export function centsToMoney(cents: number) {
  return (cents / 100).toFixed(2);
}

export function calculateShippingCents(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}
