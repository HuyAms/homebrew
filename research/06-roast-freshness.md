# Roast Level, Bean Freshness & Grind Freshness — Effects on Extraction and Flavor

Research compiled for an interactive brew simulator. Scope: roast level, CO2/degassing,
bean freshness (days off roast), grind-to-brew freshness, and (briefly) origin/processing.
Sources are industry-credible only (SCA, James Hoffmann, Scott Rao, Barista Hustle,
Jonathan Gagné / Coffee ad Astra) plus peer-reviewed papers. Each claim is attributed.

> Note on uncertainty: Several exact magnitudes (e.g. total CO2 mg/g, % CO2 lost on
> grinding) come from peer-reviewed papers whose full text was paywalled; figures below
> are taken from their abstracts/reported summaries and are flagged where the source was a
> secondary credible reference rather than the primary full text. Treat magnitudes as
> directional/order-of-magnitude for simulator tuning, not lab-grade constants.

---

## 1. Roast Level (light / medium / dark)

### 1.1 Solubility — darker roasts extract faster and yield more soluble material
- **Roasting makes coffee progressively more soluble up to a point, then less.** Scott Rao:
  underdeveloped roasts are *less* soluble than well-developed roasts; very dark roasts lose
  solubility because some dissolvable material is burned off. Optimal solubility sits in
  **well-developed light-to-medium roasts** [Rao]. So solubility is not strictly monotonic
  with darkness — it rises with roast development, then falls at very dark levels.
