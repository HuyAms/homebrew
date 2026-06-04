// SCA Coffee Brewing Control Chart — hand-rolled SVG for the optional Pro view.
// Horizontal axis: Extraction Yield % (EY). Vertical axis: TDS % (Strength).
// A tinted "ideal" target box marks the sweet spot; the current brew is a dot
// that springs to its new position as the recipe changes. Method-relative
// scale (espresso/phin run on their own domains) is passed in via props.
import { useId } from "react";
import { motion } from "motion/react";
import type { ExtractionResult } from "@/lib/coffee/types";

export interface ChartBox {
  eyMin: number;
  eyMax: number;
  tdsMin: number;
  tdsMax: number;
}

/** Low Extraction Evenness (espresso channeling): the brew is no longer a single
 *  point but a smear spanning the under- and over-extracted lobes at once. */
export interface Smear {
  /** EY of the under-extracted (bypassed) lobe — the sour end. */
  underEY: number;
  /** EY of the over-extracted (channel) lobe — the bitter end. */
  overEY: number;
  /** 0 channeling → 1 dialed. At 1 there is no smear (a single dot). */
  evenness: number;
}

export interface ControlChartProps {
  result: ExtractionResult;
  domain?: ChartBox;
  idealBox?: ChartBox;
  tdsDecimals?: number;
  className?: string;
  /** When evenness is low, render a smear/split instead of a single dot. */
  smear?: Smear;
}

const FALLBACK_DOMAIN: ChartBox = { eyMin: 14, eyMax: 26, tdsMin: 0.8, tdsMax: 1.8 };
const FALLBACK_IDEAL: ChartBox = { eyMin: 18, eyMax: 22, tdsMin: 1.15, tdsMax: 1.45 };

const INK = "#43352A";
const ACCENT = "#A33A28";
const LINE = "#6F5D49";
const FAINT = "#A3917A";
const PAPER = "#F8F1E2";

// viewBox + plot rectangle.
const W = 320;
const H = 240;
const padL = 46;
const padR = 16;
const padT = 18;
const padB = 36;
const plotW = W - padL - padR;
const plotH = H - padT - padB;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const uniq = (xs: number[]) => [...new Set(xs.map((n) => Math.round(n * 1000) / 1000))];

