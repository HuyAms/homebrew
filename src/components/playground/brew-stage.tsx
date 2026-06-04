// Result stage: the chosen brewer sits ABOVE the cup and, on Brew, plays a
// method-specific animation (pour / drip / press / pull / steep) while the cup
// fills. Once brewed, the cup shows the real CupVisual (colour, crema, body)
// from the Taste Mapper. VarStrip mirrors the five Variable visuals beside it.
import { motion } from "motion/react";
import type { BrewVars, CupVisual, Method } from "@/lib/coffee/types";
import { methodSpec, type BrewAnimation } from "@/lib/coffee/methods";
import { VAR_META, varRanges, fmtVar, type TempUnit } from "./config";
import { MethodArt, VarViz, type VizTheme } from "./visuals";

export interface BrewStageProps {
  method: Method;
  theme: VizTheme;
  /** Live pour colour (pre-brew preview). */
  liquid: string;
  brewing: boolean;
  brewed: boolean;
  /** The brewed cup (colour/crema/body). Overrides `liquid` once brewed. */
  cup?: CupVisual;
  cupBody: string;
  cupRim: string;
  brewMs?: number;
}

export function BrewStage({ method, theme, liquid, brewing, brewed, cup, cupBody, cupRim, brewMs = 2200 }: BrewStageProps) {
  const anim: BrewAnimation = methodSpec(method).animation;
  const fillColor = brewed && cup ? cup.color : liquid;
  const target = brewing || brewed ? 0.9 : 0.12;
  const crema = brewed && cup ? cup.crema : anim === "pull" ? 0.4 : 0;

  return (
    <div className="relative flex select-none flex-col items-center">
      {/* the brewer; on a press it nudges down as if plunged */}
      <motion.div
        animate={brewing && anim === "press" ? { y: [0, 6, 4] } : { y: 0 }}
        transition={{ duration: brewMs / 1000, ease: "easeInOut" }}
      >
        <MethodArt method={method} theme={theme} hideVessel className="h-24 w-24" />
      </motion.div>

      <DripLayer anim={anim} color={fillColor} brewing={brewing} />

      <div className="relative -mt-1">
        <div className="relative h-40 w-44 overflow-hidden rounded-b-[5rem] rounded-t-2xl border-4" style={{ borderColor: cupRim, background: cupBody }}>
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{ background: fillColor }}
            initial={false}
            animate={{ height: `${target * 100}%` }}
            transition={{ duration: brewing ? brewMs / 1000 : 0.45, ease: "easeOut" }}
          />
          {/* crema / foam cap */}
          {(brewing || brewed) && crema > 0 && (
            <motion.div
              className="absolute inset-x-2 rounded-full"
              style={{ background: "#C9A26A", height: `${6 + crema * 16}px` }}
              initial={false}
              animate={{ bottom: `calc(${target * 100}% - ${3 + crema * 8}px)`, opacity: 0.85 }}
              transition={{ duration: brewing ? brewMs / 1000 : 0.45, ease: "easeOut" }}
            />
          )}
          {/* meniscus line */}
          {(brewing || brewed) && crema === 0 && (
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

/** The stuff falling between brewer and cup, varied by method. */
function DripLayer({ anim, color, brewing }: { anim: BrewAnimation; color: string; brewing: boolean }) {
  if (!brewing) return <div className="relative -mt-1 h-5 w-4" />;

  // Cold brew: no falling stream, it just steeps — show nothing here.
  if (anim === "steep") return <div className="relative -mt-1 h-5 w-4" />;

  // Espresso: a continuous thin twin stream.
  if (anim === "pull") {
    return (
      <div className="relative -mt-1 h-5 w-6">
        {[-1.5, 1.5].map((dx, i) => (
          <motion.span
            key={i}
            className="absolute top-0 h-5 w-[2px] rounded-full"
            style={{ left: `calc(50% + ${dx}px)`, background: color, transformOrigin: "top" }}
            animate={{ scaleY: [0.2, 1], opacity: [0.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.35, ease: "easeIn" }}
          />
        ))}
      </div>
    );
  }

  // Phin: slow, lazy single drips. Pour/press: livelier drops.
  const drops = anim === "drip" ? [0] : [0, 1, 2];
  const duration = anim === "drip" ? 1.1 : 0.55;
  const stagger = anim === "drip" ? 0.9 : 0.18;
  return (
    <div className="relative -mt-1 h-5 w-4">
      {drops.map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-0 h-2.5 w-1 -translate-x-1/2 rounded-full"
          style={{ background: color }}
          animate={{ y: [0, 20], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration, delay: i * stagger, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export interface StripTone {
  chipBg: string;
  value: string;
}

export function VarStrip({
  vars,
  method,
  theme,
  tone,
  tempUnit,
}: {
  vars: BrewVars;
  method: Method;
  theme: VizTheme;
  tone: StripTone;
  tempUnit: TempUnit;
}) {
  const ranges = varRanges(method);
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-2">
      {VAR_META.map((v) => (
        <div key={v.key} className="flex w-12 flex-col items-center gap-1">
          <div className="size-10 overflow-hidden rounded-lg" style={{ background: tone.chipBg }}>
            <VarViz varKey={v.key} value={vars[v.key]} theme={theme} range={ranges[v.key]} />
          </div>
          <span className="text-center text-[10px] font-semibold leading-none tabular-nums" style={{ color: tone.value }}>
            {fmtVar(v.key, vars[v.key], { method, tempUnit })}
          </span>
        </div>
      ))}
    </div>
  );
}
