// Brew state ⇄ URL search params. The URL is the shareable, refresh-safe record
// of the playground: method, the five Variables, mode, Pro view and °C/°F. We
// use the native History API (the app is a single-screen SPA) and `replaceState`
// so tweaking knobs doesn't spam the back-stack.
import type { BrewVars, Method } from "@/lib/coffee/types";
import { METHOD_SPECS, methodSpec } from "@/lib/coffee/methods";
import { defaultVars, type TempUnit } from "./config";

export type Mode = "forward" | "reverse";

export interface PersistState {
  method: Method;
  vars: BrewVars;
  mode: Mode;
  pro: boolean;
  unit: TempUnit;
  brewed: boolean;
}

const isMethod = (v: string | null): v is Method => v != null && v in METHOD_SPECS;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Parse + clamp one Variable to the method's range, snapped to its step. */
function readVar(p: URLSearchParams, key: string, method: Method, varKey: keyof BrewVars): number {
  const raw = p.get(key);
  const fallback = defaultVars(method)[varKey];
  if (raw == null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const r = methodSpec(method).ranges[varKey];
  return clamp(Math.round(n / r.step) * r.step, r.min, r.max);
}

export function readState(): PersistState {
  const empty: PersistState = {
    method: "v60",
    vars: defaultVars("v60"),
    mode: "forward",
    pro: false,
    unit: "C",
    brewed: false,
  };
  if (typeof window === "undefined") return empty;

  const p = new URLSearchParams(window.location.search);
  const method = isMethod(p.get("m")) ? (p.get("m") as Method) : "v60";

  return {
    method,
    vars: {
      grind: readVar(p, "g", method, "grind"),
      waterTemp: readVar(p, "w", method, "waterTemp"),
      ratio: readVar(p, "r", method, "ratio"),
      time: readVar(p, "t", method, "time"),
      roast: readVar(p, "ro", method, "roast"),
    },
    mode: p.get("mode") === "reverse" ? "reverse" : "forward",
    pro: p.get("pro") === "1",
    unit: p.get("u") === "F" ? "F" : "C",
    brewed: p.get("b") === "1",
  };
}

export function writeState(s: PersistState): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("m", s.method);
  p.set("g", String(s.vars.grind));
  p.set("w", String(s.vars.waterTemp));
  p.set("r", String(s.vars.ratio));
  p.set("t", String(s.vars.time));
  p.set("ro", String(s.vars.roast));
  if (s.mode === "reverse") p.set("mode", "reverse");
  if (s.pro) p.set("pro", "1");
  if (s.unit === "F") p.set("u", "F");
  if (s.brewed) p.set("b", "1");
  const url = `${window.location.pathname}?${p.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", url);
}
