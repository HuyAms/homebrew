// The Homebrew Playground — single responsive screen with two modes.
// Design: "Field Notes" — an editorial brew-journal on warm ruled paper. Left
// recipe sheet (method tabs + five Variable sliders), right the cup with its
// Brew button (kept together so the ritual is always in view), tasting-note
// slips and the verdict. A Pro view reveals the SCA control chart.
// Side-by-side on desktop, stacked on mobile.
//
// FORWARD (explore): the result is LIVE — dragging any Variable instantly
// updates the Cup, Taste Profile, Verdict, and Pro chart, no brew gate. Brew it
// is a pure flourish: it replays the method-specific brewing ritual (drain →
// tilt-pour refill → bloom + swirl → steam), changes no data, re-triggerable.
//
// REVERSE (Fix my cup): the user confirms the recipe they brewed in real life
// and picks how it tasted; the Cup renders "the cup you made" biased by that
// reported taste (cup-from-complaint), and the Coach prescribes the single
// highest-leverage fix. Apply writes the fix into the recipe and morphs the bad
// cup into the corrected one. Trust the tongue: the simulated Taste Profile,
// Verdict, and Pro chart are hidden in Reverse; there is no Brew (ADR-0002).
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
  TasteComplaint,
  TasteResult,
} from "@/lib/coffee/types";
import { extractFrom } from "@/lib/coffee/extraction-engine";
import { mapTaste } from "@/lib/coffee/taste-mapper";
import { coach, coachFromComplaint } from "@/lib/coffee/coach";
import { cupFromComplaint } from "@/lib/coffee/cup-from-complaint";
import { grindReference } from "@/lib/coffee/grind";
import {
  GRINDER_OPTIONS,
  grinderName,
  grinderSetting,
  type GrinderId,
} from "@/lib/coffee/grinders";
import { featuredRecipes, type FeaturedRecipe } from "@/lib/coffee/featured-recipes";
import { VARIABLE_INFO } from "@/lib/coffee/variable-info";
import { methodSpec } from "@/lib/coffee/methods";
import { defaultSearchVars, type BrewSearch, type Mode } from "@/lib/brew-search";
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

// Reverse-mode taste complaints, in the order they're offered. Each maps 1:1 to
// a control-chart direction inside the Coach (coachFromComplaint).
const COMPLAINTS: { id: TasteComplaint; label: string; note: string }[] = [
  { id: "sour", label: "Sour", note: "sharp, under-extracted" },
  { id: "bitter", label: "Bitter", note: "harsh, over-extracted" },
  { id: "weak", label: "Weak / watery", note: "thin, low strength" },
  { id: "too-strong", label: "Too strong", note: "intense, high strength" },
  { id: "just-right", label: "Just right", note: "in the sweet spot" },
];

