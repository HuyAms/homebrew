# Brew Time, Agitation & Pour Technique → Extraction

Research notes for the homebrew extraction simulator. Scope: contact/brew time, bloom & degassing, agitation/turbulence, pour technique, and their interactions with grind and temperature. Sources limited to SCA, James Hoffmann, Scott Rao, Barista Hustle/Matt Perger, Jonathan Gagné (Coffee ad Astra), and peer-reviewed work. Inline citations link claims to the **Sources** list at the bottom.

---

## 0. Baseline frame: extraction yield (EY) and strength (TDS)

- **Extraction yield (EY)** = mass of dissolved coffee solids / mass of dry grounds. The widely-taught "ideal" window is **18–22% EY** (below 18% = under-extracted/sour, above 22% = over-extracted/bitter). [SCA / Coffee Extraction overview]
- **Strength (TDS)** = % dissolved solids in the *liquid*, typically **1.15–1.35%** for filter (regional targets: N. America ~1.25%, Europe ~1.35%, Nordic ~1.40%). [SCA Brewing Control Chart]
- The **SCA Brewing Control Chart** plots strength (TDS, y) vs. extraction (EY, x) for a given brew ratio; the "ideal" box is the 18–22% EY × 1.15–1.35% TDS rectangle. Brew ratio sets the diagonal you move along; time/agitation/grind/temperature move you *along* that line toward higher or lower EY. [SCA Brewing Control Chart]
- **Important nuance (Rao):** the 18–22% "rule" and the concept of "over-extraction" are contested. Rao reports clean, non-astringent brews at **28–29% EY** and argues true over-extraction is essentially unreachable for normal brewers; what people call "over-extracted" is usually **astringency from uneven extraction/channeling**, not excessive EY. Industrial extraction (e.g. Nestlé) reaches 40–50% EY. [Rao – Extraction Myths]
- For the simulator: treat **18–22% as the "tasty default band,"** but the *upper ceiling* of achievable EY is closer to ~28–30% before flow/astringency limits dominate, and that ceiling depends on evenness, not just time. [Rao – Extraction Myths; Gagné – Astringency]

---

## 1. Contact / brew time

### Directional relationship
- **Longer contact time → higher EY, with diminishing returns approaching equilibrium.** Extraction is a dissolution + diffusion process: solubles leave the grounds fastest at first (steep concentration gradient) and asymptotically slow as the slurry concentration rises toward equilibrium with the particle interior. [Gagné – Overview of extraction; Gagné – AeroPress]
- Gagné's AeroPress work makes the time→EY relationship concrete: a **10-minute immersion steep reached 23.5% EY** on a Kenyan coffee, and the *flavor profile* approached what a ~27% percolation EY tastes like, because long steeping pushes the slurry toward equilibrium between particle and liquid. [Gagné – AeroPress]
- Diffusion is shallow: meaningful extraction only penetrates **~40 µm into a particle**; cores larger than ~100 µm stay largely unextracted in normal brew times. This is why time alone can't fully extract coarse grinds — surface area (grind) gates how much *more* time can buy. [Gagné – Why can't we grind finer]

### Typical contact times by method (industry-standard)
| Method | Typical contact time | Notes |
|---|---|---|
| Espresso | **~25–30 s** | High pressure (~9 bar), very fine grind, ~1:2 ratio. Short time compensated by pressure + surface area. [SCA; Cameron et al. 2020] |
| V60 / pour-over | **~2:30–3:30 total** (Hoffmann ~3:30) | Percolation; flow rate + grind set the time. [Hoffmann V60; Gagné] |
| French press | **~4 min** | Full immersion, coarse grind. [Coffee Extraction overview] |
| AeroPress (standard) | ~1–2 min | Immersion + light pressure. Extended-steep variant 10 min for higher EY. [Gagné – AeroPress] |
| Cold brew | **~12–24 h** | Low temperature dramatically slows diffusion, so time is enormous to compensate. [Coffee Extraction overview] |

