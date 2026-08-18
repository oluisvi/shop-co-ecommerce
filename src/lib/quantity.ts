export function changeQuantity(current: number, delta: -1 | 1): number {
  return Math.max(1, Math.min(9, current + delta));
}
