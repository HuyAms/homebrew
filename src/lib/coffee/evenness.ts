// Evenness — deep module (pure, no UI).
//
// The second model dimension (ADR-0003), espresso-only. A Variable moves the
// brew's single (EY, TDS) point; Puck Prep instead moves the *spread* — how
// uniformly the bed extracts. Low Puck Prep → Channeling: water finds a fast
// path, so part of the bed over-extracts (bitter) while the bypassed bulk
// under-extracts (sour) at the same time (`research/08`). This module turns
// puckPrep + the base ExtractionResult into an evenness factor and the under/
// over EY lobes the rest of the app reads: the Taste Mapper raises bitterness
// AND acidity at low evenness, and the Control Chart smears the dot between the
// lobes instead of drawing a single point.
//
// See CONTEXT.md (Extraction Evenness, Channeling, Puck Prep) and research/08.
import type { BrewInput, EvennessResult, ExtractionResult, Method } from "./types";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Half-width (in EY %) the bed splits to at full channeling. Chosen so the
 *  lobes straddle well past the ideal box (±2 EY) into clear under/over land. */
const MAX_SPREAD = 6;

/** Below this evenness the brew reads as channeling — the Coach prescribes Puck
 *  Prep ("fix prep, not grind") and the Verdict flips to "uneven". */
export const CHANNELING_THRESHOLD = 0.6;

/** Default Puck Prep when none is set: dialed (perfectly even). */
export const DIALED = 1;

/** Map a raw Puck Prep value (0 sloppy → 1 dialed) onto the under/over EY lobes
 *  around a base extraction. Evenness is monotonic in puckPrep, so dialing prep
 *  up always tightens the spread (per the PRD's behavioral contract). */
export function evennessFromPuckPrep(puckPrep: number, base: ExtractionResult): EvennessResult {
  const evenness = clamp(puckPrep, 0, 1);
  const channeling = 1 - evenness;
  const spread = channeling * MAX_SPREAD;
  return {
    evenness,
    underEY: clamp(base.extractionYield - spread, 8, 30),
    overEY: clamp(base.extractionYield + spread, 8, 30),
  };
}

/** Whether Extraction Evenness applies to a method (espresso-only at launch). */
export function hasEvenness(method: Method): boolean {
  return method === "espresso";
}

/** Convenience: derive evenness straight from the engine input + its base
 *  result. Non-espresso (or no Technique) is treated as fully dialed — a single
 *  point, no smear — keeping the single-point model intact for other methods. */
export function evennessFromInput(input: BrewInput, base: ExtractionResult): EvennessResult {
  if (!hasEvenness(input.method) || input.technique === undefined) {
    return { evenness: DIALED, underEY: base.extractionYield, overEY: base.extractionYield };
  }
  return evennessFromPuckPrep(input.technique.puckPrep, base);
}
