// Coach — deep module (pure, no UI).
//
// Picks the single highest-leverage Variable to change and the direction/amount
// (one variable at a time, per Rao/Hoffmann technique). The same module powers
// Reverse mode ("Fix my cup"): a taste complaint maps 1:1 to a chart direction
// and yields the recommended adjustment for the current method.
//
// See CONTEXT.md and the PRD. Implemented in a later slice.

import type {
  CoachResult,
  ExtractionResult,
  Method,
  BrewVars,
  TasteComplaint,
} from "./types";

export interface CoachInput extends ExtractionResult {
  method: Method;
  currentVars: BrewVars;
}

/** Forward mode: coach from where the brew currently sits. */
export function coach(_input: CoachInput): CoachResult {
  throw new Error("Coach not implemented yet");
}

/** Reverse mode ("Fix my cup"): coach from a taste complaint. */
export function coachFromComplaint(
  _complaint: TasteComplaint,
  _method: Method,
  _currentVars: BrewVars,
): CoachResult {
  throw new Error("Coach (reverse mode) not implemented yet");
}
