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
import { CHANNELING_THRESHOLD, DIALED, hasEvenness } from "./evenness";
import { whyFix } from "./variable-info";

export interface CoachInput extends ExtractionResult {
  method: Method;
  currentVars: BrewVars;
  /** Extraction Evenness (espresso). When low, channeling outranks any position
   *  fault: the prescription is Puck Prep, not a Variable ("fix prep, not grind"). */
  evenness?: number;
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
  return { kind: "variable", variable, instruction: instruction(variable, dir, method, setValue), setValue };
}

/** The one fix that is not a Variable: dial in the puck prep. Prescribed for the
 *  Channeling signature (sour & bitter at once) — "fix prep, not grind". */
function puckPrepFix(): Fix {
  return {
    kind: "technique",
    technique: "puckPrep",
    instruction: "Tighten your puck prep — WDT + level tamp",
    setValue: DIALED,
  };
}

/** Channeling prescription: the same single Puck Prep fix, with no Variable
 *  alternatives (the whole point is that no grind number fixes it). */
function prescribeChanneling(diagnosis: string): CoachResult {
  return {
    diagnosis,
    comment: "Whoa — sour and bitter at the same time? Water's channeling through the puck. Fix the prep, not the grind.",
    dialedIn: false,
    primaryFix: puckPrepFix(),
    alternatives: [],
    why: "Sour and bitter at once means water punched a fast channel through the bed — part of the puck over-extracts (bitter) while the bypassed rest barely extracts (sour). No grind number evens that out; redistribute the grounds and tamp level (WDT + a level tamp).",
  };
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

// The clinical read — shown in the Verdict section.
const DIAGNOSIS: Record<Direction, string> = {
  "raise-ey": "Tastes sour — under-extracted",
  "lower-ey": "Tastes bitter — over-extracted",
  "raise-tds": "Weak & watery — low strength",
  "lower-tds": "Too strong — high strength",
  ok: "Dialed in — sweet & balanced",
};

// A friend's casual take on the same cup — shown under the cup after a brew.
// Warmer than the diagnosis, but still names the cause so the lesson lands.
const COMMENT: Record<Direction, string> = {
  "raise-ey": "Ooh, that's a sharp sip — comes off a little sour. Under-extracted.",
  "lower-ey": "Mm, bites a bit bitter on the finish — pushed too far. Over-extracted.",
  "raise-tds": "Hmm, kinda thin and watery, this one — it's brewing weak.",
  "lower-tds": "Whoa — that's a punchy, heavy cup. Brewed a touch too strong.",
  ok: "Oh, that's a lovely cup — sweet and nicely balanced. ☕",
};

function prescribe(dir: Direction, method: Method, vars: BrewVars): CoachResult {
  if (dir === "ok") {
    return {
      diagnosis: DIAGNOSIS.ok,
      comment: COMMENT.ok,
      dialedIn: true,
      primaryFix: { kind: "variable", variable: "ratio", instruction: "No change — enjoy it", setValue: vars.ratio },
      alternatives: [],
      why: "",
    };
  }
  const levers = leversFor(dir);
  const fixes = levers.map((l) => makeFix(l.variable, l.sign, method, vars));
  return {
    diagnosis: DIAGNOSIS[dir],
    comment: COMMENT[dir],
    dialedIn: false,
    primaryFix: fixes[0],
    alternatives: fixes.slice(1),
    // The reasoning behind the primary fix, from the same content source as the
    // per-Variable info icons (single source — issue #8).
    why: whyFix(levers[0].variable, levers[0].sign),
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

/** Forward mode: coach from where the brew currently sits. Low Extraction
 *  Evenness (espresso) outranks any position fault — channeling is a Technique
 *  problem, so the Verdict flips to "fix prep, not grind". */
export function coach(input: CoachInput): CoachResult {
  if (
    hasEvenness(input.method) &&
    input.evenness !== undefined &&
    input.evenness < CHANNELING_THRESHOLD
  ) {
    return prescribeChanneling("Uneven extraction — fix prep, not grind");
  }
  const dir = classify(
    { extractionYield: input.extractionYield, tds: input.tds },
    input.method,
  );
  return prescribe(dir, input.method, input.currentVars);
}

// Every complaint except "harsh" maps 1:1 to a chart direction. "harsh" (sour &
// bitter at once) is not a chart position — it is Channeling, handled separately.
const COMPLAINT_DIR: Record<Exclude<TasteComplaint, "harsh">, Direction> = {
  sour: "raise-ey",
  bitter: "lower-ey",
  weak: "raise-tds",
  "too-strong": "lower-tds",
  "just-right": "ok",
};

/** Reverse mode ("Fix my cup"): coach from a taste complaint. "harsh" prescribes
 *  Puck Prep (the only complaint whose fix is a Technique, not a Variable). */
export function coachFromComplaint(
  complaint: TasteComplaint,
  method: Method,
  currentVars: BrewVars,
): CoachResult {
  if (complaint === "harsh") {
    return prescribeChanneling("Sour & bitter at once — channeling");
  }
  return prescribe(COMPLAINT_DIR[complaint], method, currentVars);
}