export function ControlChart({
  result,
  domain = FALLBACK_DOMAIN,
  idealBox = FALLBACK_IDEAL,
  tdsDecimals = 2,
  className,
  smear,
}: ControlChartProps) {
  const clipId = useId();
  const x = (ey: number) => padL + ((ey - domain.eyMin) / (domain.eyMax - domain.eyMin)) * plotW;
  const y = (tds: number) => padT + (1 - (tds - domain.tdsMin) / (domain.tdsMax - domain.tdsMin)) * plotH;

  const boxX = x(idealBox.eyMin);
  const boxW = x(idealBox.eyMax) - boxX;
  const boxY = y(idealBox.tdsMax);
  const boxH = y(idealBox.tdsMin) - boxY;

  const dotX = clamp(x(result.extractionYield), padL + 3, padL + plotW - 3);
  const dotY = clamp(y(result.tds), padT + 3, padT + plotH - 3);

  const eyTicks = uniq([domain.eyMin, idealBox.eyMin, idealBox.eyMax, domain.eyMax]);
  const tdsTicks = uniq([domain.tdsMin, idealBox.tdsMin, idealBox.tdsMax, domain.tdsMax]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Control chart: extraction yield ${result.extractionYield}%, strength ${result.tds.toFixed(tdsDecimals)}% TDS`}
    >
      {/* plot field */}
      <rect x={padL} y={padT} width={plotW} height={plotH} fill={PAPER} stroke={LINE} strokeWidth={1} opacity={0.9} />

      {/* gridlines */}
      {eyTicks.map((t) => (
        <line key={`gx${t}`} x1={x(t)} y1={padT} x2={x(t)} y2={padT + plotH} stroke={LINE} strokeWidth={0.5} opacity={0.18} />
      ))}
      {tdsTicks.map((t) => (
        <line key={`gy${t}`} x1={padL} y1={y(t)} x2={padL + plotW} y2={y(t)} stroke={LINE} strokeWidth={0.5} opacity={0.18} />
      ))}

      {/* ideal target box */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} fill={ACCENT} opacity={0.1} />
      <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="none" stroke={ACCENT} strokeWidth={1.2} strokeDasharray="3 3" />
      <text x={boxX + boxW / 2} y={boxY + boxH / 2} textAnchor="middle" dominantBaseline="middle" fontSize={9} letterSpacing={1.5} fill={ACCENT} style={{ textTransform: "uppercase" }} opacity={0.85}>
        ideal
      </text>

      {/* axis tick labels */}
      {eyTicks.map((t) => (
        <text key={`lx${t}`} x={x(t)} y={padT + plotH + 13} textAnchor="middle" fontSize={8} fill={FAINT}>
          {t}
        </text>
      ))}
      {tdsTicks.map((t) => (
        <text key={`ly${t}`} x={padL - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={8} fill={FAINT}>
          {t.toFixed(tdsDecimals)}
        </text>
      ))}

      {/* axis titles */}
      <text x={padL + plotW / 2} y={H - 4} textAnchor="middle" fontSize={9} letterSpacing={1} fill={INK} style={{ textTransform: "uppercase" }}>
        Extraction (EY %) →
      </text>
      <text transform={`rotate(-90 12 ${padT + plotH / 2})`} x={12} y={padT + plotH / 2} textAnchor="middle" fontSize={9} letterSpacing={1} fill={INK} style={{ textTransform: "uppercase" }}>
        ↑ Strength (TDS %)
      </text>

      {/* keep the dot/dots clipped to the plot so a wide smear can never bleed
          past the axes (spring overshoot included). */}
      <clipPath id={clipId}>
        <rect x={padL} y={padT} width={plotW} height={plotH} />
      </clipPath>

      {/* current brew: a single dot when even, a smear/split spanning the under-
          and over-extracted lobes when evenness is low (channeling). */}
      <g clipPath={`url(#${clipId})`}>
        {smear && smear.evenness < 0.99 ? (
          <BrewSmear smear={smear} x={x} dotY={dotY} />
        ) : (
          <>
            <motion.circle cx={dotX} cy={dotY} r={9} fill={ACCENT} opacity={0.18} animate={{ cx: dotX, cy: dotY }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
            <motion.circle cx={dotX} cy={dotY} r={4.5} fill={ACCENT} stroke={PAPER} strokeWidth={1.4} animate={{ cx: dotX, cy: dotY }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
          </>
        )}
      </g>
    </svg>
  );
}

/** The non-point brew state: a capsule smeared from the under-extracted (sour)
 *  lobe to the over-extracted (bitter) lobe, with a dot anchoring each end — the
 *  visual that the cup is two problems at once, not one. */
function BrewSmear({ smear, x, dotY }: { smear: Smear; x: (ey: number) => number; dotY: number }) {
  const lo = clamp(x(smear.underEY), padL + 3, padL + plotW - 3);
  const hi = clamp(x(smear.overEY), padL + 3, padL + plotW - 3);
  const channeling = 1 - smear.evenness;
  const mid = (lo + hi) / 2;
  const r = 7;
  const width = Math.max(2, hi - lo);
  return (
    <motion.g animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      {/* the smear capsule (clipped to the plot by the parent group) */}
      <motion.rect
        y={dotY - r} rx={r} height={r * 2} fill={ACCENT}
        initial={false}
        animate={{ x: lo, width, opacity: 0.14 + channeling * 0.16 }}
        transition={{ type: "spring", stiffness: 140, damping: 24 }}
      />
      {/* the two extracting lobes: sour (under) on the left, bitter (over) right */}
      <motion.circle cy={dotY} r={4.5} fill={ACCENT} stroke={PAPER} strokeWidth={1.4} animate={{ cx: lo, opacity: 0.55 + channeling * 0.45 }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      <motion.circle cy={dotY} r={4.5} fill={ACCENT} stroke={PAPER} strokeWidth={1.4} animate={{ cx: hi, opacity: 0.55 + channeling * 0.45 }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      <motion.circle cy={dotY} r={2.5} fill={ACCENT} opacity={0.4} animate={{ cx: mid }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
    </motion.g>
  );
}
