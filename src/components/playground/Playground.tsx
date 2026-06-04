// The Homebrew Playground — single responsive screen, single-mode Explore.
// Design: "Field Notes" — an editorial brew-journal on warm ruled paper. Left
// recipe sheet (method tabs + five Variable sliders), right the cup with its
// Brew button (kept together so the ritual is always in view), tasting-note
// slips and the verdict. A Pro view reveals the SCA control chart.
// Side-by-side on desktop, stacked on mobile.
//
// The result is LIVE: dragging any Variable instantly updates the Cup, Taste
// Profile, Verdict, and Pro chart — there is no brew gate. Brew it is a pure
// flourish: it replays the method-specific brewing ritual (drain → tilt-pour
// refill → bloom + swirl → steam), changes no data, and is re-triggerable.
//
// The Extraction Engine, Taste Mapper and Coach (src/lib/coffee/) drive the
// result. Recipe state lives in TanStack Router search params (the single
// source of truth), so every recipe is shareable and refresh-safe.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getRouteApi } from "@tanstack/react-router";
import type {
  BrewVars,
  CoachResult,
  ExtractionResult,
  Method,
  TasteResult,
} from "@/lib/coffee/types";
import { extractFrom } from "@/lib/coffee/extraction-engine";
import { mapTaste } from "@/lib/coffee/taste-mapper";
import { coach } from "@/lib/coffee/coach";
import { grindReference } from "@/lib/coffee/grind";
import { methodSpec } from "@/lib/coffee/methods";
import { defaultSearchVars, type BrewSearch } from "@/lib/brew-search";
import { createBrewSoundPlayer } from "@/lib/sound/player";
import { METHODS, VAR_META, varRanges, fmtVar, ratioGrams } from "./config";
import { VarViz, type VizTheme } from "./visuals";
import { BrewStage, VarStrip, type ReplayPhase } from "./brew-stage";
import { ControlChart } from "./control-chart";

const route = getRouteApi("/");

// One player for the app: caches lazily-loaded clips across re-brews. Audio is
// only built/fetched on the first Brew, never at module load.
const brewSound = createBrewSoundPlayer();

const serif = "'Georgia', 'Iowan Old Style', 'Times New Roman', serif";
const theme: VizTheme = { bed: "#EFE6D2", mark: "#5A3A24", accent: "#A33A28", stroke: "#6F5D49" };

// Brew-it ritual beats (ms). Reduced motion skips drain/pour and shows a brief
// steam wisp only (see onBrew).
const DRAIN_MS = 460;
const POUR_MS = 900;
const SETTLE_MS = 840;
const REDUCED_MS = 600;

interface BrewResult {
  extraction: ExtractionResult;
  taste: TasteResult;
  coach: CoachResult;
}

function runBrew(method: Method, vars: BrewVars): BrewResult {
  const extraction = extractFrom(method, vars);
  const taste = mapTaste({ ...extraction, roast: vars.roast, method });
  const coachResult = coach({ ...extraction, method, currentVars: vars });
  return { extraction, taste, coach: coachResult };
}

