// SCA Coffee Brewing Control Chart — hand-rolled SVG for the optional Pro view.
// Horizontal axis: Extraction Yield % (EY). Vertical axis: TDS % (Strength).
// A tinted "ideal" target box marks the sweet spot; the current brew is a dot
// that springs to its new position as the recipe changes. Method-relative
// scale (espresso/phin run on their own domains) is passed in via props.
import { motion } from "motion/react";
import type { ExtractionResult } from "@/lib/coffee/types";

export interface ChartBox {
  eyMin: number;
  eyMax: number;
  tdsMin: number;
  tdsMax: number;
}

export interface ControlChartProps {
  result: ExtractionResult;
  domain?: ChartBox;
  idealBox?: ChartBox;
  tdsDecimals?: number;
  className?: string;
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
}: ControlChartProps) {
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

      {/* current brew */}
      <motion.circle cx={dotX} cy={dotY} r={9} fill={ACCENT} opacity={0.18} animate={{ cx: dotX, cy: dotY }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      <motion.circle cx={dotX} cy={dotY} r={4.5} fill={ACCENT} stroke={PAPER} strokeWidth={1.4} animate={{ cx: dotX, cy: dotY }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
    </svg>
  );
}
