# Homebrew — Coffee Brewing Playground

An interactive, single-screen web app where the user tweaks brewing variables and a brewing method and watches, in real time, how the resulting coffee changes. Educational and grounded in published coffee science (SCA, James Hoffmann, Scott Rao, Barista Hustle, Jonathan Gagné, Hendon/Colonna-Dashwood).

## Language

### Experience

**Playground**:
The single screen of the app: a set of input controls on one side and a live result panel on the other. There is no separate narrative/essay; experimentation happens in one place.
_Avoid_: Guide, essay, tutorial, dashboard

**Result panel**:
The live output area that responds to every control change. **Default (practical) view** leads with the Cup Visualization, the Taste Profile, and the Verdict — plain-language, no jargon. The Control Chart lives behind a **Pro view** toggle for baristas. Same engine drives both.

**Pro view**:
An optional toggle that reveals the Control Chart with TDS/EY numbers and the ideal box. Off by default. For professional brewers; never required to use the app.

**Featured Recipe**:
A curated, read-only recipe shipped with the app — a known brewer's settings for a method (e.g. a champion's V60). Available across all methods. Selecting one animates the **Variables** to those values (reusing the **Apply** morph) so the user watches the cup re-form. The user loads them but never creates or saves their own (see ADR-0004).
_Avoid_: preset, template, "my recipe" (user-saved recipes are out of scope)

### Modes

**Forward mode** (explore):
The default playground flow — adjust knobs, watch the cup/taste/verdict (and Pro chart) respond **live**. Everything updates as you drag; there is no brew-gate in this mode. Entered from the inputs.

**Reverse mode** (Fix my cup):
_Being revived as the v1 differentiator (the prescription engine `coachFromComplaint` is already built); design-of-record below._
The user reports a cup they **already brewed in real life**: they confirm the recipe they used (method + Variables, framed as "the cup you made") and pick how it tasted; the app prescribes the single concrete fix and offers to **Apply** it to the recipe. The complaint **leads** (primary input); the recipe is supporting context that sharpens the target value. Same engine as Forward, run backwards. Most taste entries map 1:1 to control-chart directions: **Sour** (under-extracted), **Bitter** (over-extracted), **Weak/watery** (low TDS), **Too strong** (high TDS), **Just right** (in the ideal box). One does not: **Sour & bitter at once** (espresso, v1.1) signals low **Extraction Evenness** and prescribes **Puck Prep**, not a Variable. The simulated Taste Profile/Verdict are **hidden** here — the user's reported taste is the only diagnosis (see "Trust the tongue") — but the **Cup Visualization** is shown, rendered from the reported taste. There is no **Brew** action in Reverse; **Apply** is the action.

### Inputs (resolved so far)

**Brewing Method**:
The apparatus + technique that defines how water meets coffee (e.g. V60/pour-over, espresso, French press, AeroPress, Chemex, Moka, cold brew). Selecting a method sets default values and adjustable ranges for the variables. Set (locked): **V60/pour-over** (percolation), **French press** (immersion), **Espresso** (pressure), **AeroPress** (hybrid), **Cold brew** (long cold immersion), **Vietnamese phin** (slow metal-drip percolation).
_Avoid_: Brewer, device

**Variable**:
A user-adjustable brewing input. Core set (locked): **Grind Size**, **Water Temperature**, **Brew Ratio**, **Brew Time**, **Roast Level**.
_Avoid_: Parameter, setting, knob (UI may call them knobs, domain term is Variable)

**Grind Size**:
How fine/coarse the grounds are. Primary lever on Extraction Yield: finer → higher EY (more surface area, slower flow). Also widens to over-extraction past the ideal.

**Water Temperature**:
Brew water temp. Higher → faster/higher extraction. SCA range ~90–96°C; too hot tips bitter, too cool tips sour.

**Brew Ratio**:
Coffee dose relative to water (e.g. 1:16). The lever that moves **Strength** (TDS) largely independently of Extraction. Filter ~1:15–1:18, espresso ~1:2.

