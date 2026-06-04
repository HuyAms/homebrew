// Method Registry — the single source of truth for the six brewing methods.
//
// Each method carries: display metadata, per-Variable adjustable ranges +
// defaults, a time-scale, a brew-animation type, and the calibration the
// Extraction Engine / Taste Mapper read to land that method's default recipe in
// its ideal box. Calibration lives here as tunable data (per ADR-0001): adjust
// the feel by editing numbers, not the engine.
import type { BrewVars, Method } from "./types";

export type TimeScale = "seconds" | "minutes" | "hours";
export type BrewAnimation = "pour" | "drip" | "press" | "pull" | "steep";
export type FilterType = "thin-paper" | "metal-mesh" | "metal-basket" | "paper-disc" | "cloth-bag";

/** Adjustable range for one Variable on one method. */
export interface VarRange {
  min: number;
  max: number;
  step: number;
}

/** How strongly each Variable moves Extraction Yield, signed so the curve is
 *  monotonic in the documented direction. `swing` is the EY change (in %) at the
 *  far end of the range from the default. */
export interface EyCalibration {
  baseEY: number; // EY at the default recipe (lands mid-box)
  grindSwing: number; // coarser → lower EY (applied negative)
  tempSwing: number; // hotter → higher EY
  timeSwing: number; // longer → higher EY (diminishing)
  roastSwing: number; // darker → higher EY
  ratioSwing: number; // more water → slightly higher EY
}

/** Box drawn on the SCA control chart for this method (method-relative). */
export interface ChartBox {
  eyMin: number;
  eyMax: number;
  tdsMin: number;
  tdsMax: number;
}

export interface MethodSpec {
  id: Method;
  label: string;
  /** Mechanism, one line. */
  mechanism: string;
  filter: FilterType;
  timeScale: TimeScale;
  /** Whether brew time is a free input the brewer sets, or a value *derived*
   *  from grind. Immersion (French press, AeroPress, cold brew) and pressure
   *  espresso (decoupled by pressure, which we don't model) keep it an `input`;
   *  gravity percolation (V60, phin) makes it `derived` — finer grind → more
   *  flow resistance → longer drawdown, so time follows grind and adds no
   *  independent EY (grind already carries the slower-flow effect). See ADR-0006. */
  timeMode: "input" | "derived";
  animation: BrewAnimation;
  defaults: BrewVars;
  ranges: Record<keyof BrewVars, VarRange>;
  /** Coffee dose in grams used to derive the 1:X grams readout. */
  doseGrams: number;
  ey: EyCalibration;
  /** Mass-balance fudge for strength: TDS = EY/ratio × tdsK. Metal/immersion
   *  brewers read slightly stronger (fines + retained water). */
  tdsK: number;
  /** 0–1 body bump from the filter passing oils/fines (metal > paper). */
  filterBody: number;
  /** Crema at the default recipe (espresso only, really). */
  crema: number;
  /** Pro-view chart axis domain + ideal box (method-relative scale). */
  chart: { domain: ChartBox; ideal: ChartBox };
}

// ── Shared scales ───────────────────────────────────────────────────────────
const FILTER_DOMAIN = { eyMin: 14, eyMax: 26, tdsMin: 0.8, tdsMax: 1.8 };
const FILTER_IDEAL = { eyMin: 18, eyMax: 22, tdsMin: 1.15, tdsMax: 1.45 };

