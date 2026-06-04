// The Homebrew Playground — single responsive screen.
// Design: "Field Notes" — an editorial brew-journal on warm ruled paper. Left
// recipe sheet (method tabs + five Variable sliders + Brew), right the cup
// (brewer pours in, fills on Brew), tasting-note slips and the verdict. A Pro
// view reveals the SCA control chart; a Forward/Reverse toggle switches between
// "explore" and "fix my cup". Side-by-side on desktop, stacked on mobile.
//
// The result is brew-gated: inputs give live visual feedback (grounds, bean,
// thermometer, the live chart dot), but the cup/taste/verdict update on Brew.
// The Extraction Engine, Taste Mapper and Coach (src/lib/coffee/) drive both
// Forward and Reverse modes. Brew state lives in TanStack Router search params
// (the single source of truth), so every brew is shareable and refresh-safe.
import { useState } from "react";
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
import { grindReference } from "@/lib/coffee/grind";
import { methodSpec } from "@/lib/coffee/methods";
import { defaultSearchVars, type BrewSearch, type Mode } from "@/lib/brew-search";
import { METHODS, VAR_META, varRanges, fmtVar, ratioGrams } from "./config";
import { VarViz, type VizTheme } from "./visuals";
import { BrewStage, VarStrip } from "./brew-stage";
import { ControlChart } from "./control-chart";

const route = getRouteApi("/");

const serif = "'Georgia', 'Iowan Old Style', 'Times New Roman', serif";
const theme: VizTheme = { bed: "#EFE6D2", mark: "#5A3A24", accent: "#A33A28", stroke: "#6F5D49" };
const BREW_MS = 2200;

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

const COMPLAINTS: { id: TasteComplaint; label: string; note: string }[] = [
  { id: "sour", label: "Sour", note: "sharp, under-extracted" },
  { id: "bitter", label: "Bitter", note: "harsh, over-extracted" },
  { id: "weak", label: "Weak / watery", note: "thin, low strength" },
  { id: "too-strong", label: "Too strong", note: "intense, high strength" },
  { id: "just-right", label: "Just right", note: "in the sweet spot" },
];