**Brew Time**:
Total water–coffee contact time. Longer → higher extraction (diminishing past a point). Method-dependent (espresso ~25–30s, V60 ~2.5–3.5min, French press ~4min, cold brew hours).

**Roast Level**:
Continuous light↔dark slider (rendered ~0–100, dark = higher). Darker → more soluble/porous → extracts faster, so the same other settings land further right on the chart. Calibrated from light/medium/dark anchor points in the research and interpolated.

**Grinder**:
The user's own grinder model (optional). It is _not_ a **Variable** — it changes nothing about the brew; it only re-expresses the generic **Grind Size** coarseness as that model's own clicks/setting (e.g. "≈ Comandante C40 · ~20 clicks"), so the abstract slider maps to a real dial-in. With no grinder picked it falls back to everyday references (sea salt, table sugar…). Settings are sourced midpoints of published per-method dial-in ranges; persisted in the `grinder` search param.
_Avoid_: calibration, micron readout (we show clicks, not microns)

### Inline learning

**Inline learning**:
Opt-in explanation woven into the controls so the Playground teaches without a tutorial: an info icon on every **Variable** (what it is + what raising/lowering it does) and a **"Why?"** expander on the **Verdict** (the reasoning behind the prescribed **Fix**). Both read from one content source (`variable-info`), so the slider tooltip and the Verdict's reasoning never drift apart. Plain language; depth is opt-in, never forced.

**Re-dial reframe**:
Copy that frames re-dialing as expected craft, not failure ("Beans drift as they age — re-dialing with each new bag is normal"). Softens the repeatability pain that user-authored journaling is deliberately not solving (ADR-0004), without storing anything.

### Technique

_Planned (v1.1), espresso-only at launch. The design-of-record below; not yet exposed in the UI._

**Technique**:
An input that affects how **evenly** water passes through the coffee bed — a different *kind* of input from a **Variable**. A Variable moves the brew's single (Extraction, Strength) point on the **Control Chart**; Technique instead drives **Extraction Evenness**. Kept distinct so the model stays honest: one moves the dot, the other moves the *spread*.
_Avoid_: Variable, parameter, prep (when ambiguous)

**Puck Prep**:
The single **Technique** input at launch (espresso-only): a **Sloppy↔Dialed** slider standing in for real-world distribution + tamp quality (WDT, level tamp). Low → **Channeling**; high → even extraction. Never touches the dose/grind/ratio numbers.
_Avoid_: WDT, tamp, distribution (real-world sub-techniques that Puck Prep abstracts into one knob)

### Outputs

**Control Chart**:
The SCA Coffee Brewing Control Chart — a 2D plot of **Strength** (vertical, TDS %) against **Extraction** (horizontal, Extraction Yield %), with the "ideal" target box. The current brew is a dot that moves as variables change. When **Extraction Evenness** is low (espresso, v1.1), the dot widens into a smear/split spanning under- and over-extraction at once, rather than a single point.
_Avoid_: Graph, brewing compass

**Extraction Yield (EY)**:
The percentage of the coffee grounds' mass that dissolved into the final beverage. The horizontal axis of the Control Chart. Ideal ~18–22%.
_Avoid_: Extraction %, yield (when ambiguous)

**TDS (Total Dissolved Solids)**:
The concentration of dissolved coffee in the beverage, as a %. The vertical axis of the Control Chart; perceived as **Strength**. Ideal ~1.15–1.45%.

**Strength**:
The perceived intensity of the brew, driven by TDS. Distinct from Extraction — a brew can be strong but under-extracted, etc.

**Extraction Evenness**:
How uniformly the coffee bed extracted (planned v1.1, espresso-only). The brew is no longer only a single dot: at low evenness, parts of the bed over-extract while others under-extract **simultaneously**. Driven by **Puck Prep**, not by any **Variable**. High = a tight dot in the ideal box; low = a smeared/split dot.
_Avoid_: consistency, uniformity (overloaded elsewhere)

