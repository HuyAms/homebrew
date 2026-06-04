// Shared domain types for the brewing simulation.
// See CONTEXT.md (glossary) and docs/adr/0001-heuristic-extraction-model.md.

/** Brewing method: apparatus + technique that defines how water meets coffee. */
export type Method =
  | "v60"
  | "french-press"
  | "espresso"
  | "aeropress"
  | "cold-brew"
  | "phin";

/** The five user-adjustable Variables. */
export interface BrewVars {
  /** Grind size: extra-fine (0) → coarse (100). */
  grind: number;
  /** Water temperature in °C (~90–96 for filter). */
  waterTemp: number;
  /** Brew ratio as the water side of 1:N (e.g. 16 = 1:16). */
  ratio: number;
  /** Total brew time in seconds. */
  time: number;
  /** Roast level: light (0) → dark (100). */
  roast: number;
}

/** Technique inputs — a different *kind* of input from a Variable. A Variable
 *  moves the brew's single point on the chart; a Technique moves the *spread*
 *  (Extraction Evenness). Espresso-only at launch. See ADR-0003 & CONTEXT.md. */
export interface Technique {
  /** Puck Prep: 0 sloppy → 1 dialed. Abstracts WDT + level tamp. Never touches
   *  the dose/grind/ratio numbers; it only affects how evenly the bed extracts. */
  puckPrep: number;
}

/** The single Technique knob's name (the only one at launch). */
export type TechniqueKey = keyof Technique;

/** Full input to the Extraction Engine. */
export interface BrewInput extends BrewVars {
  method: Method;
  /** Espresso-only Technique. Absent → assume dialed (perfectly even). */
  technique?: Technique;
}

/** Output of the Evenness module: how uniformly the bed extracted, plus the
 *  under/over EY lobes the Control Chart smears between when evenness is low. */
export interface EvennessResult {
  /** 0 = fully channeling (sour & bitter at once), 1 = perfectly even. */
  evenness: number;
  /** EY of the under-extracted (bypassed) part of the bed. */
  underEY: number;
  /** EY of the over-extracted (fast-channel) part of the bed. */
  overEY: number;
}

/** Where the brew lands on the SCA control chart. */
export interface ExtractionResult {
  /** Extraction Yield %, horizontal axis. Ideal ~18–22. */
  extractionYield: number;
  /** Total Dissolved Solids %, vertical axis (Strength). Ideal ~1.15–1.45. */
  tds: number;
}

/** Five-axis human-readable flavor readout (each ~0–100). */
export interface TasteProfile {
  acidity: number;
  sweetness: number;
  bitterness: number;
  body: number;
  balance: number;
}

/** Visual properties driving the Cup Visualization. */
export interface CupVisual {
  /** Beverage color (CSS color or token). */
  color: string;
  /** Crema amount, 0–1 (espresso-style). */
  crema: number;
  /** Perceived body, 0–1. */
  body: number;
}

export interface TasteResult {
  taste: TasteProfile;
  cup: CupVisual;
}

/** A single recommended adjustment from the Coach. Discriminated on `kind`: most
 *  fixes move a Variable (the dot on the chart); a Channeling complaint instead
 *  prescribes a Technique correction (Puck Prep) — the one fix that is not a
 *  Variable. Apply can write either. See ADR-0003. */
export type Fix =
  | {
      kind: "variable";
      variable: keyof BrewVars;
      /** Direction/amount, e.g. "Grind finer" or "Water 2°C hotter". */
      instruction: string;
      /** The concrete new value to set the Variable to when applied. */
      setValue: number;
    }
  | {
      kind: "technique";
      technique: TechniqueKey;
      /** Plain-language prescription, e.g. "Tighten your puck prep". */
      instruction: string;
      /** The concrete new value to set the Technique to when applied. */
      setValue: number;
    };

export interface CoachResult {
  /** Plain-language read of the cup, e.g. "Tastes sour — under-extracted". */
  diagnosis: string;
  /** The single highest-leverage change (one variable at a time). */
  primaryFix: Fix;
  /** 2–3 alternative single-variable fixes, revealed on demand. */
  alternatives: Fix[];
  /** True when the brew already sits in the ideal box (no change needed). */
  dialedIn: boolean;
}

/** Reverse-mode taste complaint. Most map 1:1 to a control-chart direction; one
 *  ("harsh") does not — it is the sour-and-bitter-at-once signature of low
 *  Extraction Evenness (Channeling) and prescribes Puck Prep, not a Variable. */
export type TasteComplaint =
  | "sour" // under-extracted
  | "bitter" // over-extracted
  | "weak" // low TDS
  | "too-strong" // high TDS
  | "just-right" // in the ideal box
  | "harsh"; // sour & bitter at once — channeling (espresso only)
