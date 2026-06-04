# Brew Ratio & Extraction Theory

Research notes for an interactive brew simulator. Scope: brew ratio (coffee-to-water dose) and the core extraction-theory variables (Extraction Yield, TDS, Strength), the SCA Gold Cup / Coffee Brewing Control Chart, and the exact equations that link them.

Sources are listed at the bottom; each non-obvious claim cites a source tag like `[CAA-EY]`.

---

## 1. The Three Core Variables (and how they differ)

There are three quantities. People constantly confuse the last two, so define them precisely.

### 1.1 Dose, Brew Water, Beverage Mass
- **Dose (`D`)** — mass of dry ground coffee, in grams.
- **Brew water (`W`)** — mass of water added to the coffee, in grams (1 mL water ≈ 1 g).
- **Beverage mass (`B`)** — mass of the *liquid coffee in the cup* after brewing. This is less than `W` because the spent grounds retain water. `[CAA-EY]`

### 1.2 TDS — Total Dissolved Solids (a.k.a. "Strength" or "Concentration")
- **Definition:** the percentage of dissolved coffee solids per unit mass of the *final beverage*. `[WIKI-EXT]` `[CAA-EY]`
- It answers: *"How concentrated / strong is the liquid in the cup?"*
- Measured with a **refractometer** (e.g. VST), quoted precision ~0.01% TDS; temperature-sensitive (a 5°F sample-temp error can shift the reading by up to ~0.08% TDS). `[CAA-TDS]`
- Units: % (e.g. 1.35% means 1.35 g dissolved solids per 100 g of beverage).
- "**Strength**" and "**TDS**" are used interchangeably in industry. `[BH-CHART]` `[WIKI-BREW]`

### 1.3 Extraction Yield (EY %)
- **Definition:** the fraction of the *original dry coffee mass* that dissolved into the beverage, expressed as a percentage. `[WIKI-EXT]` `[CAA-EYMEAS]`
- It answers: *"What proportion of the coffee bean did we actually pull out?"*
- Roasted coffee is only ~28–30% water-soluble in total, so EY physically tops out around there; we only ever use a slice of that. `[BH-CHART]`

### 1.4 Strength vs Extraction — the key distinction
This is the single most important conceptual point for the simulator:

- **Extraction (EY)** = *how much* coffee mass left the grounds → a property of the **grounds**.
- **Strength (TDS)** = *how concentrated* the resulting drink is → a property of the **beverage**.

They are linked but **independent controls**. You can have:
- High extraction + low strength (lots dissolved, but heavily diluted → big batch brew).
- Low extraction + high strength (little dissolved, but very little water → ristretto-ish).

The bridge between them is the **brew ratio** (see §3). The fundamental identity: `[WIKI-EXT]` `[WIKI-BREW]`

```
Strength  ∝  Brew Ratio  ×  Extraction

(dissolved solids / water) = (grounds / water) × (dissolved solids / grounds)
   TDS                     =   brew ratio       ×   extraction yield
```

In words: **changing the ratio moves strength up/down the chart almost independently of extraction; changing grind/time/agitation moves extraction left/right.**

---

## 2. The Coffee Brewing Control Chart / SCA Gold Cup

### 2.1 What it is
A 2-D plot, originally from **E.E. Lockhart's** mid-20th-century MIT / Coffee Brewing Center research and later adopted into the **SCA(A) "Gold Cup" standard**: `[WIKI-BREW]`
- **X-axis = Extraction Yield (%)**
- **Y-axis = Strength / TDS (%)**
- A central **"ideal" rectangle** marks the target zone; diagonal lines of constant brew ratio sweep across it. `[WIKI-BREW]` `[BH-CHART]`

### 2.2 The "ideal" box (target ranges)
- **Ideal extraction yield: 18–22%** (i.e. 20% ± 2%). Widely agreed across SCA standards. `[WIKI-BREW]` `[WIKI-EXT]` `[CAA-EYMEAS]`
- **Ideal strength (TDS)** — varies by regional standard: `[WIKI-BREW]` `[WIKI-EXT]`
  - **SCA / American Gold Cup:** 1.15–1.35% (1.25% ± 0.10) — *use this as the simulator default.*
  - **European (SCAE):** 1.20–1.45%
  - **Norwegian / Nordic:** 1.30–1.50% (1.40% ± 0.10)