**Channeling**:
The low-**Extraction Evenness** failure mode: water finds a path of least resistance, so some grounds blow past ideal (bitter) while others barely extract (sour) — it tastes **sour and bitter at once**, the signature the single-point model cannot show. Rendered in the **Brew** animation as a spraying, spritzing bottomless-portafilter pull. Fixed by **Puck Prep**, never by a grind number.
_Avoid_: spritzing, spraying (symptoms, not the term)

**Taste Profile**:
A live human-readable flavor readout on five positive-attribute axes (confirmed): **Acidity**, **Sweetness**, **Bitterness**, **Body**, **Balance**. Most axes derive from where the brew sits relative to the ideal extraction zone. **Acidity** is a desirable cup attribute, _not_ the under-extraction sour defect (`[research/06]`: acidity falls as roast darkens; light = brighter): it is driven mostly by **roast level** (light = bright, dark = flat), then modulated by extraction — under-extraction reads sharper, over-extraction mutes it as bitterness masks it. It is therefore non-zero except at very dark roast, even for over-extracted brews.

**Verdict**:
Plain-language coaching tied to the numbers. Always leads with the **single highest-leverage fix** (change one variable at a time, per Rao/Hoffmann technique), e.g. "Tastes sour → grind one step finer." Alternatives ("…or +2°C, or +20s") are revealed on demand, not shown by default.

**Cup Visualization**:
A drawn cup whose color/darkness, crema, and body visibly change with the brew. In **Forward mode** it updates **live** with the variables. In **Reverse mode** it renders **"the cup you made"** biased by the user's *reported* taste (not the simulation — see **Trust the tongue**), then animates that cup **morphing into the corrected cup** on **Apply**.

**Brew**:
A button whose meaning depends on mode. In **Forward mode** it is a **flourish**: it replays the method-specific brewing animation (pour/drip/press/pull/steep) for delight, but changes no data — the cup/taste/verdict are already live. In **Reverse mode** there is no Brew — the cup was already made in real life; the action there is **Apply** (write the prescribed fix into the recipe).

**Brew sound**:
A method-appropriate audio clip the **Brew** press plays as part of the flourish (pour-gurgle, espresso whir, press plunge, phin drip, cold-brew pour). An explicit user gesture, so autoplay policies are satisfied; never fires on slider drags. Clips lazy-load on first Brew. Silenced by **Mute**, and independent of `prefers-reduced-motion`.

**Mute**:
A masthead toggle (beside °C/°F) that silences the **Brew sound**. Off by default; persists via the `muted` search param, so it is shareable and refresh-safe.

**Apply**:
The Reverse-mode action: writes a prescribed **Fix** into the current recipe (a **Variable**'s `setValue`, or — for a **Channeling** complaint — a **Puck Prep** correction) and animates the **Cup Visualization** morphing from "the cup you made" toward the corrected cup.

**Trust the tongue** (principle):
In Reverse mode the user's *reported* taste is ground truth and overrides the simulation. If the engine thinks a recipe is dialed in but the user says it tasted sour, the app coaches for sour. The simulated Verdict/Taste Profile are therefore not shown in Reverse.

## Flagged ambiguities

- **Under/over-extraction vs strength**: "weak/strong" refers to TDS (Strength); "sour/bitter" refers to Extraction position. Keep them separate — they are independent axes on the Control Chart.
- **"Sour and bitter at once" is not a chart position**: it is the taste signature of low **Extraction Evenness** (**Channeling**), not a point on the chart. In Reverse mode it becomes a distinct complaint whose prescribed **Fix** is **Puck Prep**, not a **Variable** — the only complaint that does not map to a single chart direction.

## Example dialogue

> **Dev:** If I make the grind finer, the cup gets stronger, right?
> **Expert:** Careful — finer grind mainly raises **Extraction Yield**, moving the dot right on the **Control Chart**. It can nudge **TDS** up too, but Strength and Extraction are separate axes. Past ~22% EY you cross into over-extraction and the **Taste Profile** tips bitter.
> **Dev:** So to make it stronger without over-extracting, I change the **Brew Ratio**, not the grind.
> **Expert:** Right — more coffee per water raises TDS (Strength) while leaving Extraction roughly where it is.