### What *controls* brew time (for percolation)
Brew time is an **output**, not an independent knob, in pour-over. Gagné's "What Affects Brew Time":
- **Water temperature** is large: water viscosity drops ~**70%** from room temp to boiling, so hotter water flows much faster → shorter brew time (and also extracts faster per unit time). Water *density* changes only ~4% (negligible). [Gagné – What affects brew time]
- **Beverage concentration** raises viscosity: filter slurry ~**+30%** viscosity vs input water (espresso 2–3×). Higher concentration slurry flows slower. [Gagné – What affects brew time]
- **Grind & fines** dominate flow resistance: finer grind and more fines → slower flow → longer time. [Rao – Grind setting; Gagné]
- Because so many variables interact, **brew time is unreliable as a proxy for grind size** across different setups. [Gagné – What affects brew time]

### Simulator takeaway (time)
`EY rises with time along a saturating curve` (e.g. EY(t) = EY_eq · (1 − e^(−t/τ))). τ shrinks with finer grind, higher temp, and more agitation. Past equilibrium, extra time adds little EY but can increase **astringency** via repeated dissolve/precipitate cycling of low-solubility compounds, especially with fine grind + clean water. [Gagné – Astringency]

---

## 2. Bloom & degassing (CO₂)

### Mechanism
- Roasting generates **CO₂** trapped inside the bean matrix. Fresh-roasted coffee continues to **degas** for days to weeks. When hot water first hits fresh grounds, dissolved/trapped CO₂ rapidly off-gasses, producing the visible **bloom** (foaming/swelling). [Hoffmann V60 method; Rao on blooming]
- **Why bloom matters for extraction:** escaping CO₂ bubbles physically **push water away from grounds** and create gas pockets, causing **uneven/incomplete wetting** and **channeling** if you pour the full charge immediately. A dedicated bloom phase lets most CO₂ escape *before* the main pours so water can contact all particles evenly. [Hoffmann V60; Rao – blooming pour concept]
- The bloom also **pre-wets and de-clumps** the bed; combined with a stir/swirl it ensures full saturation, which is a prerequisite for even percolation. [Gagné – Four Rules: "blooming the bed properly to start percolation after it is entirely wet"]

### Freshness interaction
- **Fresher coffee = more CO₂ = more vigorous, larger bloom**, and *more* potential for gas-driven unevenness if not bloomed. Very fresh coffee (1–4 days off roast) blooms most. [Hoffmann; Rao]
- **Stale coffee barely blooms** (CO₂ largely gone), so the bloom is small — but stale coffee also lost aromatics and tends to extract differently. Bloom vigor is a practical freshness indicator. [Hoffmann]
- CO₂ also slightly **acidifies the brew water locally** (carbonic acid) and can suppress extraction in the first seconds; degassing via bloom mitigates this. [Rao – blooming]

### Typical bloom parameters (industry)
- **Bloom water = ~2× to 3× the dry coffee mass** (e.g. 30g coffee → 60–90g bloom water). [Hoffmann V60]
- **Bloom duration ~30–45 s** (Hoffmann uses ~45 s for the Ultimate V60). [Hoffmann V60]
- **Agitate during bloom** (swirl or gentle stir) to wet every particle. [Hoffmann; Rao]

### Simulator takeaway (bloom)
Model bloom as (a) a **freshness-scaled CO₂ term** that *reduces effective contact/evenness* in the first ~30–45s if skipped, and (b) an **evenness multiplier** that, when done, raises the effective EY and lowers astringency. Fresher beans → bigger penalty for skipping bloom.

---

## 3. Agitation / turbulence

### Directional relationship
- **More agitation → higher EY and (when even) better evenness.** Agitation refreshes the water immediately around each particle, steepening the concentration gradient that drives diffusion, and breaks up clumps/channels. [Gagné – Kettle streams; Rao; Perger/Barista Hustle]
- Mechanisms of agitation: **stirring, swirling, and pour energy (height + flow rate)**. All inject turbulence into the slurry. [Gagné – Kettle streams]

