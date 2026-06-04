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

export const METHOD_SPECS: Record<Method, MethodSpec> = {
  v60: {
    id: "v60",
    label: "V60",
    mechanism: "Pour-over · percolation",
    filter: "thin-paper",
    timeScale: "minutes",
    animation: "pour",
    defaults: { grind: 42, waterTemp: 93, ratio: 16, time: 165, roast: 40 },
    ranges: {
      grind: { min: 0, max: 100, step: 1 },
      waterTemp: { min: 85, max: 96, step: 1 },
      ratio: { min: 14, max: 18, step: 1 },
      time: { min: 90, max: 300, step: 5 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 15,
    ey: { baseEY: 20, grindSwing: 5, tempSwing: 3, timeSwing: 4, roastSwing: 2.5, ratioSwing: 1 },
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
    // Immersion: grind acts via surface area only (gentler), time matters more.
    ey: { baseEY: 20, grindSwing: 4, tempSwing: 2.5, timeSwing: 5, roastSwing: 2.5, ratioSwing: 1 },
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
    animation: "pull",
    defaults: { grind: 8, waterTemp: 93, ratio: 2, time: 28, roast: 65 },
    ranges: {
      grind: { min: 0, max: 30, step: 1 },
      waterTemp: { min: 88, max: 96, step: 1 },
      ratio: { min: 1.5, max: 3, step: 0.5 },
      time: { min: 18, max: 40, step: 1 },
      roast: { min: 0, max: 100, step: 1 },
    },
    doseGrams: 18,
    ey: { baseEY: 20, grindSwing: 6, tempSwing: 2, timeSwing: 4, roastSwing: 2, ratioSwing: 1.5 },
    tdsK: 1.0,
    filterBody: 0.85,
    crema: 0.8,
    chart: {
      domain: { eyMin: 14, eyMax: 26, tdsMin: 5, tdsMax: 13 },
      ideal: { eyMin: 18, eyMax: 22, tdsMin: 8, tdsMax: 12 },
    },
  },
  aeropress: {
    id: "aeropress",
    label: "AeroPress",
    mechanism: "Hybrid immersion + low pressure",
    filter: "paper-disc",
    timeScale: "seconds",
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
    ey: { baseEY: 20, grindSwing: 5, tempSwing: 3, timeSwing: 4, roastSwing: 2.5, ratioSwing: 1 },
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
    // Cold + long: temperature is weak, time is the dominant lever.
    ey: { baseEY: 20, grindSwing: 3.5, tempSwing: 1.5, timeSwing: 5, roastSwing: 2, ratioSwing: 1 },
    tdsK: 1.05,
    filterBody: 0.35,
    crema: 0,
    chart: { domain: FILTER_DOMAIN, ideal: FILTER_IDEAL },
  },
  phin: {
    id: "phin",
    label: "Vietnamese Phin",
    mechanism: "Slow metal drip · percolation",
    filter: "metal-mesh",
    timeScale: "minutes",
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
    ey: { baseEY: 20, grindSwing: 4.5, tempSwing: 2.5, timeSwing: 4, roastSwing: 2.5, ratioSwing: 1 },
    tdsK: 1.0,
    filterBody: 0.6,
    crema: 0,
    // Phin runs strong; its box sits high on the TDS axis.
    chart: {
      domain: { eyMin: 14, eyMax: 26, tdsMin: 1.2, tdsMax: 3.2 },
      ideal: { eyMin: 18, eyMax: 22, tdsMin: 2.0, tdsMax: 2.8 },
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
