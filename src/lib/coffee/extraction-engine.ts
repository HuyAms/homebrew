// Extraction Engine — deep module (pure, no UI).
//
// Maps (method + grind, water temp, brew ratio, brew time, roast) onto a point
// on the SCA control chart: { extractionYield, tds }. Each variable moves EY
// along a documented monotonic curve with method-specific coefficients; roast
// and method shift the baseline; strength uses the mass-balance relation
// TDS = ratio × EY. Calibration lives in tunable per-method data tables.
//
// See docs/adr/0001-heuristic-extraction-model.md. Implemented in a later slice.

import type { BrewInput, ExtractionResult } from "./types";

export function extract(_input: BrewInput): ExtractionResult {
  throw new Error("Extraction Engine not implemented yet");
}