### Pour energy (Gagné, "Physics of Kettle Streams")
- There is an **optimum pour rate that maximizes the unbroken stream ("breakup length")** — at his setup, **~5 g/s** gave a breakup length of **~18–19 cm** (Stagg EKG gooseneck). 3–4 g/s for easily-clogging coffees, 6–7 g/s for fast-draining. [Gagné – Kettle streams]
- **Pour height controls turbulence:** pour *just below* the height where you hear splattering — that is the **laminar→turbulent transition**, maximizing agitation without ejecting grounds or digging holes. Pouring too close = laminar, weak agitation, "hollow"/uneven patterns. [Gagné – Kettle streams]
- Keeping pour rate + height **stable** is the single biggest lever for **repeatability** of brews. [Gagné – Kettle streams]

### Evenness vs. raw agitation
- Agitation is double-edged: **even** agitation (uniform swirl, full-surface pour) raises EY; **uneven** agitation digs channels and worsens evenness. Channeling = water finds low-resistance paths, over-extracting those paths and under-extracting the rest → **astringency + sourness simultaneously**. [Gagné – Four Rules; Rao – Extraction Myths]
- Espresso evidence (Gagné, "More Even Espresso"): improving distribution (**deep WDT** + below-puck paper filter) reduced "dark spots"/dead zones and raised EY from **25.0% → 26.0%** (~**+1% EY** from evenness alone, same recipe). [Gagné – More Even Espresso]
- Espresso reproducibility (Cameron et al. 2020, peer-reviewed): channeling makes EY highly variable; **fewer grounds + coarser grind** counterintuitively gave *higher and more reproducible* EY by reducing clogging/channeling. [Cameron et al. 2020]

### Channeling drivers
Bypass, clogging (fines blocking filter pores), uneven particle distribution, non-level bed, gas pockets (un-bloomed CO₂), and slow drip rate all create channels. [Gagné – Four Rules; Gagné – Fines migration]

### Simulator takeaway (agitation)
Two coupled terms: **agitation_intensity** (↑ EY rate, shrinks τ) and **evenness** (0–1 multiplier on usable EY). High agitation with low evenness → high *local* EY but high astringency and lower *effective* tasty EY. WDT/swirl/even pour push evenness toward 1.

---

## 4. Pour technique: continuous vs. pulse, flow rate, bed depth

### Continuous vs. pulse pours
- **Pulse pours** (multiple discrete additions) **lengthen total contact time** and add agitation per pulse; they keep the bed shallower at any instant (lower water column) and tend to **raise EY** for a given grind, at the cost of longer brew time. [Gagné – Four Rules; Hoffmann uses staged pours]
- **Continuous pours** maintain a steadier water level, gentler/more uniform percolation, often **faster total time** and slightly lower agitation; favored when you want to avoid over-agitating fine grinds. [Gagné – Kettle streams]
- Hoffmann's Ultimate V60 is effectively pulsed: bloom (~2–3× dose, swirl, ~45s) → two main pours to the target weight, total **~3:30**, at **60 g/L** ratio, medium-fine grind, water ~off-boil. [Hoffmann V60]

### Flow rate
- Set by grind + fines + temperature + pour rate + filter. **Faster flow → shorter contact → lower EY** (unless compensated by finer grind). The barista's pour rate should sit at the kettle's optimum (≈5 g/s) for stream stability/agitation. [Gagné – Kettle streams; Gagné – What affects brew time]

### Bed depth (Scott Rao)
- **Bed depth** = height of grounds. It strongly affects channeling severity and astringency:
  - **Deeper bed:** channels tend to **dead-end in denser regions** before reaching the bottom → less astringency; but too deep forces a **very coarse grind → low EY** (wasted coffee). [Rao – Bed depth]
  - **Shallower bed:** channels **reach the bottom easily**, extracting large astringency-causing molecules → **more astringency**, even with finer grind. [Rao – Bed depth]
- Rao's dose guidance (light roast) to keep bed depth in the sweet spot: **V60 20–25g, Kalita 185 25–30g, NextLevel Pulsar 30–35g, Stagg X 25g, AeroPress 18–20g.** Below these, astringency risk rises sharply. [Rao – Bed depth]
- Grind must track dose/bed depth: Rao uses **EK #6 for a 15g V60 but #8 for a 22g V60** (deeper bed → coarser grind to keep flow/time reasonable). [Rao – Grind setting]

