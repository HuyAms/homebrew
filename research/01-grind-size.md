# Grind Size & Particle Size Distribution in Coffee Brewing

Research notes for an interactive brewing simulator. Every non-obvious claim is tagged with a bracketed source key, e.g. `[Gagné-PSD]`, defined in the **Sources** section.

---

## 1. What grind size physically changes

Grinding breaks beans into smaller particles. The three coupled physical effects:

1. **Surface area.** Smaller particles expose more total surface area to water. Extraction happens at the water/coffee interface, so more surface area = faster dissolution of solubles. "Yield is inversely proportional to grind size; a smaller grain size produces more surface area and faster extraction." `[Wiki-Extraction]` (paraphrasing the standard extraction-kinetics view).
2. **Diffusion path length.** Finer particles have shorter internal paths for dissolved compounds to diffuse out of the cell matrix, so each particle reaches a given extraction level faster. This is the diffusion-limited side of extraction kinetics discussed throughout Gagné's extraction work. `[Gagné-EY]`
3. **Flow resistance / permeability (percolation only).** In a packed bed (V60, espresso, drip), finer grounds pack tighter and create more resistance, slowing water flow and increasing contact time. This is a competing effect: finer grind both speeds per-particle extraction AND slows flow, and the two partially offset in percolation brewers. Fines are the dominant driver of bed resistance — "flow depends on the amount of fines." `[Gagné-PSD]`

**Key simulator insight:** grind has *opposite-signed* effects on the two main extraction levers. Finer → higher per-particle extraction rate (raises EY), but finer → slower flow → longer contact time in percolation (also raises EY), while in immersion only the surface-area effect matters because contact time is fixed by the recipe.

---

## 2. Finer vs coarser grind → extraction yield & flavor

The governing target is **Extraction Yield (EY)** = fraction of the dry coffee mass dissolved into the beverage. `[Gagné-EY]`

### The Golden Cup / SCA control-chart framing
- **Ideal EY: 18–22%** for most brewed coffee. Below ~18% = under-extracted; above ~22% = over-extracted. `[Wiki-Extraction]` (citing Schulman 2007, the basis of the SCA Brewing Control Chart)
- **Ideal strength (TDS): ~1.15–1.35%** for filter coffee. `[Wiki-Extraction]`
- Gagné personally targets **EY ≈ 20%, TDS ≈ 1.25%** for V60. `[Gagné-V60]`

### Directional flavor mapping
- **Finer grind → higher EY → toward bitter/over-extracted.** The SCA control chart labels the over-extracted (right) side as **bitter**. `[SCA-Chart]`
- **Coarser grind → lower EY → toward sour/under-extracted.** The under-extracted (left) side is "under-developed," typically perceived as **sour or grassy**. `[SCA-Chart]`
- Caveat from current SCA research: the classic 2-axis chart oversimplifies. The chart "reduces all this complexity down to just two attributes, bitter and under-developed," and newer sensory work finds, e.g., that **sweetness peaks at lower TDS** than the chart implies. Treat the chart as directional, not exact. `[SCA-Chart]`

**So grind is the primary knob for moving along the under→over-extraction axis** (with brew time and temperature as secondary knobs). To dial in: too sour → grind finer; too bitter/astringent → grind coarser.

---

## 3. Particle size distribution (PSD), fines, bimodality, grinder types

A grinder never produces one particle size — it produces a **distribution**. The shape of that distribution matters as much as its average.

### Bimodality and fines
- Real grinders produce a **roughly bimodal distribution**: a main peak (the target size, ~1 mm for filter) plus a secondary population of **fines** (sub-0.5 mm) and a tail of **boulders** (~2 mm). `[Gagné-PSD]`
- **Fines** (< 0.5 mm) over-extract quickly (huge surface area, short diffusion path) and also clog the bed, raising flow resistance and promoting uneven flow / astringency. Fines are the single biggest source of cross-method behavior differences: "Immersion will be very different than percolation … as flow depends on the amount of fines." `[Gagné-PSD]`
- **Boulders** (~2 mm) under-extract (they stay sour). A wide distribution therefore extracts unevenly — simultaneously over-extracting fines and under-extracting boulders — muddying the cup even when *average* EY looks correct.

