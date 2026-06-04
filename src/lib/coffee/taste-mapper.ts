// Taste Mapper — deep module (pure, no UI).
//
// Turns a control-chart position into a five-axis Taste Profile and the Cup
// Visualization properties, derived from distance/direction relative to the
// ideal extraction zone (under-extracted → sour↑/sweet↓; over-extracted →
// bitter↑; low TDS → thin body; etc.).
//
// See CONTEXT.md and the PRD. Implemented in a later slice.

import type { ExtractionResult, Method, TasteResult } from "./types";

export interface TasteMapperInput extends ExtractionResult {
  roast: number;
  method: Method;
}

export function mapTaste(_input: TasteMapperInput): TasteResult {
  throw new Error("Taste Mapper not implemented yet");
}
