// Result stage: the chosen brewer sits ABOVE a cup that is always LIVE — it
// shows the current recipe's CupVisual (colour, crema, body) every render, with
// no brew gate. Pressing Brew replays a method-specific ritual purely for
// delight: the cup drains to empty, the brewer tilts and pours a falling stream
// that refills it, the surface blooms (an expanding ripple) and gently swirls
// as it settles, and steam rises near the end. It changes no data; afterward
// the cup returns to its live state. VarStrip mirrors the five Variable visuals.
import { motion, useReducedMotion } from "motion/react";
import type { BrewVars, CupVisual, Method } from "@/lib/coffee/types";
import { methodSpec, type BrewAnimation } from "@/lib/coffee/methods";
import { VAR_META, varRanges, fmtVar, type TempUnit } from "./config";
import { MethodArt, VarViz, type VizTheme } from "./visuals";

/** The Brew-it ritual is a four-beat ceremony; `idle` is the live cup. */
export type ReplayPhase = "idle" | "drain" | "pour" | "settle";

/** Live fill level of the cup (fraction of cup height). */
const LIVE_FILL = 0.9;

export interface BrewStageProps {
  method: Method;
  theme: VizTheme;
  /** Live pour colour, used only as a fallback before the cup is known. */
  liquid: string;
  /** Current beat of the Brew-it replay (`idle` = the resting cup). */
  phase: ReplayPhase;
  /** Whether the cup is filled at rest. Empty until the first Brew. */
  filled: boolean;
  /** The live cup (colour/crema/body) from the Taste Mapper. */
  cup?: CupVisual;
  cupBody: string;
  cupRim: string;
  /** Extraction Evenness, 0 channeling → 1 dialed (espresso). Low evenness makes
   *  the bottomless pull spray sideways instead of converging (research/08). */
  evenness?: number;
}

