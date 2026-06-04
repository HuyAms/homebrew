// Method list + the five Variable definitions for the Playground.
// See CONTEXT.md (glossary) for the domain terms.
import type { BrewVars, Method } from "@/lib/coffee/types";

export interface MethodMeta {
  id: Method;
  label: string;
  blurb: string;
}

export const METHODS: MethodMeta[] = [
  { id: "v60", label: "V60", blurb: "Pour-over · percolation" },
  { id: "french-press", label: "French Press", blurb: "Full immersion" },
  { id: "espresso", label: "Espresso", blurb: "9-bar pressure" },
  { id: "aeropress", label: "AeroPress", blurb: "Hybrid press" },
  { id: "cold-brew", label: "Cold Brew", blurb: "Long cold steep" },
  { id: "phin", label: "Vietnamese Phin", blurb: "Slow metal drip" },
];

export interface VarMeta {
  key: keyof BrewVars;
  label: string;
  min: number;
  max: number;
  step: number;
  low: string;
  high: string;
  fmt: (v: number) => string;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export const VARS: VarMeta[] = [
  { key: "grind", label: "Grind Size", min: 0, max: 100, step: 1, low: "Fine", high: "Coarse", fmt: (v) => (v < 33 ? "Fine" : v < 66 ? "Medium" : "Coarse") },
  { key: "waterTemp", label: "Water Temp", min: 80, max: 100, step: 1, low: "Cool", high: "Hot", fmt: (v) => `${v}°C` },
  { key: "ratio", label: "Brew Ratio", min: 10, max: 20, step: 1, low: "Strong", high: "Light", fmt: (v) => `1:${v}` },
  { key: "time", label: "Brew Time", min: 30, max: 360, step: 5, low: "Short", high: "Long", fmt: mmss },
  { key: "roast", label: "Roast Level", min: 0, max: 100, step: 1, low: "Light", high: "Dark", fmt: (v) => (v < 33 ? "Light" : v < 66 ? "Medium" : "Dark") },
];

export const DEFAULT_VARS: BrewVars = { grind: 45, waterTemp: 94, ratio: 16, time: 165, roast: 40 };

/** Roast + ratio → a believable cup liquid color for the visualization. */
export function cupColor(roast: number, ratio: number): string {
  const strength = 100 - (ratio - 10) * 10;
  const l = 38 - roast * 0.14 - strength * 0.04;
  return `oklch(${(Math.max(18, l) / 100).toFixed(3)} 0.07 60)`;
}