- A commonly cited single "ideal box" spanning the union of these is roughly **EY 18–22% × TDS 1.15–1.45%** (the range stated in the task brief). Default the simulator to **18–22% × 1.15–1.35%** for the strict SCA box, with regional toggles.

### 2.3 The brew-ratio guidelines underlying the box
The chart's diagonal ratio lines correspond to practical doses: `[WIKI-BREW]`
- **~55 g/L** (≈ 1:18) for American standards.
- **~63 g/L** (≈ 1:16) for Norwegian standards.
- ≈ 14–16 g of coffee for a standard 240 mL cup.

### 2.4 The four quadrants (flavor mapping)
The ideal box sits at the center. Deviating along each axis defines four corners. `[WIKI-BREW]` `[BH-CHART]`

```
            STRONG (high TDS, above box)
                      |
  UNDER + STRONG      |      OVER + STRONG
  sour & intense /    |      bitter & intense /
  harsh, "muddy"      |      "ashy"
                      |
 UNDER-EXTRACTED -----+----- OVER-EXTRACTED   (X axis)
  EY < 18%            |       EY > 22%
  sour, sharp,        |       bitter, dry,
  salty, lacking      |       astringent,
  sweetness           |       hollow
                      |
  UNDER + WEAK        |      OVER + WEAK
  sour & watery       |      bitter & watery
                      |
             WEAK (low TDS, below box)
```

Single-axis summary:
- **Under-extracted (EY < 18%):** sour, sharp, salty, lacking sweetness — not enough of the (sweeter, later-dissolving) solubles came out. `[WIKI-EXT]` `[BH-CHART]`
- **Over-extracted (EY > 22%):** bitter, astringent, dry, hollow — pulled out the harsh, undesirable solubles. `[WIKI-EXT]` `[BH-CHART]`
- **Weak (TDS below box):** thin, watery, dilute — independent of whether extraction was good.
- **Strong (TDS above box):** intense, heavy, overpowering — independent of extraction quality.
- **Ideal box:** balanced — sweetness, acidity, and body in proportion. `[WIKI-BREW]`

Mnemonic for the simulator's tasting note engine:
- **EY axis → quality of flavor** (sour ↔ balanced ↔ bitter).
- **TDS axis → intensity of flavor** (weak ↔ balanced ↔ strong).

---

## 3. Brew Ratio

### 3.1 Definition & typical values
**Brew ratio = dose : water**, written `1 : N` where `N = W / D`. `[WIKI-EXT]`

| Method | Typical ratio (coffee:water) | Notes |
|---|---|---|
| Filter / pour-over / batch | **1:15 – 1:18** | SCA American ≈ 1:18 (55 g/L); Nordic ≈ 1:16 (63 g/L). `[WIKI-BREW]` |
| French press / immersion | ~1:15 – 1:17 | similar band |
| **Espresso** | **~1:2** (modern) | dose : *liquid yield out*. e.g. 18 g in → 36 g out. |
| Espresso (Italian INEI std) | 7 g in → ~25 mL out ≈ **1:3.5** | older/traditional spec. `[WIKI-ESP]` |
| Ristretto / lungo | ~1:1 / ~1:3–4 | shorter/longer shots |

Espresso TDS is far higher (~8–12%) than filter (~1.2–1.4%) because the ratio is ~1:2 instead of ~1:16, even at similar EY (espresso EY ~18–22%, sometimes quoted 15–25%). `[WIKI-ESP]` `[WIKI-EXT]`

### 3.2 How ratio moves strength independently of extraction
From the identity in §1.4, `TDS = brew_ratio × EY`. So at a **fixed extraction yield**, doubling the dose (tighter ratio, smaller `N`) roughly doubles the TDS — you slide *vertically* on the control chart without moving horizontally. This is why ratio is the strength knob and grind/time is the extraction knob. `[WIKI-EXT]` `[BH-CHART]`