export default function Playground() {
  // Search params are the single source of truth for the persistent brew state.
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { method, mode, pro: proView, unit: tempUnit, brewed } = search;
  const vars: BrewVars = {
    grind: search.grind,
    waterTemp: search.waterTemp,
    ratio: search.ratio,
    time: search.time,
    roast: search.roast,
  };

  // Transient, non-shareable UI state.
  const [brewing, setBrewing] = useState(false);
  const [showAlts, setShowAlts] = useState(false);
  const [complaint, setComplaint] = useState<TasteComplaint | null>(null);

  const spec = methodSpec(method);
  const ranges = varRanges(method);

  // The result is derived from the (brew-gated) search state, so it survives
  // refresh; the chart preview reads live from the current variables.
  const result: BrewResult | null = brewed ? runBrew(method, vars) : null;
  const livePreview = extractFrom(method, vars);

  // Merge a patch into the search params (replace: no back-stack spam).
  const patch = (p: Partial<BrewSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...p }), replace: true });

  // Editing any Variable re-gates the result (cup reverts until the next Brew).
  const setVar = (k: keyof BrewVars, v: number) => patch({ [k]: v, brewed: false } as Partial<BrewSearch>);

  const selectMethod = (m: Method) => {
    setComplaint(null);
    patch({ method: m, ...defaultSearchVars(m), brewed: false });
  };

  const onBrew = () => {
    setBrewing(true);
    setShowAlts(false);
    window.setTimeout(() => {
      setBrewing(false);
      patch({ brewed: true });
    }, BREW_MS);
  };

  const switchMode = (m: Mode) => {
    setComplaint(null);
    patch({ mode: m });
  };

  // Reverse mode: prescribe a fix from the chosen taste complaint.
  const reverseFix: CoachResult | null = complaint ? coachFromComplaint(complaint, method, vars) : null;
  const applyFix = (variable: keyof BrewVars, value: number) =>
    patch({ [variable]: value, brewed: false } as Partial<BrewSearch>);

  return (
    <div
      className="min-h-svh w-full px-4 py-7 sm:px-8"
      style={{
        color: "#43352A",
        background: "repeating-linear-gradient(180deg,#ECE2CF 0,#ECE2CF 31px,#E2D6BF 32px), #ECE2CF",
      }}
    >
      <div className="mx-auto max-w-5xl">
        {/* journal masthead + toggles */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-3" style={{ borderColor: "#D8C9AC" }}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#A3917A" }}>Homebrew · Brew Journal</p>
            <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: serif, fontWeight: 600 }}>
              {mode === "forward" ? "Explore your cup" : "Fix my cup"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={[{ v: "forward", l: "Explore" }, { v: "reverse", l: "Fix my cup" }]}
              value={mode}
              onChange={(v) => switchMode(v as Mode)}
            />
            <Toggle label="Pro view" on={proView} onClick={() => patch({ pro: !proView })} />
            <Segmented
              options={[{ v: "C", l: "°C" }, { v: "F", l: "°F" }]}
              value={tempUnit}
              onChange={(v) => patch({ unit: v as "C" | "F" })}
            />
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
                    className="pb-0.5 text-base transition-all"
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

            {/* Brew */}
            <div className="mt-8 flex justify-center">
              <button onClick={onBrew} disabled={brewing}
                className="rotate-[-3deg] rounded-md px-10 py-3 text-xl uppercase tracking-[0.15em] transition-all hover:rotate-0 active:translate-y-px disabled:opacity-60"
                style={{ fontFamily: serif, fontWeight: 700, color: "#A33A28", border: "3px double #A33A28", background: "rgba(163,58,40,.05)" }}>
                {brewing ? "Brewing…" : "Brew it"}
              </button>
            </div>
          </section>

          {/* ── Result ── */}
          <aside className="flex flex-col gap-4">
            {/* Cup */}
            <div className="rounded-sm p-6 text-center" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
              <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>{spec.label} · The Cup</p>
              <div className="flex justify-center">
                <BrewStage
                  method={method}
                  theme={theme}
                  liquid={previewColor(vars)}
                  cup={result?.taste.cup}
                  brewing={brewing}
                  brewed={brewed}
                  cupBody="#FFFDF7"
                  cupRim="#6F5D49"
                  brewMs={BREW_MS}
                />
              </div>
              <div className="mt-5">
                <VarStrip vars={vars} method={method} theme={theme} tempUnit={tempUnit} tone={{ chipBg: "#EFE6D2", value: "#A33A28" }} />
              </div>
              {!brewed && (
                <p className="mt-4 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>
                  {brewing ? "Brewing…" : "Pencil in your recipe, then brew."}
                </p>
              )}
            </div>

            {/* Reverse mode: complaint picker + prescribed fix */}
            {mode === "reverse" && (
              <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
                <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>How did your last cup taste?</p>
                <div className="flex flex-wrap gap-2">
                  {COMPLAINTS.map((c) => {
                    const active = complaint === c.id;
                    return (
                      <button key={c.id} onClick={() => setComplaint(c.id)} aria-pressed={active}
                        className="rounded-full px-3 py-1.5 text-sm transition-all"
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
                {reverseFix && (
                  <div className="mt-4 rounded-sm p-4" style={{ background: "#EFE6D2", border: "1px solid #E0D2B8" }}>
                    <p className="text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>{reverseFix.diagnosis}</p>
                    {reverseFix.dialedIn ? (
                      <p className="mt-2 text-lg" style={{ fontFamily: serif, color: "#A33A28" }}>Keep this recipe — it's dialed in. ☕</p>
                    ) : (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-lg" style={{ fontFamily: serif, fontWeight: 600 }}>{reverseFix.primaryFix.instruction}</p>
                        <button onClick={() => applyFix(reverseFix.primaryFix.variable, reverseFix.primaryFix.setValue)}
                          className="shrink-0 rounded-md px-4 py-1.5 text-sm uppercase tracking-wide"
                          style={{ fontFamily: serif, fontWeight: 700, color: "#F8F1E2", background: "#A33A28" }}>
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pro view: SCA control chart (dot previews live, lands on Brew) */}
            {proView && (
              <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
                <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Pro · Control Chart</p>
                <ControlChart
                  result={result?.extraction ?? livePreview}
                  domain={spec.chart.domain}
                  idealBox={spec.chart.ideal}
                  tdsDecimals={method === "espresso" ? 1 : 2}
                  className="w-full"
                />
                <p className="mt-1 text-center text-[11px]" style={{ color: "#9A8870" }}>
                  EY {(result?.extraction ?? livePreview).extractionYield}% · TDS {(result?.extraction ?? livePreview).tds}%
                </p>
              </div>
            )}

            {/* Taste profile + verdict (brew-gated) */}
            <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
              <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Tasting Notes</p>
              {result ? (
                <>
                  <TasteProfile taste={result.taste} />
                  <Verdict coach={result.coach} showAlts={showAlts} onToggleAlts={() => setShowAlts((s) => !s)} onApply={applyFix} />
                </>
              ) : (
                <ul className="space-y-2">
                  {["Acidity", "Sweetness", "Body", "Balance", "Verdict"].map((t) => (
                    <li key={t} className="flex items-center justify-between text-sm" style={{ fontFamily: serif }}>
                      <span>{t}</span>
                      <span className="ml-3 flex-1 border-b border-dotted" style={{ borderColor: "#C9B795" }} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .brew-slider { -webkit-appearance:none; appearance:none; height:6px; border-radius:999px; background:#E0D2B8; outline:none; }
        .brew-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:999px; background:#FBF6EA; border:3px solid #A33A28; box-shadow:0 1px 4px rgba(67,53,42,.35); cursor:pointer; }
        .brew-slider::-moz-range-thumb { width:22px; height:22px; border-radius:999px; background:#FBF6EA; border:3px solid #A33A28; cursor:pointer; }
        .ml-15 { margin-left: 3.75rem; }
      `}</style>
    </div>
  );
}

/** Live pre-brew cup colour (the brewed colour comes from the Taste Mapper). */
function previewColor(vars: BrewVars): string {
  const strength = 100 - (vars.ratio - 6) * 6;
  const l = 0.4 - vars.roast * 0.0014 - strength * 0.0004;
  return `oklch(${Math.max(0.18, l).toFixed(3)} 0.07 60)`;
}

// ── five-axis taste profile ──────────────────────────────────────────────────
const AXES: { key: keyof TasteResult["taste"]; label: string }[] = [
  { key: "sourness", label: "Acidity" },
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

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className="flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors"
      style={{ fontFamily: serif, color: on ? "#F8F1E2" : "#7A6A57", background: on ? "#A33A28" : "transparent", border: "1.5px solid #D8C9AC" }}>
      <span className="inline-block size-2 rounded-full" style={{ background: on ? "#F8F1E2" : "#C9B795" }} />
      {label}
    </button>
  );
}