### Grinder quality (narrower distribution = better)
- Measured example: **Baratza Forté (54 mm flat burrs)** vs **Lido 3 (48 mm conical burrs)**, both at ~1 mm peak. The Forté "generates way less fines (with diameters below 0.5 mm) and slightly less boulders," indicating higher grind quality. `[Gagné-PSD]`
- General principle from Gagné's recipe notes: "The Lido 3 produces more small particles than the Mahlkönig EK at similar average particle size." `[Gagné-V60]` → confirms that two grinders at the *same average* can behave differently because of fines content.
- **Better grinders = narrower (more unimodal) distribution = fewer fines and boulders = more even extraction = ability to push higher EY before astringency appears.** A simulator should model "grinder quality" as distribution *width*, separate from grind *size* (the mean).

### Burr vs blade grinders
- **Burr grinders** produce "particles of a uniform size determined by the separation between the grinding surfaces." Grind size is set by the burr gap. `[Wiki-Burr]`
- **Blade grinders** chop randomly → very wide, uncontrolled distribution (lots of both dust and boulders) and are not size-controllable. They also heat the grounds more by friction; "oils and aromas can easily dissipate if the beans become too hot." `[Wiki-Burr]` Burrs heat the product less.
- **Conical vs flat burrs:** both are burr designs; the credible measured comparison above (`[Gagné-PSD]`) shows the specific *unit* (alignment, burr geometry) matters more than the conical/flat label alone — the flat Forté beat the conical Lido on fines in that test, but this is unit-specific, not a universal rule.

---

## 4. Recommended grind ranges per brew method

Qualitative ordering (finest → coarsest): **Turkish → espresso → moka → V60/pour-over ≈ drip → AeroPress → Chemex → French press → cold brew.**

Quantitative micron ranges (where the bulk of particles should fall; individual particles always vary). These are practical/recipe-derived ranges, not inventor specs: `[HCG-Chart]`

| Method | Grind (microns) | Notes |
|---|---|---|
| Turkish | 40–220 | Finest; powder-like |
| Espresso | 180–380 | Fine; high bed resistance is intended `[Hendon-Espresso]` |
| Moka pot | 360–660 | Fine–medium |
| V60 / pour-over | 400–700 (V60); 410–930 (general pour-over) | Medium-fine |
| Drip / auto filter | 300–900 | Medium |
| AeroPress | 320–960 | Wide usable range (recipe-dependent) `[Gagné-AeroPress]` |
| Chemex | ~ coarse end of pour-over / medium-coarse | Thick filter → slower flow → grind a touch coarser than V60 (qualitative, by method consensus) |
| French press | 690–1300 | Coarse; immersion + metal filter → coarse to limit fines passing through |
| Cold brew | 800–1400 | Coarsest; very long contact time compensates for low surface area |

Method-specific sourced data points:
- **V60:** Gagné's recipe — 22 g coffee, 352 g water (1:16), ~91–93 °C slurry, ~2:30–3:30 total, Lido 3 "mark 9," particles ~0.4–1.5 mm, targeting EY ~20% / TDS ~1.25%. `[Gagné-V60]`
- **AeroPress (immersion, long steep):** 18 g coffee, 260 g water (1:14.4) at 99–100 °C, 10-min steep. Achieves measured EY ≈ 23.5% that *tastes* like a ~27% percolation brew. Crucially, "how much solubles you will be able to extract without getting uneven flow and astringency will depend on … how many fines [your grinder] produces." `[Gagné-AeroPress]`
- **Espresso:** see Section 5/6 — fine grind (180–380 µm) creates high bed resistance for pressurized extraction; the Hendon work shows going *slightly coarser* than tradition improves results. `[Hendon-Espresso]` `[HCG-Chart]`

---

## 5. The espresso counterintuitive result (peer-reviewed)

Cameron, Hendon et al., *Matter* (2020), "Systematically Improving Espresso," built a mathematical model + experiments of espresso extraction. Core findings relevant to grind: `[Hendon-Espresso]`

