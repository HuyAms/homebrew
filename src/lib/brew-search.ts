// Brew search schema — the shape of the playground's state as TanStack Router
// search params, which are the single source of truth (shareable + refresh-safe).
// Framework-agnostic: the router wires `validateBrewSearch` into the route's
// `validateSearch`, and the Playground reads/writes this object.
import type { BrewVars, Method } from "./coffee/types";
import { METHOD_SPECS, methodSpec } from "./coffee/methods";

export type Mode = "forward" | "reverse";
export type TempUnit = "C" | "F";

export interface BrewSearch extends BrewVars {
  method: Method;
  mode: Mode;
  /** Pro view (control chart) visible. */
  pro: boolean;
  /** Temperature unit for display. */
  unit: TempUnit;
  /** Whether the current recipe has been brewed (reveals cup/taste/verdict). */
  brewed: boolean;
}

const isMethod = (v: unknown): v is Method => typeof v === "string" && v in METHOD_SPECS;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function num(raw: unknown, fallback: number): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function bool(raw: unknown): boolean {
  return raw === true || raw === "true" || raw === 1 || raw === "1";
}

/** Clamp + snap one Variable to the method's range. */
function readVar(raw: unknown, method: Method, key: keyof BrewVars): number {
  const r = methodSpec(method).ranges[key];
  const fallback = methodSpec(method).defaults[key];
  const v = num(raw, fallback);
  return clamp(Math.round(v / r.step) * r.step, r.min, r.max);
}

/** Coerce + validate raw search params into a fully-populated BrewSearch. Used
 *  as the route's `validateSearch`, so the rest of the app gets a typed,
 *  in-range object regardless of what's in the URL. */
export function validateBrewSearch(raw: Record<string, unknown>): BrewSearch {
  const method: Method = isMethod(raw.method) ? raw.method : "v60";
  return {
    method,
    grind: readVar(raw.grind, method, "grind"),
    waterTemp: readVar(raw.waterTemp, method, "waterTemp"),
    ratio: readVar(raw.ratio, method, "ratio"),
    time: readVar(raw.time, method, "time"),
    roast: readVar(raw.roast, method, "roast"),
    mode: raw.mode === "reverse" ? "reverse" : "forward",
    pro: bool(raw.pro),
    unit: raw.unit === "F" ? "F" : "C",
    brewed: bool(raw.brewed),
  };
}

/** Default search for a method (used when switching methods). */
export function defaultSearchVars(method: Method): BrewVars {
  return { ...methodSpec(method).defaults };
}
