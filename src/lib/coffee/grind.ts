// Grind Reference — pure mapping from the grind Variable (0 fine → 100 coarse)
// to a human label, real-world grinder references, and a granule size in px for
// the live grounds preview. Lets the UI say "≈ sea salt · Comandante ~22" and
// draw grounds that resize as you drag.
export interface GrindReference {
  /** extra-fine → extra-coarse */
  label: string;
  /** Everyday references for this coarseness, e.g. "sea salt", "table sugar". */
  grinderRefs: string[];
  /** Particle diameter to draw in the grounds preview (SVG px in a 32-box). */
  granuleSizePx: number;
}

interface Band {
  max: number; // upper grind value (exclusive-ish) for this band
  label: string;
  grinderRefs: string[];
}

// Ordered fine → coarse. Comandante click counts are the common dial-in refs.
const BANDS: Band[] = [
  { max: 12, label: "Extra-fine", grinderRefs: ["powdered sugar", "espresso", "Comandante ~8"] },
  { max: 28, label: "Fine", grinderRefs: ["table salt", "Moka / AeroPress", "Comandante ~14"] },
  { max: 45, label: "Medium-fine", grinderRefs: ["table sugar", "V60 / pour-over", "Comandante ~20"] },
  { max: 60, label: "Medium", grinderRefs: ["sea salt", "drip / siphon", "Comandante ~25"] },
  { max: 75, label: "Medium-coarse", grinderRefs: ["coarse sand", "Chemex", "Comandante ~30"] },
  { max: 90, label: "Coarse", grinderRefs: ["raw sugar", "French press", "Comandante ~35"] },
  { max: 101, label: "Extra-coarse", grinderRefs: ["sea-salt flakes", "cold brew", "Comandante ~40"] },
];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function grindReference(value: number): GrindReference {
  const v = clamp(value, 0, 100);
  const band = BANDS.find((b) => v < b.max) ?? BANDS[BANDS.length - 1];
  // Fine ≈ 1.0px granules, extra-coarse ≈ 6px — a 6× visible size swing.
  const granuleSizePx = 1.0 + (v / 100) * 5;
  return { label: band.label, grinderRefs: band.grinderRefs, granuleSizePx };
}

/** Short label only (for compact chips). */
export function grindLabel(value: number): string {
  return grindReference(value).label;
}