export default function Playground() {
  // Search params are the single source of truth for the persistent recipe.
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { method, pro: proView, unit: tempUnit, muted } = search;
  const vars: BrewVars = {
    grind: search.grind,
    waterTemp: search.waterTemp,
    ratio: search.ratio,
    time: search.time,
    roast: search.roast,
  };

  // Transient, non-shareable UI state.
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<ReplayPhase>("idle");
  // The cup is empty until the first Brew; afterward it tracks the live recipe.
  const [hasBrewed, setHasBrewed] = useState(false);
  const [showAlts, setShowAlts] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const spec = methodSpec(method);
  const ranges = varRanges(method);

  // The result is derived live from the current recipe every render — no gate.
  const result = runBrew(method, vars);

  // Merge a patch into the search params (replace: no back-stack spam;
  // resetScroll:false so dragging a slider doesn't jump the page to the top).
  const patch = (p: Partial<BrewSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true, resetScroll: false });

  const setVar = (k: keyof BrewVars, v: number) => patch({ [k]: v } as Partial<BrewSearch>);
  const selectMethod = (m: Method) => patch({ method: m, ...defaultSearchVars(m) });
  const applyFix = (variable: keyof BrewVars, value: number) =>
    patch({ [variable]: value } as Partial<BrewSearch>);

  // Brew it: replay the ritual. Changes no data; re-triggerable once idle.
  const onBrew = () => {
    if (phase !== "idle") return;
    setShowAlts(false);
    setHasBrewed(true);
    clearTimers();
    // The Brew press is an explicit gesture: play the method's clip (silent when
    // muted), independent of reduced motion. Sound never fires on slider drags.
    brewSound.play(method, { muted });
    if (reduced) {
      // Trim the ceremony: a brief steam wisp, no drain/re-pour/bloom.
      setPhase("settle");
      timers.current.push(window.setTimeout(() => setPhase("idle"), REDUCED_MS));
      return;
    }
    setPhase("drain");
    timers.current.push(window.setTimeout(() => setPhase("pour"), DRAIN_MS));
    timers.current.push(window.setTimeout(() => setPhase("settle"), DRAIN_MS + POUR_MS));
    timers.current.push(window.setTimeout(() => setPhase("idle"), DRAIN_MS + POUR_MS + SETTLE_MS));
  };
  const replaying = phase !== "idle";

  return (
    <div
      className="min-h-svh w-full px-4 py-7 sm:px-8"
      style={{
        color: "#43352A",
        background: "repeating-linear-gradient(180deg,#ECE2CF 0,#ECE2CF 31px,#E2D6BF 32px), #ECE2CF",
      }}
    >
      <div className="mx-auto max-w-5xl">
        {/* journal masthead + display toggles */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-3" style={{ borderColor: "#D8C9AC" }}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#A3917A" }}>Homebrew · Brew Journal</p>
            <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: serif, fontWeight: 600 }}>
              Explore your cup
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={[{ v: "C", l: "°C" }, { v: "F", l: "°F" }]}
              value={tempUnit}
              onChange={(v) => patch({ unit: v as "C" | "F" })}
            />
            <MuteToggle muted={muted} onToggle={() => patch({ muted: !muted })} />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* ── Recipe sheet — controls ── */}
          <section className="relative rounded-sm p-6 sm:p-9" style={{ background: "#F8F1E2", boxShadow: "0 1px 0 #fff inset, 0 14px 30px -18px rgba(67,53,42,.6)", border: "1px solid #E0D2B8" }}>
            <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Method</p>
            <div className="mb-7 flex flex-wrap gap-x-5 gap-y-2">
              {METHODS.map((m) => {
                const active = m.id === method;
                return (
                  <button key={m.id} onClick={() => selectMethod(m.id)} aria-pressed={active}
                    className="cursor-pointer pb-0.5 text-base transition-all"
                    style={{
                      fontFamily: serif,
                      color: active ? "#A33A28" : "#7A6A57",
                      fontWeight: active ? 700 : 400,
                      borderBottom: active ? "2px solid #A33A28" : "2px solid transparent",
                    }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p className="mb-5 -mt-3 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#9A8870" }}>{spec.mechanism}</p>

            {/* Variable sliders */}
            <div className="divide-y" style={{ borderColor: "#E8DCC6" }}>
              {VAR_META.map((v) => {
                const r = ranges[v.key];
                return (
                  <div key={v.key} className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="size-11 shrink-0 overflow-hidden rounded-lg" style={{ border: "1px solid #E0D2B8" }}>
                        <VarViz varKey={v.key} value={vars[v.key]} theme={theme} range={r} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-baseline justify-between">
                          <label className="text-lg" style={{ fontFamily: serif }}>{v.label}</label>
                          <span className="text-lg font-semibold tabular-nums" style={{ fontFamily: serif, color: "#A33A28" }}>
                            {fmtVar(v.key, vars[v.key], { method, tempUnit })}
                          </span>
                        </div>
                        <input
                          type="range" min={r.min} max={r.max} step={r.step} value={vars[v.key]}
                          onChange={(e) => setVar(v.key, Number(e.target.value))}
                          aria-label={v.label}
                          className="brew-slider w-full"
                        />
                        <div className="mt-1 flex justify-between text-[11px]" style={{ color: "#A3917A" }}>
                          <span>{v.low}</span>
                          {v.key === "ratio" && <span className="tabular-nums">{ratioGrams(method, vars.ratio)}</span>}
                          <span>{v.high}</span>
                        </div>
                      </div>
                    </div>
                    {/* Grind reference: label + real-world references */}
                    {v.key === "grind" && (
                      <p className="ml-15 mt-1 text-[11px]" style={{ color: "#9A8870" }}>
                        ≈ {grindReference(vars.grind).grinderRefs.join(" · ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Result (live) ── */}
          <aside className="flex flex-col gap-4">
            {/* Cup */}
            <div className="rounded-sm p-6 text-center" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
              <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>{spec.label} · The Cup</p>
              <div className="flex justify-center">
                <BrewStage
                  method={method}
                  theme={theme}
                  liquid={previewColor(vars)}
                  cup={result.taste.cup}
                  phase={phase}
                  filled={hasBrewed}
                  cupBody="#FFFDF7"
                  cupRim="#6F5D49"
                />
              </div>
              <div className="mt-5">
                <VarStrip vars={vars} method={method} theme={theme} tempUnit={tempUnit} tone={{ chipBg: "#EFE6D2", value: "#A33A28" }} />
              </div>
              {!hasBrewed && (
                <p className="mt-4 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>
                  {replaying ? "Brewing…" : "Pencil in your recipe, then brew."}
                </p>
              )}
              {/* Brew sits with the cup so its ritual is always in view */}
              <div className="mt-5 flex justify-center">
                <button onClick={onBrew} disabled={replaying}
                  className="brew-it rotate-[-3deg] cursor-pointer rounded-md px-10 py-3 text-xl uppercase tracking-[0.15em] transition-all hover:rotate-0 hover:-translate-y-0.5 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: serif, fontWeight: 700, color: "#A33A28", border: "3px double #A33A28", background: "rgba(163,58,40,.05)" }}>
                  {replaying ? "Brewing…" : "Brew it"}
                </button>
              </div>
            </div>

            {/* Taste profile + verdict (live) */}
            <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
              <InfoTip title="Tasting Notes">
                A live flavor readout on five <em>positive</em> attributes, each scored 0–100.
                They're derived from where your brew lands relative to the ideal extraction zone:
                under-extraction reads sharp &amp; sour, over-extraction tips bitter, and the sweet
                spot peaks Sweetness &amp; Balance. <em>Acidity</em> here means brightness — a good
                thing, driven mostly by roast — not the sour defect.
              </InfoTip>
              <TasteProfile taste={result.taste} />
              <Verdict coach={result.coach} showAlts={showAlts} onToggleAlts={() => setShowAlts((s) => !s)} onApply={applyFix} />
            </div>

            {/* Pro view: SCA control chart (live) */}
            {proView && (
              <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
                <InfoTip title="Pro · Control Chart" className="mb-2">
                  The <strong>SCA Coffee Brewing Control Chart</strong> — the specialty-coffee
                  industry standard. It plots <strong>Strength</strong> (TDS %, vertical) against
                  <strong> Extraction</strong> (EY %, horizontal). Your brew is the dot; the dashed
                  box is the ideal target (EY ≈ 18–22%, TDS ≈ 1.15–1.45%). Left of the box =
                  under-extracted (sour), right = over-extracted (bitter); low = weak, high = strong.
                </InfoTip>
                <ControlChart
                  result={result.extraction}
                  domain={spec.chart.domain}
                  idealBox={spec.chart.ideal}
                  tdsDecimals={method === "espresso" ? 1 : 2}
                  className="w-full"
                />
                <p className="mt-1 text-center text-[11px]" style={{ color: "#9A8870" }}>
                  EY {result.extraction.extractionYield}% · TDS {result.extraction.tds}%
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .brew-slider { -webkit-appearance:none; appearance:none; height:6px; border-radius:999px; background:#E0D2B8; outline:none; }
        .brew-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:999px; background:#FBF6EA; border:3px solid #A33A28; box-shadow:0 1px 4px rgba(67,53,42,.35); cursor:pointer; }
        .brew-slider::-moz-range-thumb { width:22px; height:22px; border-radius:999px; background:#FBF6EA; border:3px solid #A33A28; cursor:pointer; }
        .ml-15 { margin-left: 3.75rem; }
        .brew-it:hover:not(:disabled) { background:#A33A28 !important; color:#F8F1E2 !important; box-shadow:0 6px 16px -6px rgba(163,58,40,.6); }
      `}</style>
    </div>
  );
}

/** Live pre-brew cup colour fallback (the live colour comes from the Taste Mapper). */
function previewColor(vars: BrewVars): string {
  const strength = 100 - (vars.ratio - 6) * 6;
  const l = 0.4 - vars.roast * 0.0014 - strength * 0.0004;
  return `oklch(${Math.max(0.18, l).toFixed(3)} 0.07 60)`;
}

// ── five-axis taste profile ──────────────────────────────────────────────────
const AXES: { key: keyof TasteResult["taste"]; label: string }[] = [
  { key: "acidity", label: "Acidity" },
  { key: "sweetness", label: "Sweetness" },
  { key: "bitterness", label: "Bitterness" },
  { key: "body", label: "Body" },
  { key: "balance", label: "Balance" },
];

function TasteProfile({ taste }: { taste: TasteResult }) {
  return (
    <div className="space-y-2">
      {AXES.map((a) => (
        <div key={a.key} className="flex items-center gap-3 text-sm" style={{ fontFamily: serif }}>
          <span className="w-20 shrink-0">{a.label}</span>
          <span className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: "#E8DCC6" }}>
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${taste.taste[a.key]}%`, background: "#A33A28" }} />
          </span>
          <span className="w-8 shrink-0 text-right tabular-nums text-[11px]" style={{ color: "#9A8870" }}>{taste.taste[a.key]}</span>
        </div>
      ))}
    </div>
  );
}

// ── verdict (single highest-leverage fix + alternatives) ──────────────────────
function Verdict({
  coach,
  showAlts,
  onToggleAlts,
  onApply,
}: {
  coach: CoachResult;
  showAlts: boolean;
  onToggleAlts: () => void;
  onApply: (variable: keyof BrewVars, value: number) => void;
}) {
  return (
    <div className="mt-4 border-t pt-3" style={{ borderColor: "#E0D2B8" }}>
      <p className="text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Verdict</p>
      <p className="mt-1 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>{coach.diagnosis}</p>
      {coach.dialedIn ? (
        <p className="mt-1 text-lg" style={{ fontFamily: serif, color: "#A33A28" }}>Nailed it — sweet & balanced. ☕</p>
      ) : (
        <>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-lg" style={{ fontFamily: serif, fontWeight: 600 }}>{coach.primaryFix.instruction}</p>
            <button onClick={() => onApply(coach.primaryFix.variable, coach.primaryFix.setValue)}
              className="shrink-0 rounded-md px-4 py-1.5 text-sm uppercase tracking-wide"
              style={{ fontFamily: serif, fontWeight: 700, color: "#F8F1E2", background: "#A33A28" }}>
              Apply
            </button>
          </div>
          {coach.alternatives.length > 0 && (
            <button onClick={onToggleAlts} className="mt-2 text-xs underline" style={{ color: "#9A8870" }}>
              {showAlts ? "Hide alternatives" : "Or try…"}
            </button>
          )}
          {showAlts && (
            <ul className="mt-2 space-y-1.5">
              {coach.alternatives.map((alt) => (
                <li key={alt.variable} className="flex items-center justify-between gap-3 text-sm" style={{ fontFamily: serif }}>
                  <span>{alt.instruction}</span>
                  <button onClick={() => onApply(alt.variable, alt.setValue)} className="shrink-0 text-xs underline" style={{ color: "#A33A28" }}>apply</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

// ── mute toggle ───────────────────────────────────────────────────────────────
// A hand-drawn speaker that sits beside the °C/°F toggle. Unmuted: two sound
// waves gently pulse outward (the input is drawn + animated). Muted: the waves
// give way to a struck-through slash.
function MuteToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  const color = muted ? "#A3917A" : "#A33A28";
  return (
    <button
      onClick={onToggle}
      aria-pressed={muted}
      aria-label={muted ? "Unmute Brew it sound" : "Mute Brew it sound"}
      title={muted ? "Sound off" : "Sound on"}
      className="flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
      style={{ border: "1.5px solid #D8C9AC" }}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {/* speaker cone */}
        <path d="M4 9.5v5h3l4 3.5V6L7 9.5H4z" fill={color} fillOpacity={0.12} />
        {muted ? (
          // struck-through: a slash where the waves were
          <motion.path d="M15 9l5 6M20 9l-5 6" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} style={{ transformOrigin: "17px 12px" }} />
        ) : (
          // sound waves pulsing outward
          [
            { d: "M15 9.5a3.5 3.5 0 010 5", delay: 0 },
            { d: "M17.5 7a7 7 0 010 10", delay: 0.25 },
          ].map((w) => (
            <motion.path
              key={w.d}
              d={w.d}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: w.delay }}
            />
          ))
        )}
      </svg>
    </button>
  );
}

// ── info tip ───────────────────────────────────────────────────────────────────
// An "ⓘ" affordance beside a section heading that reveals a plain-language
// explanation. Opens on hover, keyboard focus, and tap; dismisses on Escape,
// outside click, or blur. The panel is a DOM child of the wrapper so the pointer
// can travel into it without closing (WCAG 1.4.13: hoverable + dismissible).
function InfoTip({ title, children, className = "mb-3" }: { title: string; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className={`relative flex w-fit items-center gap-1.5 text-xs uppercase tracking-widest ${className}`}
      style={{ color: "#A3917A" }}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {title}
      <button
        type="button"
        aria-label={`About ${title}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => { cancelClose(); setOpen(true); }}
        onBlur={scheduleClose}
        className="flex size-4 cursor-pointer items-center justify-center rounded-full normal-case transition-colors"
        style={{ border: `1.5px solid ${open ? "#A33A28" : "#C9B795"}`, color: open ? "#A33A28" : "#A3917A", fontFamily: serif, fontStyle: "italic", fontSize: "11px", lineHeight: 1 }}
      >
        i
      </button>
      {open && (
        <span
          id={panelId}
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1.5 block rounded-sm p-3 text-left text-[12px] normal-case tracking-normal"
          style={{
            width: "min(20rem, calc(100vw - 4rem))",
            background: "#FBF6EA",
            border: "1px solid #D8C9AC",
            boxShadow: "0 12px 28px -14px rgba(67,53,42,.6)",
            color: "#5A4A3A",
            fontFamily: serif,
            fontWeight: 400,
            lineHeight: 1.55,
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

// ── small toggle controls ─────────────────────────────────────────────────────
function Segmented({ options, value, onChange }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex overflow-hidden rounded-full" style={{ border: "1.5px solid #D8C9AC" }}>
      {options.map((o) => {
        const active = o.v === value;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={active}
            className="px-3 py-1 text-sm transition-colors"
            style={{ fontFamily: serif, color: active ? "#F8F1E2" : "#7A6A57", background: active ? "#A33A28" : "transparent" }}>
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