- **For everyday light→medium→dark comparison, darker = easier to extract.** Pyrolysis
  during roasting fractures cell walls and increases porosity, so darker roasts "give up
  their soluble compounds more easily" and reach a given extraction yield faster than
  lighter roasts at the same settings [Barista Hustle, roast solubility lesson; consistent
  with Gagné's erosion/diffusion model — broken/porous cells extract faster].
- **Roughly 30% of bean mass is soluble in hot water** [Rao]; practical brews target far
  less (see Golden Cup below). Rao reports reaching ~28–29% EY only with specialized methods.

### 1.2 Density and porosity
- Roasting drives off water and CO2-generating reactions expand the bean: **lighter roasts
  are denser; darker roasts are less dense and more porous** [Barista Hustle, RS 2.03 Density
  & Porosity]. Greater porosity in dark roasts is the physical reason they wet faster and
  extract faster.
- Implication for the simulator: density is inversely related to roast darkness, and lower
  density / higher porosity correlates with higher extraction at fixed grind/temp.

### 1.3 Flavor development — acidity vs. bitterness/body
- **Acidity falls as roast darkens; bitterness and roast/body notes rise.** Darker-style
  roasts contain "many more bitter chemicals," and over-extraction reads as bitter
  [Barista Hustle, "Coffee Extraction and How to Taste It"].
- Caffeine (a bitter compound) is largely heat-stable and barely degrades with roast, so
  bitterness increase is driven by *other* roast-generated compounds, not caffeine
  [Barista Hustle, ACM 1.02 "How Much is Bitter?"].
- Directional flavor map: light = brighter/more acidic, more origin character, thinner
  body; dark = lower acidity, more bitterness, more roast character, heavier perceived body.

### 1.4 CO2 content
- **CO2 is generated during roasting (Maillard/pyrolysis) and trapped in the bean matrix.**
  Freshly roasted coffee is roughly **1–2% CO2 by weight**, on the order of **up to ~10–16
  mg CO2 per gram** [reported from Smrke et al., *J. Agric. Food Chem.* 2017, "Time-Resolved
  Gravimetric Method to Assess Degassing of Roasted Coffee" — figure cited via secondary
  credible summaries; primary full text paywalled].
- **Darker / faster roasts hold and release CO2 differently.** Higher degree of roasting
  increases CO2 sorption capacity [Anderson et al., Wiley *J. Food Process Eng.* 2003,
  "Degassing Kinetics and Sorption Equilibrium of CO2 in Fresh Roasted Coffee"]. Faster-
  roasted beans degas more quickly than slower-roasted beans at medium-to-dark levels
  [Smrke et al. 2017]. Practically, darker/more porous roasts tend to off-gas faster.
- Important nuance: one peer-reviewed study found degassing **rate** in *ground* coffee was
  "highly dependent on grind size and roasting temperature, but **less dependent on degree
  of roast**" [Wang & Lim, *Food Research International* 2014, "Effect of Roasting Conditions
  on Carbon Dioxide Degassing Behavior in Coffee"]. So: roast affects *total CO2 stored*,
  but grind size and temperature dominate the *speed* of release.

### 1.5 Roast × grind × temp × extraction target (the interaction that matters most)
Because darker roasts are more soluble/porous, at identical grind + temp + ratio they
extract **more**. To hit the same target EY you compensate:
- **Darker roast → grind coarser and/or use lower water temperature** to slow extraction and
  avoid over-extraction/bitterness [direction supported by Rao's solubility-matching logic
  and Barista Hustle's "darker = easier to extract"; widely standard SCA-aligned practice].
- **Lighter roast → grind finer and/or use hotter water** (toward ~96 °C) to raise
  extraction and avoid sour/under-developed under-extraction.
- Rao's solubility-matching: when blending coffees of differing solubility, the correct
  grind is roughly the **weighted average** of the components' grinds — a useful linear
  mental model for "more soluble → coarser to match" [Rao].
- Extraction targets to anchor a simulator (SCA Golden Cup, Standard 310-2021):
  **EY 18–22%**, **TDS/strength 1.15–1.45%**, brew ratio ~**55 g/L** [SCA Golden Cup].
  Gagné cites the common working ranges of ~19–23% EY for filter [Coffee ad Astra].

---

## 2. Bean Freshness & Degassing (days off roast)

### 2.1 The degassing curve
- After roasting, beans continuously off-gas CO2; the rate is **fastest immediately after
  roast and decays over time** (approximately exponential decay) [Smrke et al. 2017;
  Wang & Lim 2014 — both model CO2 release with diffusion kinetics].
- SCA-aligned framing: coffee actively emits CO2 for roughly **2–14 days** post-roast, after
  which release slows markedly [SCA practitioner guidance]. Whole beans can keep slowly
  degassing for weeks.
- **Roast level shifts the curve:** darker/more porous roasts release their (larger) CO2 load
  faster and are typically brew-ready sooner; lighter, denser roasts retain CO2 longer and
  generally need more rest [direction supported by Anderson 2003 (more sorption at darker
  roast), Smrke 2017 (faster roast degasses faster), and Hoffmann's resting guidance].

### 2.2 Too-fresh vs. stale — how they brew differently
- **Too fresh (high CO2):** vigorous off-gassing during brewing physically disrupts the bed.
  In espresso it causes gushing/erratic flow; in pour-over it causes a big, foamy bloom and
  uneven wetting/channeling, which tends toward **under-extraction and sour/uneven** cups.
  Gagné's astringency/extraction work notes CO2 in the bed interferes with even water
  contact [Coffee ad Astra, "The Mechanism Behind Astringency"; Barista Hustle glossary on
  degassing accelerating after grind].
- **Stale (CO2 mostly gone + oxidation):** as CO2 depletes and oils oxidize, the cup flattens
  — muted aromatics, papery/cardboard staling notes, less bloom. Practically little physical
  bed disruption but degraded flavor.
- **James Hoffmann's practical rest windows:** rest beans before peak use; lighter roasts
  taste best in roughly a **4–6 week** "fresh" window, and he recommends resting **~1–2 weeks
  post-roast** before freezing for storage [Hoffmann, "A Beginner's Guide to Resting Coffee";
  Hoffmann/Gagné freezing method]. Espresso typically wants more rest than filter because the
  pressurized bed is more sensitive to CO2.

### 2.3 Bloom intensity as a freshness proxy
- Bloom (the rise/foam when water first hits grounds) scales with CO2 content, so **bloom
  intensity is a direct, usable proxy for freshness/CO2** in a simulator: big bloom = fresh/
  high CO2 (and elevated channeling risk); weak/no bloom = rested or stale [SCA practitioner
  guidance; consistent with degassing kinetics above].

---

## 3. Grind Freshness (grind-to-brew time)

- **Grinding dramatically accelerates degassing and staling.** Breaking the cell structure
  exposes huge internal surface area, so CO2 (and volatile aromatics) escape far faster from
  ground than from whole coffee — minutes-scale vs. days/weeks-scale [Barista Hustle glossary:
  "degassing rapidly accelerates after the coffee cell structure is broken open through
  grinding"; Wang & Lim 2014: ground-coffee degassing is *much* faster than whole-bean and is
  the most grind-size-dependent variable].
- **Aromatics oxidize and volatilize quickly once ground.** The surge in surface area speeds
  oxidation of oils and loss of volatile organic aroma compounds — this is the core reason
  pre-ground coffee tastes flatter [Wang & Lim 2014 on grind-size dominance of degassing;
  general roast/extraction chemistry, Barista Hustle].
  - (Note: popular "X% of aroma lost in N minutes" figures circulate widely but trace to
    non-credible blogs; not cited here. Treat the effect as large and fast, exact % unknown.)
- **Therefore: grind immediately before brewing.** This preserves CO2 for a healthy bloom and
  retains volatile aroma — the single highest-leverage freshness lever.
- **Counterpoint (grinder quality vs. grind freshness):** Hoffmann's "freshness fallacy"
  point — a high-quality burr grind can outperform freshly-but-poorly-ground coffee even days
  later; particle-size *distribution* (uniformity) is a large lever alongside freshness
  [Hoffmann, "The Freshness Fallacy"]. For the simulator: freshness and grind *quality* are
  separate axes; both affect the cup.

---

## 4. Origin / Processing (brief)

- **Density varies with origin/altitude:** higher-grown beans are typically denser and harder,
  transferring heat differently in the roast and generally extracting a bit slower at a given
  grind [Barista Hustle, RS 2.03 Density & Porosity].
- **Washed vs. natural** mainly shifts flavor/cleanliness and can shift average extraction and
  brew time; Gagné's data piece on varieties/origin/processing covers measured differences in
  average EY and brew time across processing styles [Coffee ad Astra, "The Effects of
  Varieties, Origin and Processing"]. Effect on extraction is secondary to roast and grind.

---

## 5. Quantified / Directional Relationships for the Simulator

All directions stated as "at fixed other settings." Use as tunable knobs.

| Input | Direction on Extraction (EY) | Mechanism / Source | Recommended compensation |
|---|---|---|---|
| Roast darker (light→dark) | EY ↑ (extracts faster/more) | More porous, more soluble [BH; Rao; Gagné] | Coarsen grind and/or lower temp |
| Roast lighter | EY ↓ | Denser, less soluble [BH; Rao] | Finer grind and/or hotter water (~96 °C) |
| Bean very fresh (high CO2) | Effective EY ↓ + uneven (channeling) | CO2 disrupts bed/bloom [Gagné; BH] | Rest beans; bigger/longer bloom; agitate gently |
| Bean rested (optimal) | EY on-target, even | CO2 decayed to workable level [SCA; Hoffmann] | — |
| Bean stale | Flavor ↓ (flat), EY ~unchanged | CO2 gone + oxidation [degassing kinetics; BH] | Fresher beans |
| Grind long before brew | Aroma/CO2 ↓ fast; cup flat | Surface area → fast off-gas/oxidation [BH; Wang & Lim] | Grind right before brew |
| Finer grind | EY ↑ + degassing faster | More surface area [Gagné; Wang & Lim] | Pair coarser with darker roast |
| Higher water temp | EY ↑ | Faster diffusion [Gagné; SCA] | Lower temp for dark roasts |

**Anchor magnitudes (cited):**
- Soluble fraction of bean ≈ **30%** of mass [Rao]; practical max EY ≈ **28–29%** [Rao].
- SCA Golden Cup target: **EY 18–22%**, **TDS 1.15–1.45%**, ratio **~55 g/L** [SCA 310-2021].
- Filter working EY range ≈ **19–23%** [Gagné].
- Fresh-roast CO2 ≈ **1–2% of weight** (~up to ~10–16 mg/g) [Smrke et al. 2017, via summary].
- Active CO2 emission window ≈ **2–14 days** post-roast [SCA practitioner guidance].
- Light-roast "fresh" taste window ≈ **4–6 weeks**; rest **~1–2 weeks** before freezing
  [Hoffmann].
- Degassing **rate** dominated by grind size & roast temperature, **less by roast degree**;
  ground degasses far faster than whole bean [Wang & Lim 2014].
- CO2 sorption capacity **increases with darker roast** [Anderson et al. 2003].

**Suggested simulator model sketch:**
- `effective_EY = base_EY(grind, temp, time) * roast_solubility_factor − co2_penalty(freshness, grind_state)`
  where `roast_solubility_factor` increases light→medium→(slightly down at very dark) per Rao,
  and `co2_penalty` is high for very-fresh + finely-ground (channeling) and ~0 once rested.
- Track `freshness` (days off roast) on an exponential CO2-decay curve, and `grind_age`
  (minutes since grinding) on a much steeper decay. Bloom size = f(remaining CO2).

---

## Sources

- SCA — Golden Cup Standard / brewing standards (Standard 310-2021): https://sca.coffee/research/protocols-best-practices and https://sca.coffee/news
- Scott Rao — "'Solubility matching' and blending coffee": https://www.scottrao.com/blog/2021/3/8/solubility-matching-and-blending-coffee
- Barista Hustle — Degas (glossary): https://www.baristahustle.com/glossary/degas/
- Barista Hustle — "Coffee Extraction and How to Taste It": https://www.baristahustle.com/coffee-extraction-and-how-to-taste-it/
- Barista Hustle — ACM 7.01 Roast Solubility: https://www.baristahustle.com/lesson/acm-7-01-roast-solubility/
- Barista Hustle — RS 2.03 Density and Porosity: https://www.baristahustle.com/lesson/rs-2-03-density-and-porosity/
- Barista Hustle — ACM 1.02 How Much is Bitter?: https://www.baristahustle.com/lesson/acm-1-02-how-much-is-bitter/
- Jonathan Gagné (Coffee ad Astra) — "The Dynamics of Coffee Extraction": https://coffeeadastra.com/2019/01/29/the-dynamics-of-coffee-extraction/
- Jonathan Gagné (Coffee ad Astra) — "The Mechanism Behind Astringency in Coffee": https://coffeeadastra.com/2022/08/01/the-mechanism-behind-astringency-in-coffee/
- Jonathan Gagné (Coffee ad Astra) — "The Effects of Varieties, Origin and Processing": https://coffeeadastra.com/2020/09/05/the-effects-of-varieties-origin-and-processing/
- James Hoffmann — "A Beginner's Guide to Resting Coffee": https://www.youtube.com/watch?v=_Py8JOi3REg
- James Hoffmann — "The Freshness Fallacy" (grind quality vs. time): https://revuw.co.uk/channels/@jameshoffmann/content/NxklrAQfupw
- James Hoffmann / Gagné — freezing coffee method (resting before freeze): https://www.jameshoffmann.co.uk/weird-coffee-science
- Smrke et al. (2017), *J. Agric. Food Chem.* — "Time-Resolved Gravimetric Method To Assess Degassing of Roasted Coffee": https://pubs.acs.org/doi/10.1021/acs.jafc.7b03310
- Wang & Lim (2014), *Food Research International* — "Effect of Roasting Conditions on Carbon Dioxide Degassing Behavior in Coffee": https://www.sciencedirect.com/science/article/pii/S0963996914000337
- Anderson et al. (2003), *J. Food Process Engineering* (Wiley) — "Degassing Kinetics and Sorption Equilibrium of CO2 in Fresh Roasted Coffee": https://onlinelibrary.wiley.com/doi/10.1111/j.1745-4530.2000.tb00524.x
- University of Guelph thesis (open access) — CO2 degassing behavior in coffee: https://atrium.lib.uoguelph.ca/ (search: coffee CO2 degassing)