export function BrewStage({ method, theme, liquid, phase, filled, cup, cupBody, cupRim, evenness = 1 }: BrewStageProps) {
  const reduced = useReducedMotion();
  const anim: BrewAnimation = methodSpec(method).animation;
  const fillColor = cup ? cup.color : liquid;
  const crema = cup ? cup.crema : anim === "pull" ? 0.4 : 0;

  // Fill level by beat: empty until first brew; drains then the re-pour refills.
  const fill = phase === "drain" || (phase === "idle" && !filled) ? 0 : LIVE_FILL;
  const fillDur = phase === "drain" ? 0.42 : phase === "pour" ? 0.85 : 0.4;
  const fillEase = phase === "drain" ? "easeIn" : "easeOut";

  const pouring = phase === "pour";
  const settling = phase === "settle";
  // The surface line where crema/ripple/swirl sit, tracking the fill.
  const surfaceBottom = `calc(${fill * 100}% - 6px)`;

  return (
    <div className="relative flex select-none flex-col items-center">
      {/* the brewer; on a re-pour it tilts to pour (a press instead plunges down) */}
      <motion.div
        animate={
          pouring
            ? anim === "press"
              ? { y: [0, 6, 4], rotate: 0 }
              : anim === "steep"
                ? { y: 0, rotate: 0 }
                : { rotate: [0, -16, -16, -4], y: 0 }
            : { y: 0, rotate: 0 }
        }
        transition={{ duration: 0.85, ease: "easeInOut" }}
        style={{ transformOrigin: "70% 80%" }}
      >
        <MethodArt method={method} theme={theme} hideVessel className="h-24 w-24" />
      </motion.div>

      <DripLayer anim={anim} color={fillColor} pouring={pouring} evenness={evenness} />

      <div className="relative -mt-1">
        <div className="relative h-40 w-44 overflow-hidden rounded-b-[5rem] rounded-t-2xl border-4" style={{ borderColor: cupRim, background: cupBody }}>
          {/* steam rises near the end of the ritual (a brief wisp under reduced motion) */}
          {settling && <Steam reduced={!!reduced} />}

          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{ background: fillColor }}
            initial={false}
            animate={{ height: `${fill * 100}%` }}
            transition={{ duration: fillDur, ease: fillEase }}
          />

          {/* crema / foam cap (espresso) — rides the fill line */}
          {crema > 0 && fill > 0 && (
            <motion.div
              className="absolute inset-x-2 rounded-full"
              style={{ background: "#C9A26A", height: `${6 + crema * 16}px` }}
              initial={false}
              animate={{ bottom: `calc(${fill * 100}% - ${3 + crema * 8}px)`, opacity: 0.85 }}
              transition={{ duration: fillDur, ease: fillEase }}
            />
          )}
          {/* meniscus line for filtered brews */}
          {crema === 0 && fill > 0 && (
            <motion.div
              className="absolute inset-x-4 h-2 rounded-full opacity-50"
              style={{ background: "#F0D9B5" }}
              initial={false}
              animate={{ bottom: surfaceBottom }}
              transition={{ duration: fillDur, ease: fillEase }}
            />
          )}

          {/* bloom: an expanding ripple on the surface as it settles */}
          {settling && !reduced && (
            <motion.span
              className="absolute left-1/2 size-6 -translate-x-1/2 rounded-full"
              style={{ bottom: surfaceBottom, border: `2px solid ${cupBody}` }}
              initial={{ scale: 0.3, opacity: 0.7 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
          {/* gentle swirl: a highlight drifts side to side as the surface settles */}
          {settling && !reduced && (
            <motion.span
              className="absolute inset-x-6 h-3 rounded-[50%] opacity-40"
              style={{ bottom: surfaceBottom, background: "radial-gradient(ellipse at center, #FFF6E2, transparent 70%)" }}
              initial={{ x: -10 }}
              animate={{ x: [-10, 12, -6, 0] }}
              transition={{ duration: 0.85, ease: "easeInOut" }}
            />
          )}
        </div>
        <div className="absolute -right-7 top-9 h-16 w-9 rounded-r-full border-4" style={{ borderColor: cupRim }} />
      </div>
    </div>
  );
}

/** Rising steam wisps above the cup surface. Reduced motion → a single quick puff. */
function Steam({ reduced }: { reduced: boolean }) {
  const cols = reduced ? [16] : [10, 16, 22];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex h-10 justify-center">
      <svg viewBox="0 0 32 32" className="h-full w-16" aria-hidden>
        {cols.map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 30 q -3 -6 0 -12 q 3 -6 0 -12`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: reduced ? [0, 0.4, 0] : [0, 0.5, 0], y: -10 }}
            transition={{ duration: reduced ? 0.6 : 1, delay: i * 0.12, ease: "easeOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

/** The stuff falling between brewer and cup during the re-pour, varied by method. */
function DripLayer({ anim, color, pouring, evenness = 1 }: { anim: BrewAnimation; color: string; pouring: boolean; evenness?: number }) {
  if (!pouring) return <div className="relative -mt-1 h-5 w-4" />;

  // Cold brew: no falling stream, it just steeps — show nothing here.
  if (anim === "steep") return <div className="relative -mt-1 h-5 w-4" />;

  // Espresso: a bottomless pull. Dialed → a clean, converging twin stream.
  // Sloppy → channeling: thin jets squirt sideways at angles and sputter, never
  // converging to one column (research/08 — the naked-portafilter spray).
  if (anim === "pull") {
    if (evenness < 0.6) return <SprayLayer color={color} evenness={evenness} />;
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

/** Channeling spray: thin jets squirting sideways at varied angles, sputtering,
 *  with pale "blonde" streaks — the bottomless-portafilter signature of an
 *  uneven puck (research/08). The fan widens as evenness drops. */
function SprayLayer({ color, evenness }: { color: string; evenness: number }) {
  const intensity = 1 - evenness; // ~0.4 (loose) → 1 (fully channeling)
  const jets = [-40, -22, -8, 8, 24, 44];
  return (
    <div className="relative -mt-1 h-5 w-6">
      {jets.map((a, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-0 h-5 w-[1.5px] rounded-full"
          style={{ background: i % 3 === 0 ? "#E8D7B8" : color, transformOrigin: "top center", rotate: a * (0.6 + intensity * 0.6) }}
          animate={{ scaleY: [0.15, 1, 0.35, 0.9, 0.2], opacity: [0.2, 1, 0.3, 0.85, 0.25] }}
          transition={{ repeat: Infinity, duration: 0.22 + (i % 3) * 0.06, ease: "easeIn", delay: i * 0.04 }}
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
