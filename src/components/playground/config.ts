// Playground config: the Variable display metadata + unit formatting. Ranges
// and defaults come from the Method Registry (src/lib/coffee/methods.ts) so each
// method loads its own knobs; this file owns labels, captions and how values
// render (°C/°F, 1:X + grams, min:sec / hours).
import type { BrewVars, Method } from "@/lib/coffee/types";
import { METHOD_LIST, methodSpec, type TimeScale, type VarRange } from "@/lib/coffee/methods";
import { grindLabel } from "@/lib/coffee/grind";

export interface MethodMeta {
  id: Method;
  label: string;
  blurb: string;
}

export const METHODS: MethodMeta[] = METHOD_LIST.map((m) => ({
  id: m.id,
  label: m.label,
  blurb: m.mechanism,
}));

export interface VarMeta {
  key: keyof BrewVars;
  label: string;
  /** caption under the low (left) end of the slider */
  low: string;
  /** caption under the high (right) end of the slider */
  high: string;
}

export const VAR_META: VarMeta[] = [
  { key: "grind", label: "Grind Size", low: "Fine", high: "Coarse" },
  { key: "waterTemp", label: "Water Temp", low: "Cool", high: "Hot" },
  { key: "ratio", label: "Brew Ratio", low: "Strong", high: "Light" },
  { key: "time", label: "Brew Time", low: "Short", high: "Long" },
  { key: "roast", label: "Roast Level", low: "Light", high: "Dark" },
];

/** The five adjustable ranges for a method, in VAR_META order. */
export function varRanges(method: Method): Record<keyof BrewVars, VarRange> {
  return methodSpec(method).ranges;
}

export function defaultVars(method: Method): BrewVars {
  return { ...methodSpec(method).defaults };
}

export type TempUnit = "C" | "F";

// ── formatters ───────────────────────────────────────────────────────────────
const cToF = (c: number) => Math.round((c * 9) / 5 + 32);

export function fmtTemp(c: number, unit: TempUnit): string {
  return unit === "C" ? `${Math.round(c)}°C` : `${cToF(c)}°F`;
}

export function fmtTime(seconds: number, scale: TimeScale): string {
  if (scale === "hours") {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  if (scale === "seconds") return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtRatio(n: number): string {
  return `1:${Number.isInteger(n) ? n : n.toFixed(1)}`;
}

/** The 1:X ratio expressed as dose grams : water grams for the method. */
export function ratioGrams(method: Method, ratio: number): string {
  const dose = methodSpec(method).doseGrams;
  return `${dose}g : ${Math.round(dose * ratio)}g`;
}

export function fmtRoast(v: number): string {
  return v < 33 ? "Light" : v < 66 ? "Medium" : "Dark";
}

/** Puck Prep (Technique) readout: 0 sloppy → 1 dialed. */
export function fmtPuckPrep(v: number): string {
  return v < 0.25 ? "Sloppy" : v < 0.55 ? "Loose" : v < 0.8 ? "Even" : "Dialed";
}

/** One-call value formatter used by the sliders. */
export function fmtVar(
  key: keyof BrewVars,
  value: number,
  ctx: { method: Method; tempUnit: TempUnit },
): string {
  switch (key) {
    case "grind":
      return grindLabel(value);
    case "waterTemp":
      return fmtTemp(value, ctx.tempUnit);
    case "ratio":
      return fmtRatio(value);
    case "time":
      return fmtTime(value, methodSpec(ctx.method).timeScale);
    case "roast":
      return fmtRoast(value);
  }
}

/** Lightweight live cup colour for the pour stream / pre-brew preview (the real
 *  brewed colour comes from the Taste Mapper's CupVisual). */
export function cupColor(roast: number, ratio: number): string {
  const strength = 100 - (ratio - 10) * 10;
  const l = 38 - roast * 0.14 - strength * 0.04;
  return `oklch(${(Math.max(18, l) / 100).toFixed(3)} 0.07 60)`;
}