// ── CALIBRATION CONTRACT (read before editing `ey` / `chart` / Variable ranges)
// The `ey` swings and per-method `chart` boxes below are tuned so that BOTH:
//   (1) each method's default recipe lands mid-box, and
//   (2) every shipped Featured Recipe (featured-recipes.ts) lands INSIDE its box.
// These are sourced champion recipes — if one reads "over/under-extracted" on the
// chart, the calibration is wrong, not the recipe (see ADR-0005, and research/).
// Design notes baked into the numbers: grind is the dominant EY lever; temp/time
// are gentle (immersion extraction plateaus); strength boxes are method-specific
// because TDS = EY/ratio, so each method's intended ratio sets its strength band.
// If you change any `ey`, `chart`, Variable `ranges`, or a recipe, RE-VERIFY by
// running every recipe through extractFrom() and checking it sits in `chart.ideal`.
export const METHOD_SPECS: Record<Method, MethodSpec> = {
  v60: {
    id: "v60",
    label: "V60",
    mechanism: "Pour-over · percolation",
    filter: "thin-paper",
    timeScale: "minutes",
    timeMode: "derived",
    animation: "pour",
    // time is the derived-drawdown anchor (timeEY=0, so it never moves the chart
    // box): default grind 42 → 3:30, matching where real V60s actually drain and
    // the sourced recipes' contact times. See ADR-0006.
    defaults: { grind: 42, waterTemp: 93, ratio: 16, time: 210, roast: 40 },
    ranges: {
      grind: { min: 0, max: 100, step: 1 },
      waterTemp: { min: 85, max: 96, step: 1 },
      ratio: { min: 14, max: 18, step: 1 },
      time: { min: 90, max: 300, step: 5 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 15,
    // Grind is the dominant EY lever; temp (over a ~6°C window) and time (with
    // diminishing returns) are secondary, so their swings are gentle — otherwise
    // a hot, long, well-dialed recipe (Hoffmann's Ultimate V60) overshoots the
    // 18–22 box. Calibrated so sourced champion recipes land in-box. See ADR-0005.
    ey: { baseEY: 20, grindSwing: 5, tempSwing: 1, timeSwing: 1.5, roastSwing: 2, ratioSwing: 0.8 },
    tdsK: 1.0,
    filterBody: 0.15,
    crema: 0,
    chart: { domain: FILTER_DOMAIN, ideal: FILTER_IDEAL },
  },
  "french-press": {
    id: "french-press",
    label: "French Press",
    mechanism: "Full immersion · metal mesh",
    filter: "metal-mesh",
    timeScale: "minutes",
    timeMode: "input",
    animation: "press",
    defaults: { grind: 78, waterTemp: 94, ratio: 17, time: 240, roast: 45 },
    ranges: {
      grind: { min: 30, max: 100, step: 1 },
      waterTemp: { min: 88, max: 96, step: 1 },
      ratio: { min: 12, max: 18, step: 1 },
      time: { min: 120, max: 600, step: 10 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 30,
    // Immersion extraction plateaus after the first few minutes (Barista Hustle):
    // a long steep is mostly settling, not more extraction, so timeSwing is small.
    // Otherwise Hoffmann's ~9–12 min press reads wildly over-extracted. See ADR-0005.
    ey: { baseEY: 20, grindSwing: 4, tempSwing: 1, timeSwing: 0.8, roastSwing: 2, ratioSwing: 0.8 },
    tdsK: 1.05,
    filterBody: 0.55,
    crema: 0,
    chart: { domain: FILTER_DOMAIN, ideal: FILTER_IDEAL },
  },
  espresso: {
    id: "espresso",
    label: "Espresso",
    mechanism: "9-bar pressure · metal basket",
    filter: "metal-basket",
    timeScale: "seconds",
    // Shot time follows grind only at fixed pressure; pressure is unmodeled and
    // the Soup recipe decouples time via a low-pressure soak, so time stays an input.
    timeMode: "input",
    animation: "pull",
    defaults: { grind: 8, waterTemp: 93, ratio: 2, time: 28, roast: 65 },
    ranges: {
      grind: { min: 0, max: 30, step: 1 },
      waterTemp: { min: 88, max: 96, step: 1 },
      ratio: { min: 1.5, max: 3, step: 0.5 },
      // Up to 60s so long, low-pressure lever shots (Hedrick's 1:3 "soup") fit
      // instead of being pinned to the floor and read as under-extracted.
      time: { min: 18, max: 60, step: 1 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 18,
    ey: { baseEY: 20, grindSwing: 6, tempSwing: 1.5, timeSwing: 3, roastSwing: 2, ratioSwing: 1.5 },
    tdsK: 1.0,
    filterBody: 0.85,
    crema: 0.8,
    // Espresso strength is a ratio-driven style choice spanning ristretto 1:2
    // (~10% TDS) to a long 1:3 (~5–7% TDS); both are well-made espresso. EY
    // (18–22%) is the real quality gate, so the strength box runs the full 5–12%
    // rather than only the classic 1:2 band. See ADR-0005.
    chart: {
      domain: { eyMin: 14, eyMax: 26, tdsMin: 5, tdsMax: 13 },
      ideal: { eyMin: 18, eyMax: 22, tdsMin: 5, tdsMax: 12 },
    },
  },
  aeropress: {
    id: "aeropress",
    label: "AeroPress",
    mechanism: "Hybrid immersion + low pressure",
    filter: "paper-disc",
    timeScale: "seconds",
    timeMode: "input",
    animation: "press",
    defaults: { grind: 32, waterTemp: 85, ratio: 15, time: 90, roast: 40 },
    ranges: {
      grind: { min: 10, max: 80, step: 1 },
      waterTemp: { min: 70, max: 95, step: 1 },
      ratio: { min: 8, max: 17, step: 1 },
      time: { min: 30, max: 180, step: 5 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 15,
    // Hybrid immersion: like the press, contact time plateaus, and its hot-end
    // recipes (Hoffmann ~95°C, long press) would otherwise overshoot. Gentle
    // temp/time swings keep them in-box. See ADR-0005.
    ey: { baseEY: 20, grindSwing: 5, tempSwing: 0.6, timeSwing: 1, roastSwing: 2, ratioSwing: 0.6 },
    tdsK: 1.0,
    filterBody: 0.25,
    crema: 0.05,
    chart: { domain: FILTER_DOMAIN, ideal: FILTER_IDEAL },
  },
  "cold-brew": {
    id: "cold-brew",
    label: "Cold Brew",
    mechanism: "Long cold immersion",
    filter: "cloth-bag",
    timeScale: "hours",
    timeMode: "input",
    animation: "steep",
    // time in seconds: 16h. waterTemp is fridge/room (°C).
    defaults: { grind: 88, waterTemp: 20, ratio: 15, time: 57600, roast: 45 },
    ranges: {
      grind: { min: 50, max: 100, step: 1 },
      waterTemp: { min: 4, max: 25, step: 1 },
      ratio: { min: 8, max: 16, step: 1 },
      time: { min: 21600, max: 86400, step: 3600 }, // 6h–24h, 1h steps
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 60,
    // Cold + long: temperature is weak, time the dominant lever. Cold water
    // extracts less efficiently, so it sits a touch under-centre (baseEY 19) —
    // cold brew tends to run under-extracted relative to the hot-filter box.
    ey: { baseEY: 19, grindSwing: 3.5, tempSwing: 1.5, timeSwing: 3, roastSwing: 2, ratioSwing: 1 },
    tdsK: 1.05,
    filterBody: 0.35,
    crema: 0,
    // A ready-to-drink batch at ~1:11 is stronger than drip, so cold brew gets
    // its own strength box (not the filter band) and a taller TDS domain. See ADR-0005.
    chart: {
      domain: { eyMin: 14, eyMax: 26, tdsMin: 0.8, tdsMax: 2.6 },
      ideal: { eyMin: 18, eyMax: 22, tdsMin: 1.3, tdsMax: 2.2 },
    },
  },
  phin: {
    id: "phin",
    label: "Vietnamese Phin",
    mechanism: "Slow metal drip · percolation",
    filter: "metal-mesh",
    timeScale: "minutes",
    timeMode: "derived",
    animation: "drip",
    // Bold by design: low ratio → high strength. Robusta-leaning dark roast.
    defaults: { grind: 50, waterTemp: 93, ratio: 8, time: 300, roast: 70 },
    ranges: {
      grind: { min: 20, max: 90, step: 1 },
      waterTemp: { min: 88, max: 96, step: 1 },
      ratio: { min: 6, max: 12, step: 1 },
      time: { min: 180, max: 420, step: 10 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 25,
    ey: { baseEY: 20, grindSwing: 4.5, tempSwing: 1.5, timeSwing: 2.5, roastSwing: 2, ratioSwing: 1 },
    tdsK: 1.0,
    filterBody: 0.6,
    crema: 0,
    // Phin runs intensely strong (authentic 1:4–1:6 robusta, served over
    // condensed milk); its box sits high on the TDS axis. See ADR-0005.
    chart: {
      domain: { eyMin: 14, eyMax: 26, tdsMin: 1.2, tdsMax: 4.0 },
      ideal: { eyMin: 18, eyMax: 22, tdsMin: 2.0, tdsMax: 3.6 },
    },
  },
};

export const METHOD_LIST: MethodSpec[] = [
  METHOD_SPECS.v60,
  METHOD_SPECS["french-press"],
  METHOD_SPECS.espresso,
  METHOD_SPECS.aeropress,
  METHOD_SPECS["cold-brew"],
  METHOD_SPECS.phin,
];

export function methodSpec(method: Method): MethodSpec {
  return METHOD_SPECS[method];
}

/** Gravity-percolation drawdown is a consequence of grind, not a free input:
 *  finer grind → more flow resistance → longer contact. Maps the method's grind
 *  position onto its time range, inverted (finer → longer; default grind →
 *  default time). Only meaningful where `timeMode === "derived"`. See ADR-0006. */
export function deriveTime(method: Method, grind: number): number {
  const { defaults: d, ranges: r } = METHOD_SPECS[method];
  const gSpan = grind >= d.grind ? r.grind.max - d.grind : d.grind - r.grind.min;
  const gNorm = gSpan <= 0 ? 0 : (grind - d.grind) / gSpan; // coarse +, fine −
  const tNorm = -gNorm; // finer grind → longer drawdown
  const raw =
    tNorm >= 0 ? d.time + tNorm * (r.time.max - d.time) : d.time + tNorm * (d.time - r.time.min);
  return Math.round(raw / r.time.step) * r.time.step;
}