---

## 4. The Equations (for the simulator)

Notation:
- `D` = dose (g, dry coffee)
- `W` = brew water (g)
- `B` = beverage mass in cup (g)
- `C` = TDS as a **decimal** (e.g. 1.30% → `C = 0.013`)
- `EY` = extraction yield as a **decimal** (e.g. 20% → 0.20)
- `L` = Liquid Retained Ratio (LRR): grams of water retained per gram of grounds; **default `L ≈ 2.0`**. `[CAA-EYMEAS]`

### 4.1 Brew ratio
```
ratio_N = W / D          (the "N" in 1:N)
```

### 4.2 Beverage mass (mass balance)
The grounds soak up water; some dissolved solids leave with the liquid. `[CAA-EYMEAS]`
```
B = W − (D × L) + (dissolved solids mass)
B ≈ W − (D × L)          (the solids term is small; good first approximation)
```

### 4.3 Extraction Yield — the canonical formula
**Most accurate (measure the beverage in the cup):** `[CAA-EYMEAS]` `[WIKI-EXT]`
```
EY = (B × C) / D
```
i.e. (beverage mass × TDS) ÷ dose. This is the form to prefer if `B` is known.

**Approximate / brief-form (using brew water, no beverage weight):** `[CAA-EYMEAS]`
The task's stated approximation:
```
EY ≈ (W × C) / D
```
This *overestimates* because it ignores the water retained by the grounds. Better closed forms that account for retention:

- **Immersion (French press, cupping)** — beverage weight cancels out:
  ```
  EY = (W × C) / (D × (1 − C))
  ```
- **Percolation (V60, Chemex, batch)** when `B` is not measured:
  ```
  EY = (W × C) / ( D × (1 + L − C × (1 + L)) )
  ```
  The `1/(1−C)` style correction typically shifts EY by only ~0.2–0.4%. `[CAA-EYMEAS]`

### 4.4 Strength (TDS) from EY and ratio — inverse direction
Rearranging §4.3 (accurate form):
```
C = (EY × D) / B           →   TDS% = 100 × (EY × D) / B
```
Using brew water (approx):
```
C ≈ (EY × D) / W = EY / ratio_N
```
This is the compact simulator identity: **`TDS ≈ EY / N`** (with EY and TDS both as decimals). Equivalently `TDS = brew_ratio × EY` from §1.4, since `brew_ratio = D/W = 1/N`. `[WIKI-EXT]`

### 4.5 Solving for any variable (simulator core)
Given any two of {ratio, EY, TDS} you can get the third. Using the brew-water approximation (`B ≈ W`, `C ≈ EY/N`):

```
TDS  ≈ EY / N            (strength from extraction + ratio)
EY   ≈ TDS × N           (extraction back-solved from strength + ratio)
N    ≈ EY / TDS          (ratio needed to hit a target strength at an extraction)
W    = D × N             (water from dose + ratio)
D    = W / N             (dose from water + ratio)
```

For higher fidelity, swap `W` for `B` and use `B = W − D×L`:
```
C = (EY × D) / (W − D × L)
```

### 4.6 Worked example (sanity check)
Filter brew: `D = 20 g`, `W = 320 g` → `N = 16` (1:16). Suppose `EY = 0.20` (20%).
- Approx: `TDS ≈ 0.20 / 16 = 0.0125 = 1.25%`  → lands in the SCA ideal box.
- With retention `L = 2`: `B = 320 − 20×2 = 280 g`; `C = (0.20×20)/280 = 0.01429 = 1.43%` (stronger, because beverage is smaller than brew water). Both EY (20%) and TDS (1.25–1.43%) sit in/near the ideal box.

Espresso: `D = 18 g`, beverage out `B = 36 g` (1:2), `EY = 0.20`:
- `C = (0.20 × 18) / 36 = 0.10 = 10% TDS` — matches the ~8–12% espresso strength band despite identical EY. Demonstrates ratio driving strength.

---

## 5. Simulator Design Cheat-Sheet

