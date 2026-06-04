# Coffee Brewing Methods — Comparative Research

Research for an interactive brew simulator. Each method below lists its **mechanism**, **default parameters**, **adjustable ranges**, **filter type and its effect**, **resulting cup profile**, and **the variables that matter most**. A comparative table and Sources section follow at the end.

> **Note on sourcing.** Where the SCA defines a measurable standard (extraction yield, strength/TDS, brew ratio), it is cited as [SCA]. Method mechanics, pressures, and temperatures are drawn from well-referenced technical articles and the cited standards bodies (e.g. the Italian Espresso National Institute spec, captured via [Wiki-*]). Technique conventions (pour structure, decant-don't-plunge, etc.) follow the published guidance of James Hoffmann (*The World Atlas of Coffee*) and Scott Rao; these are noted [Hoffmann]/[Rao] as convention rather than as numeric standards. Deep-link recipe pages on jameshoffmann.co.uk and paywalled Barista Hustle articles were not directly retrievable at research time, so all numbers below come from the directly-fetched sources in the Sources list.

---

## Foundational benchmark: the SCA "Golden Cup"

Before the per-method detail, the SCA Golden Cup gives the target most filter/immersion methods aim at:

- **Brew ratio:** ~55 g/L (American standard); the broader "Golden Ratio" band used in practice is roughly **1:15–1:18** coffee:water. [SCA]
- **Extraction yield (EY):** **18–22 %** (ideal 20 ± 2 %) of the coffee's mass dissolved into the cup. Below ~18 % tastes sour/under-extracted; above ~22 % tastes bitter/astringent/over-extracted. [SCA]
- **Strength (TDS):** **1.15–1.35 %** TDS (American standard, 1.25 ± 0.10 %); the Norwegian standard centers higher at ~1.40 %. [SCA]
- **Water temperature target:** ~90–96 °C for hot brewing. [SCA / Wiki-Brewed]

These EY/TDS targets apply cleanly to drip, pour-over, Chemex, French press and siphon. Espresso, Moka and cold brew run at much higher concentrations and are judged on their own terms (see each section).

**Extraction direction (used throughout the simulator):** finer grind, hotter water, longer contact, higher water:coffee ratio, and more agitation all push extraction **up** (toward bitter); the opposite pushes it **down** (toward sour). Balance/sweetness sits in the middle of the 18–22 % band. [SCA; convention per Hoffmann/Rao]

---

## 1. Espresso

- **Mechanism:** **Pressure.** ~9 bar of pump pressure forces hot water through a tightly tamped puck of finely ground coffee. [Wiki-Espresso]
- **Filter:** Fine **metal** basket (no paper). Passes oils and fine colloids, producing **crema** — a foam of emulsified oils and CO₂ — and heavy body. [Wiki-Espresso]
- **Default parameters** (modern specialty; the certified Italian spec in brackets):
  - Dose: **18 g** (Italian std: 7 ± 0.5 g single)
  - Ratio: **1:2** (≈18 g in → 36 g out)
  - Yield: ~36 g liquid (Italian std: 25 ± 2.5 ml)
  - Grind: **very fine**
  - Water temp: **93 °C** (Italian std exit temp 88 ± 2 °C)
  - Pressure: **9 ± 1 bar**
  - Shot time: **25–30 s** (Italian std: 25 ± 5 s) [Wiki-Espresso]
- **Adjustable ranges:** dose 14–22 g; ratio 1:1.5 (ristretto) → 1:3 (lungo); temp 88–96 °C; pressure 6–10 bar; time 20–40 s; grind very fine ↔ fine.
- **Cup profile:** very high body, intense and concentrated (TDS ~8–12 %, far above Golden Cup), bittersweet, syrupy; lower clarity due to oils/fines. [Wiki-Espresso]
- **Variables that matter most:** **grind fineness** (sets flow resistance/shot time) and **dose+ratio** (sets strength); puck prep (even tamp/distribution) and temperature are secondary but real. Because all variables interact through flow rate, espresso is the most parameter-sensitive method.

## 2. V60 / Pour-Over (percolation)

- **Mechanism:** **Percolation.** Water flows once through a cone of grounds under gravity; fresh water continuously contacts the bed, giving efficient extraction and high clarity. [Wiki-Brewed]
- **Filter:** Thin **paper** in a ribbed cone. Removes oils and fines → very clean, bright cup with light body. [Wiki-Brewed]
- **Default parameters:**
  - Ratio: **1:16–1:17** (e.g. 15 g coffee : 250 g water) — Hoffmann's V60 convention is ~1:60 expressed as g/L, i.e. ~30 g : 500 g for a larger brew. [SCA / Hoffmann]
  - Grind: **medium-fine**
  - Water temp: **92–96 °C**
  - Brew time: **2:30–3:30** total (typ. bloom 30–45 s then pulse pours) [SCA; technique per Hoffmann]
- **Adjustable ranges:** ratio 1:14–1:18; temp 85–96 °C; grind medium-coarse ↔ fine; time ~2:00–4:00; pour count/agitation.
- **Cup profile:** high clarity, light–medium body, pronounced acidity and aromatics, sweetness when dialed to ~19–21 % EY. Target Golden Cup TDS ~1.2–1.35 %. [SCA]
- **Variables that matter most:** **grind size** (controls flow/contact time and is the primary EY lever), then **water temperature** and **pour technique/agitation**; ratio sets strength independent of extraction.

## 3. Chemex

- **Mechanism:** **Percolation** (a pour-over variant). [Wiki-Chemex]
- **Filter:** **Bonded paper ~20–30 % thicker** than standard drip filters. Removes more oils and fines than a V60 → the cleanest, most "tea-like" filter cup; also strips the most cafestol/diterpenes. Slower flow due to thick paper. [Wiki-Chemex; Wiki-Cafestol]
- **Default parameters:**
  - Ratio: **1:15–1:17**
  - Grind: **medium-coarse** ("kosher salt" per Chemex) — coarser than V60 to offset the slow-draining thick filter [Wiki-Chemex]
  - Water temp: **93–96 °C** (199–205 °F) [Wiki-Chemex]
  - Brew time: **3:30–4:30** (longer than V60; thick paper slows drawdown)
- **Adjustable ranges:** ratio 1:14–1:18; grind medium ↔ coarse; temp 90–96 °C; time ~3:00–5:00.
- **Cup profile:** highest clarity of the common methods, light body, bright, delicate; very low oils/sediment. [Wiki-Chemex]
- **Variables that matter most:** **grind size** (thick filter makes drawdown time very grind-sensitive) and **water temperature**; pour rate to avoid clogging the thick paper.

## 4. AeroPress

- **Mechanism:** **Hybrid immersion + low pressure.** Coffee steeps (immersion), then a hand plunger pushes the brew through the filter at gentle pressure (well below espresso's 9 bar). [Wiki-AeroPress]
- **Filter:** Small **paper** disc (default); a **metal** mesh is also sold. Paper → cleaner, lower oil; metal → more body and fines. [Wiki-AeroPress]
- **Default parameters:**
  - Dose / water: **~15 g : 230 g** (competition range 14–20 g into 200–230 ml)
  - Ratio: ~**1:15** (highly flexible; concentrate styles go ~1:8 then dilute)
  - Grind: **medium-fine** (finer for shorter steeps)
  - Water temp: **80–92 °C** (lower temps common; ~80 °C for dark roast) [Wiki-AeroPress]
  - Steep time: **30–90 s** then a ~20–30 s press [Wiki-AeroPress]
- **Adjustable ranges:** ratio 1:8–1:17; temp 70–95 °C; grind fine ↔ medium-coarse; steep 30 s–3 min; inverted vs standard orientation.
- **Cup profile:** smooth, low perceived acidity and low bitterness (manufacturer cites markedly lower acidity than drip/French press), medium body with paper / fuller with metal, very forgiving. [Wiki-AeroPress]
- **Variables that matter most:** **steep time + grind** together set extraction; **temperature** strongly shifts perceived acidity. Pressure/press speed matters least. The most forgiving method overall.

## 5. French Press (immersion)

- **Mechanism:** **Full immersion.** Grounds steep in the full water volume, then a mesh plunger separates them. [Wiki-FrenchPress]
- **Filter:** **Metal mesh** (steel/nylon). Passes oils and fine particles → heavy body, more sediment, retains cafestol/diterpenes. [Wiki-FrenchPress; Wiki-Cafestol]
- **Default parameters:**
  - Ratio: **~1:16.7** (30 g coffee : 500 ml water) [Wiki-FrenchPress]
  - Grind: **coarse** ("cooking/sea salt") to limit fines and astringency [Wiki-FrenchPress]
  - Water temp: **93–96 °C** [Wiki-FrenchPress]
  - Steep time: **~4 min** [Wiki-FrenchPress]
  - Hoffmann technique convention: steep ~4 min, **break the crust and skim**, let fines settle ~5–8 min, then **decant rather than plunging hard** to minimize sediment. [Hoffmann]
- **Adjustable ranges:** ratio 1:12–1:18; grind medium ↔ very coarse; temp 88–96 °C; steep 4–10 min.
- **Cup profile:** full/heavy body, rich mouthfeel, muted acidity, more sediment, lower clarity; over-steeping → astringent/bitter. [Wiki-FrenchPress]
- **Variables that matter most:** **grind size** (too fine = sludge + over-extraction) and **steep time**; ratio sets strength. Temperature less critical than in percolation.

## 6. Moka Pot

- **Mechanism:** **Steam/vapor pressure**, ~**1–2 bar** — far below espresso. Heating the base raises air + vapor pressure, pushing water up through the grounds into the top chamber. [Wiki-Moka]
- **Filter:** **Metal** screen (built-in). No crema; passes oils. [Wiki-Moka]
- **Default parameters:**
  - Ratio: **~1:10** by mass (fill the basket level, water to the valve) [Wiki-Moka]
  - Grind: **fine** (between drip and espresso; not as fine as espresso to avoid stalling) [Wiki-Moka]
  - Heat: medium; remove from heat at the **gurgle** to avoid steam over-extraction [Wiki-Moka]
  - Brew time: ~**4–6 min** on the stove
- **Adjustable ranges:** ratio ~1:7–1:12; grind fine ↔ medium-fine; heat level (proxy for flow speed); pull-off timing (start of gurgle vs late).
- **Cup profile:** strong and bold, ~**3–4 % dissolved solids** (between drip ~1.3 % and espresso ~8–12 %), heavy body, can be bitter/sulfurous if overheated; no crema. [Wiki-Moka]
- **Variables that matter most:** **heat level and pull-off timing** (the dominant levers — gurgle = stop), plus **grind**. Over-extraction from residual steam is the classic failure mode.

## 7. Cold Brew (immersion)

- **Mechanism:** **Long cold/room-temp immersion**, 12–24 h. Low temperature extracts slowly and selectively. [Wiki-ColdBrew]
- **Filter:** Paper, felt, or metal sieve, often two-stage (separate grounds, then polish). [Wiki-ColdBrew]
- **Default parameters:**
  - Ratio: **~1:8 (concentrate)** to ~1:15 (ready-to-drink); concentrate is diluted to taste/over ice
  - Grind: **coarse / extra-coarse**
  - Water temp: room temp or refrigerated
  - Steep time: **12–24 h** [Wiki-ColdBrew]
- **Adjustable ranges:** ratio 1:5 (strong concentrate) → 1:15; steep 8–24 h; temp fridge ↔ room; grind coarse ↔ extra-coarse.
- **Cup profile:** smooth, low perceived/titratable acidity, low bitterness, sweet/chocolatey, medium-full body; note that long cold steeps can still extract substantial caffeine despite the gentle taste. [Wiki-ColdBrew]
- **Variables that matter most:** **steep time and ratio** (set strength and depth), then **grind**; temperature mainly trades speed vs control.

## 8. Siphon / Vacuum

- **Mechanism:** **Vapor-pressure immersion.** Vapor pressure pushes water up into the upper chamber where it brews as a near-full immersion at very high temperature; on cooling, vacuum pulls the brew back down through the filter. [Wiki-Vacuum]
- **Filter:** **Cloth, metal, paper, or a glass rod.** Cloth is traditional and gives clarity with some body; choice shifts oils/body. [Wiki-Vacuum]
- **Default parameters:**
  - Ratio: **~1:15**
  - Grind: **medium** (drip-like)
  - Water temp: very hot, near boiling (~92–96 °C in the upper chamber, often ~100 °C source) [Wiki-Vacuum]
  - Brew/steep: ~**1–3 min** in the upper chamber with a stir, then kill heat to draw down [Wiki-Vacuum]
- **Adjustable ranges:** ratio 1:14–1:17; grind medium-fine ↔ medium-coarse; upper-chamber time 1–4 min; stir count; filter material (cloth/metal/paper).
- **Cup profile:** very clean and clear yet with more body than paper pour-over (the high temp + immersion boost aromatics and texture); historically prized as a "clear brew." [Wiki-Vacuum]
- **Variables that matter most:** **upper-chamber contact time** and **stir/agitation** (the high temp makes it over-extract fast), then **grind** and **filter material**.

---

## Comparative Table

| Method | Mechanism | Filter | Default ratio | Default grind | Water temp | Time | Pressure | Body | Clarity | Acidity | Typical strength | Key variables |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Espresso** | Pressure | Metal basket | 1:2 | Very fine | 93 °C | 25–30 s | 9 bar | Very high (crema) | Low | Bright but masked | TDS ~8–12 % | Grind, dose/ratio, puck prep |
| **V60 / Pour-over** | Percolation | Thin paper | 1:16–17 | Medium-fine | 92–96 °C | 2:30–3:30 | — | Light–med | High | High | Golden Cup ~1.2–1.35 % TDS, 18–22 % EY | Grind, temp, pour/agitation |
| **Chemex** | Percolation | Thick paper | 1:15–17 | Medium-coarse | 93–96 °C | 3:30–4:30 | — | Light | Highest | High | Golden Cup band | Grind, temp, pour rate |
| **AeroPress** | Immersion + low pressure | Paper (or metal) | ~1:15 | Medium-fine | 80–92 °C | 0:30–1:30 + press | Low (hand) | Med (paper)/fuller (metal) | High | Low/smooth | Flexible, ~Golden Cup+ | Steep time, grind, temp |
| **French press** | Immersion | Metal mesh | 1:16.7 | Coarse | 93–96 °C | ~4 min | — | Full/heavy | Low (sediment) | Muted | Golden Cup-ish, +oils | Grind, steep time |
| **Moka pot** | Steam pressure | Metal screen | ~1:10 | Fine | stovetop | 4–6 min | 1–2 bar | Heavy, no crema | Low | Low/bold | ~3–4 % solids | Heat/pull-off timing, grind |
| **Cold brew** | Cold immersion | Paper/felt/metal | 1:8 (concentrate) | Coarse/extra-coarse | Room/fridge | 12–24 h | — | Med-full | Med | Very low | Concentrate, diluted to taste | Steep time, ratio, grind |
| **Siphon** | Vapor-pressure immersion | Cloth/metal/paper/glass | ~1:15 | Medium | ~92–100 °C | 1–3 min | mild vacuum | Med (more than paper drip) | High | Medium-bright | Golden Cup band | Contact time, stir, filter |

**Filter effect summary:** paper (V60, Chemex, AeroPress default) → removes oils + fines + cafestol → high clarity, light body; thicker paper (Chemex) = most extreme. Metal (espresso, French press, Moka, AeroPress metal disc) → passes oils + fines → fuller body, more sediment, retains cafestol/diterpenes. Cloth (siphon) → middle ground: good clarity with some texture. [Wiki-Chemex; Wiki-FrenchPress; Wiki-Cafestol; Wiki-AeroPress]

---

## Simulator design notes

- **Universal levers** to expose on every method: grind size, dose/ratio, water temperature, contact time. These map directly onto the EY/TDS model: push any of them "up" → toward bitter (>22 % EY); "down" → toward sour (<18 % EY); balanced/sweet at ~19–21 %. [SCA; convention per Hoffmann/Rao]
- **Method-specific lever to surface:**
  - Espresso → **pressure** + grind dominate flow/time (most sensitive).
  - Moka → **heat/pull-off timing** is the make-or-break control.
  - Cold brew → **steep time (hours)** instead of seconds.
  - French press → **steep + decant timing**; AeroPress → **steep time + orientation**; siphon → **stir/agitation + contact**; Chemex → grind because of the slow thick filter.
- **Strength vs extraction are separable:** ratio moves strength (TDS) along one axis; grind/temp/time move extraction (EY) along the other. A good simulator should model these as two axes (the SCA Brewing Control Chart). [SCA]

---

## Sources

- **SCA — Coffee Standards & Golden Cup / Brewing Control Chart** (extraction 18–22 % EY, strength ~1.15–1.35 % TDS, ~55 g/L ratio, brew temp). Specialty Coffee Association. [SCA] — https://sca.coffee/research/coffee-standards
- **Coffee preparation** (per-method mechanism, temps, pressures, ratios, SCA EY/TDS recap). Wikipedia. [Wiki-Brewed] — https://en.wikipedia.org/wiki/Coffee_preparation and https://en.wikipedia.org/wiki/Brewed_coffee
- **Espresso** (9 bar, 25 ± 5 s, dose/yield, Italian Espresso National Institute spec, crema/oils). Wikipedia. [Wiki-Espresso] — https://en.wikipedia.org/wiki/Espresso
- **Chemex Coffeemaker** (thick bonded paper, kosher-salt grind, 93–96 °C, clarity, cafestol removal). Wikipedia. [Wiki-Chemex] — https://en.wikipedia.org/wiki/Chemex_Coffeemaker
- **AeroPress** (immersion + low manual pressure, paper vs metal filter, 80–92 °C, 14–20 g / 200–230 ml, 30–60 s, low acidity claim). Wikipedia. [Wiki-AeroPress] — https://en.wikipedia.org/wiki/AeroPress
- **French press** (immersion, coarse grind, 30 g : 500 ml, 93–96 °C, ~4 min, metal mesh body/oils, astringency). Wikipedia. [Wiki-FrenchPress] — https://en.wikipedia.org/wiki/French_press
- **Moka pot** (1–2 bar, ~1:10, fine grind, gurgle = stop, 3–4 % solids). Wikipedia. [Wiki-Moka] — https://en.wikipedia.org/wiki/Moka_pot
- **Cold brew coffee** (12–24 h immersion, coarse grind, filters, low titratable acidity, caffeine note). Wikipedia. [Wiki-ColdBrew] — https://en.wikipedia.org/wiki/Cold_brew_coffee
- **Vacuum coffee maker / siphon** (vapor-pressure mechanism, cloth/metal/paper/glass filter, clear brew). Wikipedia. [Wiki-Vacuum] — https://en.wikipedia.org/wiki/Vacuum_coffee_maker
- **Cafestol** (paper filters retain diterpenes/oils; unfiltered methods retain them; ~0.4–0.7 % of bean). Wikipedia. [Wiki-Cafestol] — https://en.wikipedia.org/wiki/Cafestol
- **James Hoffmann**, *The World Atlas of Coffee* and published method guides (V60 pour structure ~1:60 g/L; French press skim-and-decant technique; technique conventions). [Hoffmann] — https://www.jameshoffmann.co.uk/
- **Scott Rao**, brewing/extraction guidance (even-extraction principles, agitation, EY targeting). [Rao] — https://www.scottrao.com/

> **Retrieval caveats:** James Hoffmann's specific blog/recipe deep-links and Barista Hustle's "Golden Cup"/"Coffee Compass" articles returned 404 / paywall (402) at research time, so their numeric recipes are reported here only where they match the directly-fetched SCA and technical sources; treat Hoffmann/Rao citations as technique convention, and the SCA citation as the authoritative source for the EY/TDS/ratio numbers.
