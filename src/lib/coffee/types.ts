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

/** Full input to the Extraction Engine. */
export interface BrewInput extends BrewVars {
  method: Method;
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
  sourness: number;
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

/** A single recommended adjustment from the Coach. */
export interface Fix {
  variable: keyof BrewVars;
  /** Direction/amount, e.g. "grind one step finer" or "+2°C". */
  instruction: string;
}

export interface CoachResult {
  primaryFix: Fix;
  alternatives: Fix[];
}

/** Reverse-mode taste complaint; maps 1:1 to control-chart directions. */
export type TasteComplaint =
  | "sour" // under-extracted
  | "bitter" // over-extracted
  | "weak" // low TDS
  | "too-strong" // high TDS
  | "just-right"; // in the ideal box