export default function Playground() {
  // Search params are the single source of truth for the persistent recipe.
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { method, mode, pro: proView, unit: tempUnit, muted, grinder } = search;
  const reverse = mode === "reverse";
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
  // Verdict "Why?" expander (inline learning — the reasoning behind the fix).
  const [showWhy, setShowWhy] = useState(false);
  // Reverse: the reported taste of "the cup you made" (transient, not persisted).
  const [complaint, setComplaint] = useState<TasteComplaint | null>(null);
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

  // Reverse: prescribe a fix from the reported taste; render "the cup you made"
  // biased toward that fault (Trust the tongue — the simulation is not shown).
  const reverseFix: CoachResult | null =
    reverse && complaint ? coachFromComplaint(complaint, method, vars) : null;
  const madeCup = reverse && complaint ? cupFromComplaint(complaint, method, vars) : null;
  // The cup on stage: in Reverse it's the cup you made (or, once a complaint is
  // cleared by Apply, the corrected recipe's cup); in Forward it's the live cup.
  const stageCup = madeCup ?? result.taste.cup;

  // Featured Recipes for the current method (Forward only — curated, read-only).
  const recipes = featuredRecipes(method);
  // Grind Size readout: the picked grinder's clicks, else the generic references.
  const gSetting = grinderSetting(grinder, vars.grind);
  const grindReadout = gSetting
    ? `${grinderName(grinder)} · ${gSetting}`
    : grindReference(vars.grind).grinderRefs.join(" · ");

  // Merge a patch into the search params (replace: no back-stack spam;
  // resetScroll:false so dragging a slider doesn't jump the page to the top).
  const patch = (p: Partial<BrewSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true, resetScroll: false });

  const setVar = (k: keyof BrewVars, v: number) => patch({ [k]: v } as Partial<BrewSearch>);
  const selectMethod = (m: Method) => {
    setComplaint(null);
    patch({ method: m, ...defaultSearchVars(m) });
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    clearTimers();
    setComplaint(null);
    setPhase("idle");
    setShowAlts(false);
    setShowWhy(false);
    patch({ mode: m });
  };

  // The Brew-it ritual: method sound + drain → re-pour → settle (a steam wisp
  // only under reduced motion). Shared by Forward's Brew and Reverse's Apply, so
  // applying a fix re-brews the cup with the same delight.
  const runRitual = () => {
    clearTimers();
    brewSound.play(method, { muted });
    if (reduced) {
      setPhase("settle");
      timers.current.push(window.setTimeout(() => setPhase("idle"), REDUCED_MS));
      return;
    }
    setPhase("drain");
    timers.current.push(window.setTimeout(() => setPhase("pour"), DRAIN_MS));
    timers.current.push(window.setTimeout(() => setPhase("settle"), DRAIN_MS + POUR_MS));
    timers.current.push(window.setTimeout(() => setPhase("idle"), DRAIN_MS + POUR_MS + SETTLE_MS));
  };

  // Forward Apply: write the fix into the live recipe (the cup follows live).
  const applyFix = (variable: keyof BrewVars, value: number) =>
    patch({ [variable]: value } as Partial<BrewSearch>);

  // Reverse Apply: write the fix, clear the resolved complaint, then re-brew —
  // the bad cup drains and the corrected cup pours back in, with sound, exactly
  // like Brew it. (Trust the tongue: the resolved complaint is cleared.)
  const applyReverseFix = (variable: keyof BrewVars, value: number) => {
    if (phase !== "idle") return;
    setShowAlts(false);
    setShowWhy(false);
    setComplaint(null); // the fault is now resolved; the recipe is corrected
    patch({ [variable]: value } as Partial<BrewSearch>);
    runRitual();
  };

  // Load a Featured Recipe (Forward only): animate all five Variables to the
  // curated set and re-brew the cup with the same ritual as Apply. Read-only —
  // the user loads but never saves recipes (ADR-0004).
  const loadRecipe = (recipe: FeaturedRecipe) => {
    if (phase !== "idle") return;
    setShowAlts(false);
    setShowWhy(false);
    setHasBrewed(true);
    patch({ ...recipe.vars });
    runRitual();
  };

  // Brew it: replay the ritual. Changes no data; re-triggerable once idle. The
  // press is an explicit gesture, so sound plays (silent when muted) independent
  // of reduced motion; sound never fires on slider drags.
  const onBrew = () => {
    if (phase !== "idle") return;
    setShowAlts(false);
    setHasBrewed(true);
    runRitual();
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
              {reverse ? "Fix my cup" : "Explore your cup"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={[{ v: "forward", l: "Explore" }, { v: "reverse", l: "Fix my cup" }]}
              value={mode}
              onChange={(v) => switchMode(v as Mode)}
            />
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

            {reverse && (
              <p className="mb-5 -mt-2 rounded-sm px-3 py-2 text-sm" style={{ fontFamily: serif, color: "#7A6A57", background: "#EFE6D2", border: "1px solid #E0D2B8" }}>
                Confirm the recipe you brewed, then tell us how it tasted →
              </p>
            )}

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
                          <span className="flex items-center gap-1.5 text-lg" style={{ fontFamily: serif }}>
                            <label>{v.label}</label>
                            <VarInfoTip varKey={v.key} label={v.label} low={v.low} high={v.high} />
                          </span>
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
                    {/* Grind reference: the picked grinder's clicks (or everyday refs) + a grinder picker */}
                    {v.key === "grind" && (
                      <div className="ml-15 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]" style={{ color: "#9A8870" }}>
                        <span>≈ {grindReadout}</span>
                        <GrinderSelect value={grinder} onChange={(g) => patch({ grinder: g })} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Featured Recipes: curated, read-only starts from known brewers.
                Loading one animates the Variables + re-brews the cup. */}
            {!reverse && recipes.length > 0 && (
              <div className="mt-7 border-t pt-5" style={{ borderColor: "#E8DCC6" }}>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Featured Recipes</p>
                <p className="mt-1 mb-3 text-[12px]" style={{ fontFamily: serif, fontStyle: "italic", color: "#9A8870" }}>
                  Load a known brewer's start and watch the cup re-form. Beans drift as they age — re-dialing with each new bag is normal, not failure.
                </p>
                <div className="flex flex-col gap-2.5">
                  {recipes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => loadRecipe(r)}
                      disabled={replaying}
                      className="w-full cursor-pointer rounded-md p-3 text-left transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ fontFamily: serif, background: "#EFE6D2", border: "1px solid #E0D2B8" }}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-base font-semibold" style={{ color: "#A33A28" }}>{r.title}</span>
                        <span className="shrink-0 text-[11px] uppercase tracking-wide" style={{ color: "#A3917A" }}>Load →</span>
                      </span>
                      <span className="mt-0.5 block text-[12px] font-semibold" style={{ color: "#5A4A3A" }}>
                        {r.brewer}
                        <span className="font-normal" style={{ color: "#7A6A57" }}> — {r.brewerBio}</span>
                      </span>
                      <span className="mt-1 block text-[12px]" style={{ fontStyle: "italic", color: "#7A6A57", lineHeight: 1.5 }}>
                        {r.note}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Result (live) ── */}
          <aside className="flex flex-col gap-4">
            {/* Cup */}
            <div className="rounded-sm p-6 text-center" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
              <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>{spec.label} · {reverse ? "The cup you made" : "The Cup"}</p>
              <div className="flex justify-center">
                <BrewStage
                  method={method}
                  theme={theme}
                  liquid={previewColor(vars)}
                  cup={reverse ? stageCup : result.taste.cup}
                  phase={phase}
                  filled={reverse ? true : hasBrewed}
                  cupBody="#FFFDF7"
                  cupRim="#6F5D49"
                />
              </div>
              <div className="mt-5">
                <VarStrip vars={vars} method={method} theme={theme} tempUnit={tempUnit} tone={{ chipBg: "#EFE6D2", value: "#A33A28" }} />
              </div>
              {reverse ? (
                !complaint && phase === "idle" && (
                  <p className="mt-4 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>
                    Pick how it tasted below to see the cup you made.
                  </p>
                )
              ) : (
                <>
                  {/* The placeholder spot replays as a friend's comment once brewed. */}
                  <p className="mt-4 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>
                    {replaying
                      ? "Brewing…"
                      : hasBrewed
                        ? result.coach.comment
                        : "Pencil in your recipe, then brew."}
                  </p>
                  {/* Brew sits with the cup so its ritual is always in view */}
                  <div className="mt-5 flex justify-center">
                    <button onClick={onBrew} disabled={replaying}
                      className="brew-it rotate-[-3deg] cursor-pointer rounded-md px-10 py-3 text-xl uppercase tracking-[0.15em] transition-all hover:rotate-0 hover:-translate-y-0.5 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ fontFamily: serif, fontWeight: 700, color: "#A33A28", border: "3px double #A33A28", background: "rgba(163,58,40,.05)" }}>
                      {replaying ? "Brewing…" : "Brew it"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {reverse ? (
              /* Reverse: report taste → single prescribed fix → Apply (morph). */
              <ReverseFix
                complaint={complaint}
                onPick={setComplaint}
                fix={reverseFix}
                showAlts={showAlts}
                onToggleAlts={() => setShowAlts((s) => !s)}
                showWhy={showWhy}
                onToggleWhy={() => setShowWhy((s) => !s)}
                onApply={applyReverseFix}
                busy={replaying}
              />
            ) : (
              /* Forward: live Taste Profile + Verdict (Trust the tongue hides these in Reverse). */
              <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
                <InfoTip title="Tasting Notes">
                  A live flavor readout on five <em>positive</em> attributes, each scored 0–100.
                  They're derived from where your brew lands relative to the ideal extraction zone:
                  under-extraction reads sharp &amp; sour, over-extraction tips bitter, and the sweet
                  spot peaks Sweetness &amp; Balance. <em>Acidity</em> here means brightness — a good
                  thing, driven mostly by roast — not the sour defect.
                </InfoTip>
                <TasteProfile taste={result.taste} />
                <Verdict
                  coach={result.coach}
                  showAlts={showAlts}
                  onToggleAlts={() => setShowAlts((s) => !s)}
                  showWhy={showWhy}
                  onToggleWhy={() => setShowWhy((s) => !s)}
                  onApply={applyFix}
                />
              </div>
            )}

            {/* Pro view: SCA control chart (live; hidden in Reverse — Trust the tongue) */}
            {proView && !reverse && (
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
  showWhy,
  onToggleWhy,
  onApply,
}: {
  coach: CoachResult;
  showAlts: boolean;
  onToggleAlts: () => void;
  showWhy: boolean;
  onToggleWhy: () => void;
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
          <WhyExpander why={coach.why} open={showWhy} onToggle={onToggleWhy} />
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

// ── reverse mode: report taste → single fix → Apply ───────────────────────────
// The user picks how the cup they brewed tasted (the complaint leads); the Coach
// prescribes the single highest-leverage fix and Apply morphs the cup. The
// simulated Taste Profile/Verdict are absent here — only the reported taste.
function ReverseFix({
  complaint,
  onPick,
  fix,
  showAlts,
  onToggleAlts,
  showWhy,
  onToggleWhy,
  onApply,
  busy,
}: {
  complaint: TasteComplaint | null;
  onPick: (c: TasteComplaint) => void;
  fix: CoachResult | null;
  showAlts: boolean;
  onToggleAlts: () => void;
  showWhy: boolean;
  onToggleWhy: () => void;
  onApply: (variable: keyof BrewVars, value: number) => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
      <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>How did your cup taste?</p>
      <div className="flex flex-wrap gap-2">
        {COMPLAINTS.map((c) => {
          const active = complaint === c.id;
          return (
            <button key={c.id} onClick={() => onPick(c.id)} aria-pressed={active} title={c.note}
              className="cursor-pointer rounded-full px-3 py-1.5 text-sm transition-all"
              style={{
                fontFamily: serif,
                color: active ? "#F8F1E2" : "#7A6A57",
                background: active ? "#A33A28" : "transparent",
                border: `1.5px solid ${active ? "#A33A28" : "#D8C9AC"}`,
              }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {fix && (
        <div className="mt-4 rounded-sm p-4" style={{ background: "#EFE6D2", border: "1px solid #E0D2B8" }}>
          {fix.dialedIn ? (
            <p className="text-lg" style={{ fontFamily: serif, color: "#A33A28" }}>Keep this recipe — it's dialed in. ☕</p>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>The one fix</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-lg" style={{ fontFamily: serif, fontWeight: 600 }}>{fix.primaryFix.instruction}</p>
                <button onClick={() => onApply(fix.primaryFix.variable, fix.primaryFix.setValue)} disabled={busy}
                  className="shrink-0 cursor-pointer rounded-md px-4 py-1.5 text-sm uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: serif, fontWeight: 700, color: "#F8F1E2", background: "#A33A28" }}>
                  Apply
                </button>
              </div>
              <WhyExpander why={fix.why} open={showWhy} onToggle={onToggleWhy} />
              {fix.alternatives.length > 0 && (
                <button onClick={onToggleAlts} className="mt-2 cursor-pointer text-xs underline" style={{ color: "#9A8870" }}>
                  {showAlts ? "Hide alternatives" : "Or try…"}
                </button>
              )}
              {showAlts && (
                <ul className="mt-2 space-y-1.5">
                  {fix.alternatives.map((alt) => (
                    <li key={alt.variable} className="flex items-center justify-between gap-3 text-sm" style={{ fontFamily: serif }}>
                      <span>{alt.instruction}</span>
                      <button onClick={() => onApply(alt.variable, alt.setValue)} disabled={busy} className="shrink-0 cursor-pointer text-xs underline disabled:opacity-60" style={{ color: "#A33A28" }}>apply</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
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
function InfoTip({
  title,
  children,
  className = "mb-3",
  inline = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  /** Icon-only trigger (no heading text), for sitting beside a Variable label. */
  inline?: boolean;
}) {
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
      className={
        inline
          ? "relative inline-flex items-center"
          : `relative flex w-fit items-center gap-1.5 text-xs uppercase tracking-widest ${className}`
      }
      style={inline ? undefined : { color: "#A3917A" }}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {!inline && title}
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

// Per-Variable info icon: what it is + what raising/lowering it does. Reads the
// single variable-info content source shared with the Verdict's "Why?".
function VarInfoTip({ varKey, label, low, high }: { varKey: keyof BrewVars; label: string; low: string; high: string }) {
  const info = VARIABLE_INFO[varKey];
  return (
    <InfoTip inline title={label}>
      <strong>{info.what}</strong>
      <span className="mt-2 block"><em>{high} →</em> {info.raise}</span>
      <span className="mt-1 block"><em>← {low}</em> {info.lower}</span>
    </InfoTip>
  );
}

// "Why?" expander: reveals the reasoning behind the prescribed fix, from the
// same variable-info source as the slider tooltips. Renders nothing when empty.
function WhyExpander({ why, open, onToggle }: { why: string; open: boolean; onToggle: () => void }) {
  if (!why) return null;
  return (
    <>
      <button onClick={onToggle} className="mt-2 mr-3 cursor-pointer text-xs underline" style={{ color: "#9A8870" }}>
        {open ? "Hide why" : "Why?"}
      </button>
      {open && (
        <p className="mt-1 text-[12px]" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57", lineHeight: 1.5 }}>
          {why}
        </p>
      )}
    </>
  );
}

// Grinder picker: maps the generic grind coarseness to the user's own clicks.
function GrinderSelect({ value, onChange }: { value: GrinderId; onChange: (g: GrinderId) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as GrinderId)}
      aria-label="Your grinder"
      className="cursor-pointer rounded-full px-2 py-0.5 text-[11px]"
      style={{ fontFamily: serif, color: "#7A6A57", background: "#FBF6EA", border: "1.5px solid #D8C9AC" }}
    >
      {GRINDER_OPTIONS.map((g) => (
        <option key={g.id} value={g.id}>{g.name}</option>
      ))}
    </select>
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
