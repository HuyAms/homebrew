// Coach — deep module (pure, no UI).
//
// Picks the single highest-leverage Variable to change and the direction/amount
// (one variable at a time, per Rao/Hoffmann technique). The same module powers
// Reverse mode ("Fix my cup"): a taste complaint maps 1:1 to a chart direction
// and yields the recommended adjustment for the current method. Forward and
// Reverse share one prescription engine, so the advice is always consistent.
//
// See CONTEXT.md.
import type {
  CoachResult,
  ExtractionResult,
  Fix,
  Method,
  BrewVars,
  TasteComplaint,
} from "./types";
import { methodSpec, type VarRange } from "./methods";

export interface CoachInput extends ExtractionResult {
  method: Method;
  currentVars: BrewVars;
}

/** The four single-axis corrections, plus "already there". */
type Direction = "raise-ey" | "lower-ey" | "raise-tds" | "lower-tds" | "ok";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/** Build a concrete Fix for `variable`, nudged by `dir` (±1) a sensible step. */
function makeFix(
  variable: keyof BrewVars,
  dir: 1 | -1,
  method: Method,
  vars: BrewVars,
): Fix {
  const spec = methodSpec(method);
  const range: VarRange = spec.ranges[variable];
  const current = vars[variable];
  const span = range.max - range.min;

  let rawDelta: number;
  switch (variable) {
    case "grind":
      rawDelta = Math.max(3, Math.round(span * 0.1));
      break;
    case "waterTemp":
      rawDelta = 2;
      break;
    case "time":
      rawDelta = Math.max(range.step, roundTo(span * 0.12, range.step));
      break;
    case "ratio":
      rawDelta = range.step;
      break;
    case "roast":
      rawDelta = 12;
      break;
  }

  const setValue = clamp(roundTo(current + dir * rawDelta, range.step), range.min, range.max);
  return { variable, instruction: instruction(variable, dir, method, setValue), setValue };
}

function instruction(variable: keyof BrewVars, dir: 1 | -1, method: Method, setValue: number): string {
  switch (variable) {
    case "grind":
      return dir < 0 ? "Grind finer" : "Grind coarser";
    case "waterTemp":
      return dir > 0 ? "Brew hotter (water up)" : "Brew cooler (water down)";
    case "time":
      return dir > 0 ? "Steep longer" : "Steep shorter";
    case "ratio":
      // Lower ratio number = more coffee per water = stronger.
      return dir < 0 ? `More coffee — ratio 1:${setValue}` : `More water — ratio 1:${setValue}`;
    case "roast":
      return dir > 0 ? "Use a darker roast" : "Use a lighter roast";
  }
  // Unreachable, but keeps the type checker happy.
  void method;
  return "";
}

/** Levers for each correction, in priority order. First = primary fix. */
function leversFor(dir: Exclude<Direction, "ok">): { variable: keyof BrewVars; sign: 1 | -1 }[] {
  switch (dir) {
    case "raise-ey": // under-extracted / sour → extract more
      return [
        { variable: "grind", sign: -1 },
        { variable: "waterTemp", sign: 1 },
        { variable: "time", sign: 1 },
      ];
    case "lower-ey": // over-extracted / bitter → extract less
      return [
        { variable: "grind", sign: 1 },
        { variable: "waterTemp", sign: -1 },
        { variable: "time", sign: -1 },
      ];
    case "raise-tds": // weak / watery → stronger (ratio is the strength lever)
      return [
        { variable: "ratio", sign: -1 },
        { variable: "grind", sign: -1 },
      ];
    case "lower-tds": // too strong → weaker
      return [
        { variable: "ratio", sign: 1 },
        { variable: "grind", sign: 1 },
      ];
  }
}

const DIAGNOSIS: Record<Direction, string> = {
  "raise-ey": "Tastes sour — under-extracted",
  "lower-ey": "Tastes bitter — over-extracted",
  "raise-tds": "Weak & watery — low strength",
  "lower-tds": "Too strong — high strength",
  ok: "Dialed in — sweet & balanced",
};

function prescribe(dir: Direction, method: Method, vars: BrewVars): CoachResult {
  if (dir === "ok") {
    return {
      diagnosis: DIAGNOSIS.ok,
      dialedIn: true,
      primaryFix: { variable: "ratio", instruction: "No change — enjoy it", setValue: vars.ratio },
      alternatives: [],
    };
  }
  const levers = leversFor(dir);
  const fixes = levers.map((l) => makeFix(l.variable, l.sign, method, vars));
  return {
    diagnosis: DIAGNOSIS[dir],
    dialedIn: false,
    primaryFix: fixes[0],
    alternatives: fixes.slice(1),
  };
}

/** Classify where the brew sits relative to the method's ideal box. Extraction
 *  faults (sour/bitter) take priority over strength faults. */
function classify(result: ExtractionResult, method: Method): Direction {
  const { ideal } = methodSpec(method).chart;
  if (result.extractionYield < ideal.eyMin) return "raise-ey";
  if (result.extractionYield > ideal.eyMax) return "lower-ey";
  if (result.tds < ideal.tdsMin) return "raise-tds";
  if (result.tds > ideal.tdsMax) return "lower-tds";
  return "ok";
}

/** Forward mode: coach from where the brew currently sits. */
export function coach(input: CoachInput): CoachResult {
  const dir = classify(
    { extractionYield: input.extractionYield, tds: input.tds },
    input.method,
  );
  return prescribe(dir, input.method, input.currentVars);
}

const COMPLAINT_DIR: Record<TasteComplaint, Direction> = {
  sour: "raise-ey",
  bitter: "lower-ey",
  weak: "raise-tds",
  "too-strong": "lower-tds",
  "just-right": "ok",
};

/** Reverse mode ("Fix my cup"): coach from a taste complaint. */
export function coachFromComplaint(
  complaint: TasteComplaint,
  method: Method,
  currentVars: BrewVars,
): CoachResult {
  return prescribe(COMPLAINT_DIR[complaint], method, currentVars);
}
