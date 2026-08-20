export type CapabilityTier = 'A' | 'B' | 'C';
export type CapabilitySignals = Readonly<{
  reducedMotion: boolean; saveData: boolean; width: number; dpr: number;
  cores?: number; memory?: number;
}>;

export function chooseCapabilityTier(signals: CapabilitySignals): CapabilityTier {
  if (signals.reducedMotion || signals.saveData) return 'A';
  if (signals.width < 600 && ((signals.cores ?? 4) <= 2 || (signals.memory ?? 4) <= 2)) return 'A';
  if (signals.width >= 1200 && (signals.cores ?? 4) >= 8 && (signals.memory ?? 4) >= 8) return 'C';
  return 'B';
}