- Grinding **too fine** causes **channeling**: water carves preferential paths through the dense puck, so large regions of grounds are bypassed and overall extraction becomes **less uniform and less reproducible**, with high shot-to-shot variability in EY.
- The recommended fix was to grind **coarser than traditional** and use a **lower dose / less water**, which *raised* reproducibility and EY while *reducing* coffee used (the widely cited dose reduction was on the order of ~20 g → ~15 g per shot), cutting waste/cost with no flavor penalty.
- Lesson for the simulator: **finer is not monotonically "more extraction"** in percolation/pressurized brewing — past a point, uneven flow (channeling) drops *effective* EY and especially drops *consistency*. Even extraction (low PSD width, no channeling) matters as much as the mean grind.

---

## 6. Interactions with other variables

Grind never acts alone. The main interactions, all directional:

- **Time:** Longer contact → higher EY (more time to dissolve/diffuse). Grind and time partly substitute: a finer grind reaches target EY in less time. In percolation, grinding finer *also* lengthens contact time indirectly by slowing flow — a compounding effect. `[Gagné-EY]` `[Gagné-V60]`
- **Brew ratio (coffee:water):** Sets strength (TDS) largely independently of EY. SCA regional norms: North American ~55 g/L (≈1:18), Nordic ~63 g/L (≈1:16), European ~58 g/L (≈1:17). `[Wiki-Extraction]` Ratio moves you vertically (strength) on the control chart; grind/time/temp move you horizontally (EY). `[SCA-Chart]`
- **Temperature:** Hotter water → faster extraction → higher EY. SCA brew range ~91–94 °C (Rao 2010). `[Wiki-Extraction]` Gagné brews near-boiling, with slurry settling to ~91–93 °C for V60. `[Gagné-V60]` Higher temp can substitute for a slightly coarser grind to hit the same EY; near-boiling AeroPress gave "extreme sweetness." `[Gagné-AeroPress]`
- **Agitation / turbulence:** More agitation → faster, more even extraction (raises EY). Gagné uses the "Rao spin" and high pours to add turbulence; back-and-forth (not circular) stirring in AeroPress avoids dome-shaped beds that cause edge channeling and astringency. `[Gagné-V60]` `[Gagné-AeroPress]`
- **Percolation vs immersion (interacts with fines):** In **immersion** (French press, long-steep AeroPress, cold brew) contact time is fixed by recipe and flow resistance is irrelevant, so only surface area/diffusion matter — fines mostly cause over-extraction/sludge. In **percolation** (V60, Chemex, espresso, drip) fines additionally throttle flow, so the same grind behaves very differently. `[Gagné-EY]` `[Gagné-PSD]`

---

## 7. Quantifiable relationships for a simulator

Directional rules with approximate magnitudes/anchors from cited sources. Treat coefficients as tunable; sources give direction and anchor points, not universal closed-form constants.

**Anchor targets (filter):** EY 18–22% ideal (sweet spot ~20%); TDS 1.15–1.35% (~1.25%). `[Wiki-Extraction]` `[Gagné-V60]`

**Grind size (mean particle diameter `d`):**
- EY ∝ surface area ∝ ~1/d (per-particle). Halving particle diameter roughly quadruples surface area (area ∝ d²) for a fixed mass of spheres → strongly raises extraction rate. (Geometric; consistent with `[Wiki-Extraction]`.)
- Flow rate in percolation **decreases** as grind gets finer; resistance is dominated by **fines fraction**, not the mean alone. `[Gagné-PSD]`
- Direction: **finer → higher EY, slower flow, longer contact (percolation), shift toward bitter; coarser → lower EY, faster flow, shift toward sour.** `[SCA-Chart]` `[Wiki-Extraction]`

**PSD width (grinder quality), independent axis:**
- Wider distribution / more fines → more *simultaneous* over- and under-extraction → lower achievable "clean" EY ceiling before astringency. Narrower PSD → can push EY higher cleanly. `[Gagné-PSD]` `[Gagné-AeroPress]`
- Model fines as a separate slider that (a) raises local over-extraction and (b) raises percolation bed resistance / channeling risk.

**Channeling (percolation/espresso):**
- Beyond a fineness threshold (or with poor distribution), *effective* EY and especially *reproducibility* fall sharply. Model as a penalty term that grows as grind gets very fine or PSD width gets large. `[Hendon-Espresso]`

**Cross-variable substitution (all raise EY):** finer grind ↔ longer time ↔ higher temp ↔ more agitation. A simulator can treat these as partially interchangeable inputs to a single EY value, then map EY→flavor via the control-chart axis. `[Gagné-EY]` `[SCA-Chart]` `[Wiki-Extraction]`

