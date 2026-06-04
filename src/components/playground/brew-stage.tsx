// Result stage: the chosen brewer sits ABOVE the cup and, on Brew, drips coffee
// down into it while the cup fills. VarStrip mirrors the five Variable visuals
// beside the cup.
import { motion } from "motion/react";
import type { BrewVars, Method } from "@/lib/coffee/types";
import { VARS } from "./config";
import { MethodArt, VarViz, type VizTheme } from "./visuals";

export interface BrewStageProps {
  method: Method;
  theme: VizTheme;
  liquid: string;
  brewing: boolean;
  brewed: boolean;
  cupBody: string;
  cupRim: string;
  brewMs?: number;
}

export function BrewStage({ method, theme, liquid, brewing, brewed, cupBody, cupRim, brewMs = 2200 }: BrewStageProps) {
  const target = brewing || brewed ? 0.9 : 0.12;
  return (
    <div className="relative flex select-none flex-col items-center">
      <MethodArt method={method} theme={theme} hideVessel className="h-24 w-24" />

      <div className="relative -mt-1 h-5 w-4">
        {brewing &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-0 h-2.5 w-1 -translate-x-1/2 rounded-full"
              style={{ background: liquid }}
              animate={{ y: [0, 20], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.18, ease: "easeIn" }}
            />
          ))}
      </div>

      <div className="relative -mt-1">
        <div className="relative h-40 w-44 overflow-hidden rounded-b-[5rem] rounded-t-2xl border-4" style={{ borderColor: cupRim, background: cupBody }}>
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{ background: liquid }}
            initial={false}
            animate={{ height: `${target * 100}%` }}
            transition={{ duration: brewing ? brewMs / 1000 : 0.45, ease: "easeOut" }}
          />
          {(brewing || brewed) && (
            <motion.div
              className="absolute inset-x-4 h-2 rounded-full opacity-50"
              style={{ background: "#F0D9B5" }}
              initial={false}
              animate={{ bottom: `calc(${target * 100}% - 6px)` }}
              transition={{ duration: brewing ? brewMs / 1000 : 0.45, ease: "easeOut" }}
            />
          )}
        </div>
        <div className="absolute -right-7 top-9 h-16 w-9 rounded-r-full border-4" style={{ borderColor: cupRim }} />
      </div>
    </div>
  );
}

export interface StripTone {
  chipBg: string;
  value: string;
}

export function VarStrip({ vars, theme, tone }: { vars: BrewVars; theme: VizTheme; tone: StripTone }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-2">
      {VARS.map((v) => (
        <div key={v.key} className="flex w-12 flex-col items-center gap-1">
          <div className="size-10 overflow-hidden rounded-lg" style={{ background: tone.chipBg }}>
            <VarViz varKey={v.key} value={vars[v.key]} theme={theme} range={{ min: v.min, max: v.max }} />
          </div>
          <span className="text-center text-[10px] font-semibold leading-none tabular-nums" style={{ color: tone.value }}>
            {v.fmt(vars[v.key])}
          </span>
        </div>
      ))}
    </div>
  );
}
