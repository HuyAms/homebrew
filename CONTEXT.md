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

### Modes

**Forward mode** (explore):
The default playground flow — adjust knobs, watch the cup/taste/verdict (and Pro chart) respond **live**. Everything updates as you drag; there is no brew-gate in this mode. Entered from the inputs.

**Reverse mode** (Fix my cup):
_Deferred — not currently exposed in the UI; the prescription engine (`coachFromComplaint`) is retained dormant for a later revival. The design below is the design-of-record for when it returns._
The v1 differentiator. The user reports a cup they **already brewed in real life**: they confirm the recipe they used (method + Variables, framed as "the cup you made") and pick how it tasted; the app prescribes the single concrete fix and offers to **Apply** it to the recipe. The complaint **leads** (primary input); the recipe is supporting context that sharpens the target value. Same engine as Forward, run backwards. Taste entries map 1:1 to control-chart directions: **Sour** (under-extracted), **Bitter** (over-extracted), **Weak/watery** (low TDS), **Too strong** (high TDS), **Just right** (in the ideal box). The simulated Taste Profile/Verdict are **hidden** here — the user's reported taste is the only diagnosis (see "Trust the tongue"). There is no **Brew** action in Reverse; **Apply** is the action.

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

### Outputs

**Control Chart**:
The SCA Coffee Brewing Control Chart — a 2D plot of **Strength** (vertical, TDS %) against **Extraction** (horizontal, Extraction Yield %), with the "ideal" target box. The current brew is a dot that moves as variables change.
_Avoid_: Graph, brewing compass

**Extraction Yield (EY)**:
The percentage of the coffee grounds' mass that dissolved into the final beverage. The horizontal axis of the Control Chart. Ideal ~18–22%.
_Avoid_: Extraction %, yield (when ambiguous)

**TDS (Total Dissolved Solids)**:
The concentration of dissolved coffee in the beverage, as a %. The vertical axis of the Control Chart; perceived as **Strength**. Ideal ~1.15–1.45%.

**Strength**:
The perceived intensity of the brew, driven by TDS. Distinct from Extraction — a brew can be strong but under-extracted, etc.

**Taste Profile**:
A live human-readable flavor readout on five axes (confirmed): **Sourness/acidity**, **Sweetness**, **Bitterness**, **Body**, **Balance** — derived from where the brew sits relative to the ideal extraction zone.

**Verdict**:
Plain-language coaching tied to the numbers. Always leads with the **single highest-leverage fix** (change one variable at a time, per Rao/Hoffmann technique), e.g. "Tastes sour → grind one step finer." Alternatives ("…or +2°C, or +20s") are revealed on demand, not shown by default.

**Cup Visualization**:
A drawn cup whose color/darkness, crema, and body visibly change with the brew. In **Forward mode** it updates **live** with the variables. In **Reverse mode** it is gated (see **Brew**).

**Brew**:
A button whose meaning depends on mode. In **Forward mode** it is a **flourish**: it replays the method-specific brewing animation (pour/drip/press/pull/steep) for delight, but changes no data — the cup/taste/verdict are already live. In **Reverse mode** there is no Brew — the cup was already made in real life; the action there is **Apply** (write the prescribed fix into the recipe).

**Apply**:
The Reverse-mode action: writes a prescribed **Fix** into the current recipe (the Variable's `setValue`), correcting "the cup you made" toward the ideal.

**Trust the tongue** (principle):
In Reverse mode the user's *reported* taste is ground truth and overrides the simulation. If the engine thinks a recipe is dialed in but the user says it tasted sour, the app coaches for sour. The simulated Verdict/Taste Profile are therefore not shown in Reverse.

## Flagged ambiguities

- **Under/over-extraction vs strength**: "weak/strong" refers to TDS (Strength); "sour/bitter" refers to Extraction position. Keep them separate — they are independent axes on the Control Chart.

## Example dialogue

> **Dev:** If I make the grind finer, the cup gets stronger, right?
> **Expert:** Careful — finer grind mainly raises **Extraction Yield**, moving the dot right on the **Control Chart**. It can nudge **TDS** up too, but Strength and Extraction are separate axes. Past ~22% EY you cross into over-extraction and the **Taste Profile** tips bitter.
> **Dev:** So to make it stronger without over-extracting, I change the **Brew Ratio**, not the grind.
> **Expert:** Right — more coffee per water raises TDS (Strength) while leaving Extraction roughly where it is.
