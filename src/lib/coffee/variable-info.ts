// Variable info — the single plain-language content source behind both the
// per-Variable info icons and the Verdict's "Why?" expander (issue #8). Each
// Variable carries: what it is, and what raising / lowering it does to the cup.
// `whyFix` reads the same content so the Verdict's reasoning and the slider
// tooltips never drift apart. Sourced from research/ (cited per field), never
// invented — see CONTEXT.md and the research notes.
import type { BrewVars } from "./types";

export interface VariableInfo {
  /** Plain-language "what is this Variable". */
  what: string;
  /** What raising it (slider →) does. */
  raise: string;
  /** What lowering it (slider ←) does. */
  lower: string;
}

export const VARIABLE_INFO: Record<keyof BrewVars, VariableInfo> = {
  grind: {
    what: "How fine or coarse the grounds are — the primary lever on Extraction Yield.",
    // higher value = coarser
    raise:
      "Coarser grounds expose less surface area and let water flow faster, so less dissolves — the cup drifts toward sour / under-extracted. (research/01)",
    lower:
      "Finer grounds expose far more surface area and slow the flow, so more dissolves — the cup drifts toward bitter / over-extracted. (research/01)",
  },
  waterTemp: {
    what: "How hot the brew water is. SCA filter range ~90–96°C.",
    raise:
      "Hotter water extracts faster and higher — pushes toward bitter if it gets too hot. (research/02, 05)",
    lower:
      "Cooler water extracts slower and lower — pulls toward sour if it gets too cool. (research/02, 05)",
  },
  ratio: {
    what: "Coffee dose relative to water (1:X). The lever for Strength (TDS), largely independent of extraction.",
    // higher ratio number = more water
    raise:
      "More water per gram of coffee — a weaker, thinner, lower-strength cup. (research/03)",
    lower:
      "Less water per gram of coffee — a stronger, more concentrated cup. (research/03)",
  },
  time: {
    what: "Total contact time between water and coffee.",
    raise:
      "Longer contact dissolves more (with diminishing returns) — pushes toward bitter / over-extracted. (research/04)",
    lower:
      "Shorter contact dissolves less — pulls toward sour / under-extracted. (research/04)",
  },
  roast: {
    what: "How dark the beans are roasted (light ↔ dark).",
    // higher value = darker
    raise:
      "Darker roasts are more soluble and porous, so they extract faster (landing further right on the chart) and taste flatter, less acidic. (research/06)",
    lower:
      "Lighter roasts are brighter and more acidic, and extract more slowly. (research/06)",
  },
};

/** The reasoning behind a prescribed fix: the effect text for the direction the
 *  fix moves that Variable. `sign` is +1 to raise the value, −1 to lower it
 *  (matching the Coach's levers). This is what the Verdict's "Why?" reveals. */
export function whyFix(variable: keyof BrewVars, sign: 1 | -1): string {
  return sign === 1 ? VARIABLE_INFO[variable].raise : VARIABLE_INFO[variable].lower;
}
