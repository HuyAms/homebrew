// Theme-able visualizations for the Method and the five Variables. Each is
// data-driven so it responds live as the user drags a slider.
import type { BrewVars, Method } from "@/lib/coffee/types";

export interface VizTheme {
  bed: string; // tray/background fill
  mark: string; // primary "stuff" (grounds, mercury)
  accent: string; // highlight (arc, water)
  stroke: string; // line art
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const norm = (v: number, min: number, max: number) => clamp01((v - min) / (max - min));

/* ---------- color helpers (for the roasting bean) ---------- */
function hex(n: number) {
  return Math.round(n).toString(16).padStart(2, "0");
}
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((c, i) => hex(c + (pb[i] - c) * t)).join("")}`;
}

/* ---------- per-variable visuals ---------- */

// Grind: a tray of grounds. Fine = many tiny particles; coarse = fewer chunks.
const GRID: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let y = 5; y <= 27; y += 3) for (let x = 5; x <= 27; x += 3) out.push([x, y]);
  return out;
})();
function GrindViz({ value, theme }: { value: number; theme: VizTheme }) {
  const t = value / 100; // 0 fine → 1 coarse
  const r = 0.9 + t * 2.6;
  const keep = Math.round(GRID.length * (1 - t * 0.72));
  return (
    <svg viewBox="0 0 32 32" className="size-full">
      <rect x="1" y="1" width="30" height="30" rx="7" fill={theme.bed} />
      {GRID.filter((_, i) => (i * 13) % GRID.length < keep).map(([x, y], i) => {
        const j = ((x * 7 + y * 13) % 5) - 2;
        return <circle key={i} cx={x + j * 0.4 * t} cy={y - j * 0.4 * t} r={r} fill={theme.mark} opacity={0.9} />;
      })}
    </svg>
  );
}

// Water temp: thermometer + rising steam (taller/stronger steam when hotter).
function TempViz({ value, theme }: { value: number; theme: VizTheme }) {
  const t = norm(value, 80, 100);
  const stemTop = 20 - t * 11;
  return (
    <svg viewBox="0 0 32 32" className="size-full">
      <rect x="1" y="1" width="30" height="30" rx="7" fill={theme.bed} />
      {[10, 16, 22].map((x, i) => (
        <path key={x} d={`M${x} ${9 - i} q -2 -3 0 -6 q 2 -3 0 -6`} fill="none" stroke={theme.accent}
          strokeWidth="1.4" strokeLinecap="round" opacity={t > 0.15 + i * 0.25 ? 0.25 + t * 0.55 : 0} />
      ))}
      <rect x="14.5" y="9" width="3" height="12" rx="1.5" fill="#fff6" stroke={theme.stroke} strokeWidth="1" />
      <rect x="14.5" y={stemTop} width="3" height={21 - stemTop} fill={theme.accent} />
      <circle cx="16" cy="24" r="4" fill={theme.accent} stroke={theme.stroke} strokeWidth="1" />
    </svg>
  );
}

// Brew ratio: a beaker — small coffee layer (1) under a tall water column (N).
function RatioViz({ value, theme }: { value: number; theme: VizTheme }) {
  const coffeeFrac = 1 / value;
  const inH = 20;
  const cH = Math.min(inH * 0.6, coffeeFrac * inH * 4.2);
  return (
    <svg viewBox="0 0 32 32" className="size-full">
      <rect x="1" y="1" width="30" height="30" rx="7" fill={theme.bed} />
      <rect x="11" y="7" width="10" height={inH} fill={theme.accent} opacity={0.28} />
      <rect x="11" y={7 + inH - cH} width="10" height={cH} fill={theme.mark} />
      <path d="M11 6 L11 25 Q11 27 13 27 L19 27 Q21 27 21 25 L21 6" fill="none" stroke={theme.stroke} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="9.5" y1="6" x2="22.5" y2="6" stroke={theme.stroke} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// Brew time: a clock with a sweeping arc proportional to time.
function TimeViz({ value, theme, min, max }: { value: number; theme: VizTheme; min: number; max: number }) {
  const frac = norm(value, min, max);
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 32 32" className="size-full">
      <rect x="1" y="1" width="30" height="30" rx="7" fill={theme.bed} />
      <circle cx="16" cy="16" r={r} fill="none" stroke={theme.stroke} strokeWidth="1.4" opacity={0.4} />
      <circle cx="16" cy="16" r={r} fill="none" stroke={theme.accent} strokeWidth="2.6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform="rotate(-90 16 16)" />
      <line x1="16" y1="16" x2={16 + r * 0.7 * Math.sin(frac * 2 * Math.PI)} y2={16 - r * 0.7 * Math.cos(frac * 2 * Math.PI)}
        stroke={theme.stroke} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.6" fill={theme.stroke} />
    </svg>
  );
}

// Roast: a coffee bean that darkens (and gains an oily sheen) with roast level.
function RoastViz({ value, theme }: { value: number; theme: VizTheme }) {
  const t = value / 100;
  const color = mix("#C79A63", "#241309", t);
  return (
    <svg viewBox="0 0 32 32" className="size-full">
      <rect x="1" y="1" width="30" height="30" rx="7" fill={theme.bed} />
      <ellipse cx="16" cy="16" rx="9" ry="11" fill={color} stroke={theme.stroke} strokeWidth="1" transform="rotate(18 16 16)" />
      <path d="M16 6 Q13 16 16 26" fill="none" stroke="#0003" strokeWidth="1.4" transform="rotate(18 16 16)" />
      <ellipse cx="13" cy="11" rx="2.4" ry="3.6" fill="#fff" opacity={0.12 + t * 0.32} transform="rotate(18 16 16)" />
    </svg>
  );
}

export function VarViz({
  varKey, value, theme, range,
}: {
  varKey: keyof BrewVars; value: number; theme: VizTheme; range: { min: number; max: number };
}) {
  switch (varKey) {
    case "grind": return <GrindViz value={value} theme={theme} />;
    case "waterTemp": return <TempViz value={value} theme={theme} />;
    case "ratio": return <RatioViz value={value} theme={theme} />;
    case "time": return <TimeViz value={value} theme={theme} min={range.min} max={range.max} />;
    case "roast": return <RoastViz value={value} theme={theme} />;
  }
}

/* ---------- the chosen brewer, drawn ---------- */

// `hideVessel` drops the receiving carafe/cup/glass so the brewer pours into a
// real cup below it (used by BrewStage). Self-contained methods (French press,
// cold brew) ignore it — they ARE the vessel.
export function MethodArt({ method, theme, className, hideVessel = false }: { method: Method; theme: VizTheme; className?: string; hideVessel?: boolean }) {
  const s = theme.stroke;
  const common = { fill: "none", stroke: s, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const inner = (() => {
    switch (method) {
      case "v60":
        return (
          <>
            <path d="M16 34 L30 14 L50 14 L64 34 Z" {...common} />
            <path d="M40 14 L40 34" {...common} opacity={0.4} />
            <path d="M28 21 L52 21" {...common} opacity={0.4} />
            {!hideVessel && (
              <>
                <line x1="40" y1="34" x2="40" y2="44" {...common} />
                <path d="M26 50 L54 50 L50 66 L30 66 Z" {...common} />
              </>
            )}
          </>
        );
      case "french-press":
        return (
          <>
            <rect x="26" y="22" width="28" height="44" rx="3" {...common} />
            <line x1="40" y1="22" x2="40" y2="8" {...common} />
            <circle cx="40" cy="6" r="4" {...common} />
            <line x1="28" y1="30" x2="52" y2="30" {...common} />
            <line x1="54" y1="40" x2="60" y2="44" {...common} />
          </>
        );
      case "espresso":
        return (
          <>
            <ellipse cx="34" cy="24" rx="16" ry="6" {...common} />
            <path d="M18 24 L20 34 L48 34 L50 24" {...common} />
            <path d="M50 27 L66 30" {...common} />
            <rect x="64" y="27" width="6" height="6" rx="1.5" {...common} />
            <path d="M30 34 L30 50 M40 34 L40 50" {...common} opacity={0.6} />
            {!hideVessel && <path d="M22 56 L46 56 L42 68 L26 68 Z" {...common} />}
          </>
        );
      case "aeropress":
        return (
          <>
            <rect x="28" y="14" width="24" height="34" rx="2" {...common} />
            <line x1="40" y1="14" x2="40" y2="4" {...common} />
            <line x1="32" y1="4" x2="48" y2="4" {...common} />
            <line x1="30" y1="20" x2="50" y2="20" {...common} />
            {!hideVessel && <path d="M26 52 L54 52 L50 68 L30 68 Z" {...common} />}
          </>
        );
      case "cold-brew":
        return (
          <>
            <rect x="24" y="18" width="32" height="50" rx="6" {...common} />
            <rect x="28" y="10" width="24" height="8" rx="2" {...common} />
            <line x1="26" y1="30" x2="54" y2="30" {...common} opacity={0.4} />
            {[34, 42, 50, 38, 46].map((y, i) => (
              <circle key={i} cx={32 + (i % 3) * 8} cy={y} r="2.2" fill={s} stroke="none" />
            ))}
          </>
        );
      case "phin":
        return (
          <>
            <path d="M26 18 L54 18 L50 38 L30 38 Z" {...common} />
            <rect x="30" y="10" width="20" height="8" rx="2" {...common} />
            <circle cx="40" cy="14" r="2" fill={s} stroke="none" />
            {!hideVessel && (
              <>
                <line x1="40" y1="38" x2="40" y2="46" {...common} />
                <path d="M30 48 L50 48 L47 68 L33 68 Z" {...common} />
                <line x1="33" y1="58" x2="47" y2="58" {...common} opacity={0.4} />
              </>
            )}
          </>
        );
    }
  })();
  return (
    <svg viewBox="0 0 80 76" className={className} aria-label={method}>
      {inner}
    </svg>
  );
}
