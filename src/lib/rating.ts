export type StarState = "full" | "half" | "empty";

export function getStarStates(value: number): StarState[] {
  const clamped = Math.max(0, Math.min(5, value));

  return Array.from({ length: 5 }, (_, index) => {
    const remaining = clamped - index;
    if (remaining >= 1) return "full";
    if (remaining >= 0.5) return "half";
    return "empty";
  });
}