**Strength is mostly orthogonal:** TDS set primarily by brew ratio; EY set primarily by grind/time/temp/agitation. Two-axis model (EY × TDS) matches the SCA chart structure. `[SCA-Chart]` `[Wiki-Extraction]`

---

## Sources

- **`[Gagné-PSD]`** Jonathan Gagné, "An App to Measure Your Coffee Grind Size Distribution," *Coffee ad Astra* — https://coffeeadastra.com/2019/04/07/an-app-to-measure-your-coffee-grind-size-distribution-2/ (bimodal PSD, fines <0.5 mm, boulders ~2 mm, Forté vs Lido 3 fines comparison, fines drive flow).
- **`[Gagné-EY]`** Jonathan Gagné, "Measuring and Reporting Extraction Yields," *Coffee ad Astra* — https://coffeeadastra.com/2019/02/17/measuring-and-reporting-extraction-yields/ (EY definition, percolation vs immersion vs mixed-phase, refractometer method).
- **`[Gagné-V60]`** Jonathan Gagné, "Brewing Better Coffee" (V60 recipe), *Coffee ad Astra* — https://coffeeadastra.com/2018/11/30/brewing-better-coffee/ (22 g/352 g 1:16, ~91–93 °C, Rao spin, particle range, EY 20% / TDS 1.25%, Lido vs EK fines).
- **`[Gagné-AeroPress]`** Jonathan Gagné, "Reaching Fuller Flavor Profiles with the AeroPress," *Coffee ad Astra* — https://coffeeadastra.com/2021/09/07/reaching-fuller-flavor-profiles-with-the-aeropress/ (18 g/260 g 1:14.4, 99–100 °C, 10-min steep, EY 23.5% tasting like 27% percolation, fines/astringency, back-and-forth stir).
- **`[SCA-Chart]`** Specialty Coffee Association, "Towards a New Brewing Chart," *25 Magazine* Issue 13 — https://sca.coffee/sca-news/25/issue-13/towards-a-new-brewing-chart (control-chart axes: under-developed/sour vs bitter; strength; chart oversimplification; sweetness peaks at lower TDS).
- **`[Hendon-Espresso]`** M.I. Cameron, C.H. Hendon, et al., "Systematically Improving Espresso: Insights from Mathematical Modeling and Experiment," *Matter* 2(3):631–648 (2020), DOI 10.1016/j.matt.2019.12.019 — https://doi.org/10.1016/j.matt.2019.12.019 (channeling from too-fine grind, coarser grind + lower dose/water improves EY and reproducibility, ~20 g→15 g dose reduction).
- **`[Wiki-Extraction]`** "Coffee extraction," Wikipedia — https://en.wikipedia.org/wiki/Coffee_extraction (EY 18–22%, TDS 1.15–1.35%, EY inversely proportional to grind size / surface area, regional brew ratios; itself citing Schulman 2007 and Rao 2010 for these figures).
- **`[Wiki-Burr]`** "Burr mill," Wikipedia — https://en.wikipedia.org/wiki/Burr_mill (burr = uniform size set by burr gap vs blade randomness; burrs heat grounds less).
- **`[HCG-Chart]`** Honest Coffee Guide, "Coffee Grind Size Chart" — https://honestcoffeeguide.com/coffee-grind-size-chart/ (per-method micron ranges; recipe-derived, used here only for quantitative micron anchors).

### Source-confidence notes
- Tier 1 (peer-reviewed / recognized experts): `[Hendon-Espresso]`, all `[Gagné-*]`, `[SCA-Chart]`.
- Tier 2 (reference, with primary citations behind them): `[Wiki-Extraction]` (carries Schulman 2007 + Rao 2010), `[Wiki-Burr]`.
- Tier 3 (practical aggregation, used only for micron ranges): `[HCG-Chart]`. Micron numbers vary across vendors; use as directional brackets, not gospel.
- The Hendon *Matter* paper itself is paywalled (Elsevier/Cell); findings above are the paper's well-documented core results cited by its DOI. If exact figures are needed for the simulator, retrieve the open-access author copy or the *Matter* supplementary for precise EY/variance numbers.