### Simulator takeaway (pour/bed)
Expose **pour mode** (continuous vs. N pulses), **pour rate**, and **dose/bed depth**. Pulses ↑ time + agitation → ↑EY. Deeper bed ↑ even-extraction headroom but requires coarser grind (couple these so users can't get both fine grind *and* deep bed without astringency/clog penalties).

---

## 5. Interactions with grind size & temperature

- **Grind ↔ time:** finer grind = more surface area = faster extraction per second, so it **shortens the time needed** for a given EY — but also slows flow (longer percolation time) and raises fines/clog/channel risk. Past a point, finer grind stops raising EY (bypass + channeling dominate) and just adds astringency. [Gagné – Why can't we grind finer; Gagné – Astringency]
- **Grind ↔ bypass:** in a standard dripper, fine grind can push **bypass from ~17% (coarse) to >66% (fine)** of flow at a 5 cm water column — bypass *caps* how fine you can usefully go. [Gagné – Four Rules]
- **Temperature ↔ everything:** higher temp ↑ solubility/diffusion (faster EY per second) **and** ↓ viscosity ~70% (faster flow → shorter contact). Net EY usually rises with temp, but the flow effect partly offsets. Recommended brew temp **91–94 °C**. [Gagné – What affects brew time; Coffee Extraction overview]
- **Temperature ↔ astringency:** dropping slurry temp to ~70 °C cut astringency while keeping EY ~27%, but flattened acidity/vibrancy — temperature trades astringency against flavor clarity. [Gagné – Astringency]
- **Agitation ↔ grind:** fine grind + heavy agitation is the classic astringency/channeling combo (lots of broken cells + turbulence digging channels). Coarser grind tolerates more agitation. [Gagné – Astringency; Rao]

---

## 6. Quantified / directional relationships for the simulator

| Lever | Direction on EY | Magnitude / anchor | Side effects |
|---|---|---|---|
| Contact time ↑ | ↑ (saturating) | 10-min steep → 23.5% EY (≈ taste of 27% perc.) | astringency past equilibrium [Gagné – AeroPress] |
| Bloom (done well) | ↑ effective EY, ↑ evenness | bloom 2–3× dose, 30–45s | skipping → channeling, worse with fresh beans [Hoffmann; Rao] |
| Agitation/turbulence ↑ (even) | ↑ EY rate | pour ~5 g/s, height just below splatter; breakup ~18–19 cm | uneven agitation → channeling [Gagné – Kettle streams] |
| Evenness ↑ (WDT/distribution) | ↑ usable EY | espresso 25.0% → 26.0% (~+1% EY) | — [Gagné – More Even Espresso] |
| Pulse pours (vs continuous) | ↑ EY | adds contact time + per-pulse agitation | longer total time [Gagné – Four Rules] |
| Flow rate ↑ | ↓ EY | hotter water ↓ viscosity ~70% → faster flow | [Gagné – What affects brew time] |
| Bed depth ↑ | enables higher *even* EY | dose anchors: V60 20–25g, Pulsar 30–35g | too deep → coarse grind → low EY [Rao – Bed depth] |
| Grind finer | ↑ EY rate, then plateaus | extraction depth ~40 µm; bypass 17%→66% coarse→fine | astringency, clog, channel [Gagné] |
| Temp ↑ | ↑ EY (partly offset by faster flow) | 91–94 °C ideal; viscosity −70% room→boil | astringency at high temp [Gagné; overview] |
| EY ceiling (even brew) | — | clean brews to 28–29% EY (Rao); 18–22% = tasty band | astringency from *unevenness*, not high EY [Rao] |

**Suggested model skeleton:**
- `EY(t) = evenness · EY_eq · (1 − e^(−t/τ))`
- `τ = f(grind⁻¹, temp⁻¹, agitation⁻¹)` — finer/hotter/more-agitated = smaller τ = faster approach to EY_eq.
- `EY_eq` rises with temp and grind surface area, capped ~28–30% before astringency/flow limits.
- `evenness ∈ [0,1]` raised by: good bloom, WDT/distribution, level bed, adequate bed depth, optimal pour rate/height; lowered by: skipped bloom on fresh coffee, too-fine grind (bypass/clog), shallow bed, erratic pour.
- `astringency` term grows with: fine grind, time beyond equilibrium, low evenness, high temp — and is what users perceive as "over-extracted."

---

## Sources

- **SCA Brewing Control Chart / Golden Cup standard** (18–22% EY, 1.15–1.35% TDS) — Specialty Coffee Association. https://sca.coffee/research and https://www.coffeechemistry.com/the-coffee-brewing-control-chart
- **Coffee Extraction overview** (EY band, TDS regional targets, method times, 91–94 °C) — https://en.wikipedia.org/wiki/Coffee_extraction
- **Jonathan Gagné – An Overview of Coffee Extraction** (dissolution/diffusion, equilibrium) — Coffee ad Astra. https://coffeeadastra.com/ (Extraction category)
- **Jonathan Gagné – What Affects Brew Time** (viscosity −70% room→boil, density 4%, concentration +30%, time as output) — https://coffeeadastra.com/2019/10/20/what-affects-brew-time/
- **Jonathan Gagné – The Physics of Kettle Streams** (pour rate ~5 g/s, breakup ~18–19 cm, pour-just-below-splatter, laminar vs turbulent, repeatability) — https://coffeeadastra.com/2020/05/23/the-physics-of-kettle-streams/
- **Jonathan Gagné – The Four Rules of Optimal Coffee Percolation** (bypass 17%→66%, clogging, even flow, bloom before percolation, ratio↔grind) — https://coffeeadastra.com/2021/03/04/the-four-rules-of-optimal-coffee-percolation/
- **Jonathan Gagné – Why Can't We Grind Coffee Finer for Pour Over?** (extraction depth ~40 µm, cores >100 µm unextracted, fines, ratio dilution) — https://coffeeadastra.com/2020/04/02/why-cant-we-grind-coffee-finer-for-pour-over/
- **Jonathan Gagné – Reaching Fuller Flavor Profiles with the AeroPress** (10-min steep → 23.5% EY ≈ taste of 27%, stir back-and-forth, 100 °C) — https://coffeeadastra.com/2021/09/07/reaching-fuller-flavor-profiles-with-the-aeropress/
- **Jonathan Gagné – More Even Espresso Extractions** (deep WDT + paper filter, dark spots/dead zones, 25.0%→26.0% EY) — https://coffeeadastra.com/2022/07/16/more-even-espresso-extractions/
- **Jonathan Gagné – The Mechanism Behind Astringency in Coffee** (astringency = filtration/unevenness problem; fine grind, time, temp 70 °C trade-off) — https://coffeeadastra.com/2022/08/01/the-mechanism-behind-astringency-in-coffee/
- **Jonathan Gagné – The Physics of Fines Migration** (fines clogging/channeling) — https://coffeeadastra.com/2020/02/01/the-physics-of-fines-migration/
- **Scott Rao – Bed depth: why it matters** (channels dead-end in deep beds, shallow→astringency, dose guidance per brewer) — https://www.scottrao.com/blog/2025/11/11/bed-depth-why-it-matters
- **Scott Rao – The twin myths of "easier to extract" and "overextraction"** (28–29% EY clean, over-extraction myth, astringency = unevenness, 40–50% industrial) — https://www.scottrao.com/blog/extraction-myths
- **Scott Rao – How to choose a grind setting** (grind↔dose/bed depth, EK #6 15g vs #8 22g, fines & flow) — https://www.scottrao.com/blog/how-to-choose-a-grind-setting
- **Scott Rao – on blooming / "the blooming pour"** (degassing, even saturation, agitate during bloom) — https://www.scottrao.com/blog (blooming pour concept)
- **James Hoffmann – The Ultimate V60 Technique** (60 g/L, bloom 2–3× dose ~45s with swirl, staged pours, total ~3:30) — https://www.jameshoffmann.co.uk/ (video + blog)
- **Matt Perger / Barista Hustle – agitation & extraction** (agitation refreshes boundary layer, raises EY) — https://www.baristahustle.com/blog/ (Coffee extraction series)
- **Cameron, M.I. et al. (2020), "Systematically Improving Espresso: Insights from Mathematical Modeling and Experiment," *Matter* 2(3):631–648 (peer-reviewed)** — fewer grounds + coarser grind raise EY and reproducibility by reducing channeling. https://doi.org/10.1016/j.matt.2019.12.019
