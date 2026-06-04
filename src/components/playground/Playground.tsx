// The Homebrew Playground — single responsive screen.
// Design: "Field Notes" — an editorial brew-journal on warm ruled paper. Left
// recipe sheet (method tabs + five Variable sliders + Brew), right the cup
// (brewer pours in, fills on Brew) and tasting-note slips. Side-by-side on
// desktop, stacked on mobile.
//
// The result is brew-gated: inputs give live visual feedback (grounds, bean,
// thermometer…), but the cup/taste/verdict update on Brew. The extraction
// engine, taste mapper and coach (src/lib/coffee/) are wired in later slices;
// for now Brew plays the animation and reveals placeholders.
import { useState } from "react";
import type { BrewVars, Method } from "@/lib/coffee/types";
import { DEFAULT_VARS, METHODS, VARS, cupColor } from "./config";
import { VarViz, type VizTheme } from "./visuals";
import { BrewStage, VarStrip } from "./brew-stage";

const serif = "'Georgia', 'Iowan Old Style', 'Times New Roman', serif";
const theme: VizTheme = { bed: "#EFE6D2", mark: "#5A3A24", accent: "#A33A28", stroke: "#6F5D49" };
const BREW_MS = 2200;

export default function Playground() {
  const [method, setMethod] = useState<Method>("v60");
  const [vars, setVars] = useState<BrewVars>(DEFAULT_VARS);
  const [brewing, setBrewing] = useState(false);
  const [brewed, setBrewed] = useState(false);

  const setVar = (k: keyof BrewVars, v: number) => setVars((s) => ({ ...s, [k]: v }));
  const onBrew = () => {
    setBrewing(true);
    setBrewed(false);
    window.setTimeout(() => {
      setBrewing(false);
      setBrewed(true);
    }, BREW_MS);
  };

  const methodLabel = METHODS.find((m) => m.id === method)?.label;

  return (
    <div
      className="min-h-svh w-full px-4 py-8 sm:px-8"
      style={{
        color: "#43352A",
        background: "repeating-linear-gradient(180deg,#ECE2CF 0,#ECE2CF 31px,#E2D6BF 32px), #ECE2CF",
      }}
    >
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Recipe sheet — controls */}
        <section className="relative rounded-sm p-6 sm:p-9" style={{ background: "#F8F1E2", boxShadow: "0 1px 0 #fff inset, 0 14px 30px -18px rgba(67,53,42,.6)", border: "1px solid #E0D2B8" }}>
          <div className="mb-5 border-b pb-4" style={{ borderColor: "#E0D2B8" }}>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#A3917A" }}>Brew Journal · No. 001</p>
            <h1 className="mt-1 text-3xl" style={{ fontFamily: serif, fontWeight: 600 }}>Today's Recipe</h1>
          </div>

          {/* Method picker */}
          <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Method</p>
          <div className="mb-7 flex flex-wrap gap-x-5 gap-y-2">
            {METHODS.map((m) => {
              const active = m.id === method;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} aria-pressed={active}
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

          {/* Variable sliders */}
          <div className="divide-y" style={{ borderColor: "#E8DCC6" }}>
            {VARS.map((v) => (
              <div key={v.key} className="flex items-center gap-4 py-4">
                <div className="size-11 shrink-0 overflow-hidden rounded-lg" style={{ border: "1px solid #E0D2B8" }}>
                  <VarViz varKey={v.key} value={vars[v.key]} theme={theme} range={{ min: v.min, max: v.max }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-baseline justify-between">
                    <label className="text-lg" style={{ fontFamily: serif }}>{v.label}</label>
                    <span className="text-lg font-semibold tabular-nums" style={{ fontFamily: serif, color: "#A33A28" }}>{v.fmt(vars[v.key])}</span>
                  </div>
                  <input
                    type="range" min={v.min} max={v.max} step={v.step} value={vars[v.key]}
                    onChange={(e) => setVar(v.key, Number(e.target.value))}
                    aria-label={v.label}
                    className="brew-slider w-full"
                  />
                  <div className="mt-1 flex justify-between text-[11px]" style={{ color: "#A3917A" }}>
                    <span>{v.low}</span>
                    <span>{v.high}</span>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Result — cup + tasting notes */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-sm p-6 text-center" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
            <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>{methodLabel} · The Cup</p>
            <div className="flex justify-center">
              <BrewStage
                method={method}
                theme={theme}
                liquid={cupColor(vars.roast, vars.ratio)}
                brewing={brewing}
                brewed={brewed}
                cupBody="#FFFDF7"
                cupRim="#6F5D49"
                brewMs={BREW_MS}
              />
            </div>
            <div className="mt-5">
              <VarStrip vars={vars} theme={theme} tone={{ chipBg: "#EFE6D2", value: "#A33A28" }} />
            </div>
            <p className="mt-4 text-sm" style={{ fontFamily: serif, fontStyle: "italic", color: "#7A6A57" }}>
              {brewing ? "Brewing…" : brewed ? "Notes appear once it's brewed." : "Pencil in your recipe, then brew."}
            </p>
          </div>
          <div className="rounded-sm p-5" style={{ background: "#F8F1E2", border: "1px dashed #C9B795" }}>
            <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: "#A3917A" }}>Tasting Notes</p>
            <ul className="space-y-2">
              {["Acidity", "Sweetness", "Body", "Balance", "Verdict"].map((t) => (
                <li key={t} className="flex items-center justify-between text-sm" style={{ fontFamily: serif }}>
                  <span>{t}</span>
                  <span className="ml-3 flex-1 border-b border-dotted" style={{ borderColor: "#C9B795" }} />
                  <span className="ml-2" style={{ color: "#B7A589" }}>{brewed ? "—" : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
        .brew-slider { -webkit-appearance:none; appearance:none; height:6px; border-radius:999px; background:#E0D2B8; outline:none; }
        .brew-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:999px; background:#FBF6EA; border:3px solid #A33A28; box-shadow:0 1px 4px rgba(67,53,42,.35); cursor:pointer; }
        .brew-slider::-moz-range-thumb { width:22px; height:22px; border-radius:999px; background:#FBF6EA; border:3px solid #A33A28; cursor:pointer; }
      `}</style>
    </div>
  );
}
