// Extraction Engine — deep module (pure, no UI).
//
// Maps (method + grind, water temp, brew ratio, brew time, roast) onto a point
// on the SCA control chart: { extractionYield, tds }. Each Variable moves EY by
// a signed, monotonic amount relative to the method's default recipe; roast and
// method shift the baseline; strength comes from the mass-balance relation
// TDS = EY / ratio (×, a small per-method filter factor). Calibration lives in
// the Method Registry (methods.ts) as tunable data — see ADR-0001.
import type { BrewInput, BrewVars, ExtractionResult, Method } from "./types";
import { methodSpec, type VarRange } from "./methods";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Signed deviation of `value` from `def`, normalised to roughly [-1, 1] over
 *  the range — −1 at min, 0 at the default, +1 at max. Monotonic. */
function signedNorm(value: number, def: number, range: VarRange): number {
  if (value >= def) {
    const span = range.max - def;
    return span <= 0 ? 0 : (value - def) / span;
  }
  const span = def - range.min;
  return span <= 0 ? 0 : (value - def) / span;
}

/** Diminishing-returns shaping for the time lever: more time keeps raising EY
 *  but with a flattening curve, so extremes don't run away. */
const diminish = (n: number) => Math.sign(n) * Math.sqrt(Math.abs(n));

export function extract(input: BrewInput): ExtractionResult {
  const spec = methodSpec(input.method);
  const { defaults: d, ranges: r, ey } = spec;

  const gEY = -ey.grindSwing * signedNorm(input.grind, d.grind, r.grind);
  const tEY = ey.tempSwing * signedNorm(input.waterTemp, d.waterTemp, r.waterTemp);
  // Derived-time methods (gravity percolation): time follows grind, so it adds no
  // *independent* EY — the slower-flow effect is already in gEY (else double-count).
  const timeEY =
    spec.timeMode === "derived"
      ? 0
      : ey.timeSwing * diminish(signedNorm(input.time, d.time, r.time));
  const roastEY = ey.roastSwing * signedNorm(input.roast, d.roast, r.roast);
  const ratioEY = ey.ratioSwing * signedNorm(input.ratio, d.ratio, r.ratio);

  const extractionYield = clamp(ey.baseEY + gEY + tEY + timeEY + roastEY + ratioEY, 8, 30);

  // Mass balance: concentration = dissolved mass / beverage mass ≈ EY/ratio.
  const tds = clamp((extractionYield / input.ratio) * spec.tdsK, 0.2, 16);

  return {
    extractionYield: round(extractionYield, 1),
    tds: round(tds, input.method === "espresso" ? 1 : 2),
  };
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** Convenience: run the engine straight from method + vars. */
export function extractFrom(method: Method, vars: BrewVars): ExtractionResult {
  return extract({ method, ...vars });
}