**Inputs (sliders):** dose `D`, water `W` (or ratio `N`), and an extraction knob (grind/time/temp/agitation) that maps to target `EY`.

**Compute:**
1. `N = W / D`
2. `B = W − D × L` (default `L = 2.0`; expose as advanced setting)
3. `TDS = EY × D / B` (accurate) or `EY / N` (fast)

**Plot the point** at `(EY, TDS)` on the control chart.

**Ideal box (default = SCA American):** `EY ∈ [18%, 22%]`, `TDS ∈ [1.15%, 1.35%]`. Offer regional presets (Euro 1.20–1.45%, Nordic 1.30–1.50%; broad box 1.15–1.45%).

**Flavor verdict (2-axis):**
- EY < 18% → "under-extracted: sour / salty / lacking sweetness"
- EY > 22% → "over-extracted: bitter / astringent / dry"
- 18–22% → "well-extracted: balanced, sweet"
- TDS below box → "weak / watery"
- TDS above box → "strong / intense"
- Both in box → "ideal / balanced"

**Key teaching interaction:** moving the *ratio* slider should slide the point **vertically** (strength) with EY fixed; moving the *grind/time* slider should slide it **horizontally** (extraction). That visual separation is the whole pedagogical point.

---

## Sources

- `[WIKI-BREW]` Wikipedia, "Brewed coffee" (Brewing Control Charts, ideal yield 18–22%, regional TDS ranges, 55–63 g/L, strength ∝ brew ratio × extraction). https://en.wikipedia.org/wiki/Brewed_coffee
- `[WIKI-EXT]` Wikipedia, "Coffee extraction" (EY = M₂·t/M₁; strength definition; 18–22% ideal; espresso 15–25%; t/V = (M/V)×(t/M)). https://en.wikipedia.org/wiki/Coffee_extraction
- `[WIKI-ESP]` Wikipedia, "Espresso" (Italian INEI standard: 7 g dose, ~25 mL yield ≈ 1:3.5; higher dissolved solids than drip). https://en.wikipedia.org/wiki/Espresso
- `[CAA-EYMEAS]` Jonathan Gagné, *Coffee ad Astra* — "Measuring and Reporting Extraction Yields" (EY = B·C/D; immersion EY = W·C/[D(1−C)]; percolation EY = W·C/[D(1+L−C(1+L))]; LRR ≈ 2.0; mass balance B = W − D·L + dissolved mass). https://coffeeadastra.com/2019/02/17/measuring-and-reporting-extraction-yields/
- `[CAA-TDS]` Jonathan Gagné, *Coffee ad Astra* — "Measuring Coffee Concentration with a 0.01% Precision" (refractometer/VST TDS measurement, 0.01% precision, temperature sensitivity). https://coffeeadastra.com/2019/09/21/measuring-coffee-concentration-with-a-0-01-precision/
- `[BH-CHART]` Barista Hustle — Coffee Brewing Control Chart / extraction theory (strength vs extraction as independent axes; ~28–30% max solubility; quadrant flavor mapping). https://www.baristahustle.com/ (Brewing Control Chart materials)

### Provenance / caveats
- The SCA Gold Cup numeric box (EY 18–22%, TDS ~1.15–1.45%) traces historically to **E.E. Lockhart's MIT / Coffee Brewing Center research** (mid-1900s), adopted by the SCAA/SCA; this lineage is summarized in `[WIKI-BREW]`. The primary SCA standard documents (sca.coffee) are paywalled/membership-gated and could not be fetched directly here, but the figures cited are the standard published values corroborated across `[WIKI-BREW]`, `[WIKI-EXT]`, and `[CAA-EYMEAS]`.
- Barista Hustle blog pages returned HTTP 402 (paywalled) on direct fetch; the chart/quadrant claims tagged `[BH-CHART]` reflect the well-established Barista Hustle / Perger framing of the control chart and are cross-confirmed by `[WIKI-BREW]`.
- Use the **accurate beverage-mass formula `EY = B·C/D`** in the simulator where possible; the `EY ≈ W·C/D` brief form (in the task) is a convenient approximation that overstates EY by the water-retention term.
