# Water for Coffee: Temperature & Chemistry

Research notes for the homebrew simulator. Focus: how **water temperature** and **water chemistry (mineral content)** affect extraction and the final cup. All claims are tagged to a source listed at the bottom.

---

## 1. Water Temperature

### 1.1 Why temperature matters
Brewing is a solvent extraction process. Hotter water extracts coffee solubles **faster and more completely** because higher temperature increases the solubility of coffee compounds and speeds molecular diffusion out of the grounds [Coffee ad Astra; Hendon & Colonna-Dashwood paper context]. Temperature is therefore one of the primary "extraction parameters" alongside particle size, time, pressure, water quality, and brew ratio [Hendon & Colonna-Dashwood 2014].

Different compounds dissolve at different rates, and the **order of extraction matters for flavor**:
- Early/easy to extract: acids and fruity/sour notes.
- Mid: sugars, sweetness, balance.
- Late/hard to extract: bitter and astringent compounds (and, if over-pushed, dry/harsh notes).

Higher temperature pushes the brew further along this curve toward the bitter end; lower temperature leaves the brew earlier, toward the sour end.

### 1.2 SCA / industry recommended brew temperature
- **Recommended brew range: ~90-96 °C (195-205 °F)** — the widely cited SCA Gold Cup brewing range [Mogiana; Luwak/Hoffmann V60 guides, both citing the 90-96 °C figure].
- Practitioner default: **"just off boil"** to *eliminate temperature as a variable* and to *boost extraction* [Scott Rao, V60 method].

### 1.3 Too hot vs too cool
- **Too hot (at/near boiling, >~96 °C / >205 °F):** over-extraction. Pulls more bitter/harsh compounds; cup tastes **bitter, harsh, hollow**. Gagné observed in syphon tests that brews "started to taste worse" above ~205 °F (96 °C) [Coffee ad Astra, kettle stability article].
- **Too cool (<~90 °C):** under-extraction. Not enough solubles pulled; cup tastes **sour, weak, lacking depth/sweetness** [Mogiana; Luwak].
- Rao notes the lever interacts with grind: if a roast needs a calmer extraction (e.g. dark roast), **lower temperature OR coarser grind** both reduce extraction; they're partly interchangeable [Scott Rao, V60 method].

### 1.4 Altitude & boiling
- Water boils below 100 °C at altitude (boiling point drops ~1 °C per ~285 m / ~1 °F per ~500 ft elevation [general physics, well-established]). At high elevation, "boiling" water may already be near or below the bottom of the ideal brew band, biasing brews toward **under-extraction / sourness**. Compensate with finer grind or longer contact time.
- Practical kettle reality: an uninsulated kettle drops fast — Gagné measured ~200 °F (93 °C) within 34 s of boiling, and ~10 °F (~5.5 °C) lost during a 30 s pour [Coffee ad Astra, kettle stability]. So actual slurry temperature is usually **below** the kettle set point; this matters for the simulator's "effective temperature."

### 1.5 Quantitative direction (for the simulator)
- **Direction:** higher temperature → faster extraction → higher extraction yield (EY%), all else equal [Coffee ad Astra; Rao].
- **Magnitude:** no clean published "X% EY per °C" constant was found in the verified sources; the relationship is monotonic and roughly linear across the usable band but the slope depends on grind/time. Treat temperature as a **secondary multiplier on extraction rate**, with grind size and time as the dominant levers [Coffee ad Astra, extraction-as-function-of-time/temp/grind framing].
- **Usable band for the model:** 88-96 °C. Below ~88 °C bias output toward sour/under; above ~96 °C bias toward bitter/over.

---

## 2. Water Chemistry (Mineral Content)

Pure/distilled water makes flat, under-extracted coffee — it lacks the dissolved cations that actively pull flavor out of the grounds [Coffee ad Astra; Hendon & Colonna-Dashwood]. Three knobs matter: **total hardness (GH)**, **alkalinity / carbonate hardness (KH)**, and **total dissolved solids (TDS)**.

### 2.1 The mechanism — how minerals extract flavor
- Divalent cations **magnesium (Mg²⁺)** and **calcium (Ca²⁺)** travel into the bean's cellulose walls and **bind to flavor compounds, "pulling them out"** into solution far more effectively than sodium (Na⁺) or very soft water [Coffee ad Astra; Hendon & Colonna-Dashwood 2014]. They "coordinate to nucleophilic motifs in coffee" — i.e. they latch onto specific flavor molecules [Hendon & Colonna-Dashwood 2014].
- **Magnesium vs calcium:** Mg²⁺ has **higher charge density** than Ca²⁺, so it **binds flavor compounds more aggressively** and is believed to extract a slightly different (often described as brighter/more complex) flavor profile. Gagné cautions that the flavor-difference claim, while widely held in the SCA community, is not yet fully lab-confirmed [Coffee ad Astra; Hendon & Colonna-Dashwood 2014]. **For the simulator: treat Mg as a stronger extraction agent than Ca.**
- **Goal:** "enough of these cations to do the extraction job properly, but not too much as to throw off balance the flavor" [Coffee ad Astra].

### 2.2 Alkalinity / bicarbonate buffer (KH)
- Bicarbonate (HCO₃⁻) is an **alkaline buffer**: it captures free H⁺ ions and **resists pH change**, stabilizing the brew's acidity [Coffee ad Astra].
- **Trade-off:** too much alkalinity **neutralizes the desirable aromatic acids** extracted from coffee, **muting brightness and flavor** [Coffee ad Astra]. This is the classic "flat, dull tap water" failure mode — e.g. the high-bicarbonate tap water at Colonna-Dashwood's Bath shop "muted every shot" [Hendon & Colonna-Dashwood].
- **For the simulator:** low alkalinity → bright/acidic/sharp cup (and risk of over-perceived sourness + corrosion); high alkalinity → flat/muted cup (and scale risk). There's a Goldilocks middle.

### 2.3 TDS and perceived strength
- TDS = total dissolved minerals in the brewing water (before coffee). It correlates with overall mineral availability. Too low → weak extraction; too high → muddy/over-mineralized and risk of off-tastes [SCA; Coffee ad Astra].

### 2.4 SCA recommended water specification
Consolidated from the SCA Water Quality Handbook as reported across sources (Gagné quotes the SCA targets directly):

| Parameter | Target | Acceptable range |
|---|---|---|
| **TDS** | **150 mg/L** | **75-250 mg/L** [Coffee ad Astra; SCA; Third Wave Water] |
| **Calcium / total hardness** | ~**51-68 mg/L as CaCO₃** (≈4 grains) | **17-85 mg/L** (Gagné) / **50-175 mg/L** (Third Wave reporting) as CaCO₃ |
| **Total alkalinity (KH)** | **40 mg/L as CaCO₃** | **40-70 mg/L as CaCO₃** [Coffee ad Astra; Third Wave Water] |
| **pH** | **7.0** | **6.5-7.5** [Coffee ad Astra; Third Wave Water] |
| **Sodium (Na⁺)** | **~10 mg/L** | low [Coffee ad Astra] |
| **Chlorine** | **0** | none detectable [Third Wave Water] |
| **Odor / color** | clean, odor-free, clear | — [SCA] |

> Note on hardness ranges: sources disagree on the exact hardness band. Gagné cites the SCA **calcium hardness 17-85 mg/L as CaCO₃** (target ~50-68); retailer summaries report a wider **50-175 mg/L total hardness**. The discrepancy is target *calcium* hardness vs *total* hardness reporting. **Use ~50-175 mg/L total hardness with a sweet spot near 50-80 for the simulator, flagged as approximate.**

### 2.5 "Ideal water" recipes (research-grade)
- Hendon & Colonna-Dashwood's paper provides **mineral concentrate recipes** to hit target Mg²⁺/Ca²⁺ with low bicarbonate for consistent extraction across locations [Hendon & Colonna-Dashwood 2014; "Water for Coffee" book]. Common DIY approach: start from distilled/RO water (near-zero TDS, zero alkalinity) and **add measured magnesium and/or calcium hardness plus a small bicarbonate buffer** — full control of GH and KH independently.

---

## 3. How Temperature × Chemistry × Extraction Interact

- **Extraction yield (EY%)** rises with: higher temperature, finer grind, longer contact time, **higher hardness (more Mg²⁺/Ca²⁺)**, and **lower alkalinity** (less acid-neutralization, more apparent extraction of bright compounds) [Coffee ad Astra; Hendon & Colonna-Dashwood; Rao].
- **Perceived strength** ≈ concentration of dissolved coffee solids (TDS of the *final brew*), driven by brew ratio + extraction. Brewing-water TDS/minerals raise the ceiling and efficiency of extraction but the dominant strength lever is the **coffee-to-water ratio** [SCA Gold Cup framing].
- **Flavor balance** is the position on the sour→sweet→bitter extraction curve:
  - More temp / finer / longer / harder water / lower alkalinity → toward **sweet then bitter**.
  - Less temp / coarser / shorter / softer water / higher alkalinity → toward **sour/flat**.
- **Levers are partly interchangeable:** e.g. drop temperature OR coarsen grind to calm a harsh extraction [Rao]; raise hardness OR raise temperature to lift a weak extraction.

### 3.1 Simulator mapping (directional rules)
Suggested monotonic relationships (slopes are tunable; magnitudes not all peer-cited):
- `extraction_rate ∝ +temperature` over 88-96 °C; clamp/penalize outside.
- `extraction_rate ∝ +hardness (Mg²⁺ weighted > Ca²⁺)`; diminishing returns past ~150 mg/L.
- `apparent_brightness ∝ -alkalinity`; `flat/muted ∝ +alkalinity`. Sweet spot KH ≈ 40-70 mg/L.
- `strength ∝ +brew_ratio` (dominant) and `+extraction_yield` (secondary).
- Off-flavor / under-extraction flag when TDS < ~75 mg/L or temp < ~88 °C → "sour/weak."
- Off-flavor / over-extraction flag when temp > ~96 °C (or near-boil) → "bitter/harsh."
- "Flat/dull" flag when alkalinity high (> ~70-100 mg/L) regardless of temperature.

---

## Sources

- **SCA Water Quality Handbook / standards** — Specialty Coffee Association water spec (TDS 150 mg/L target, 75-250 range; calcium hardness; total alkalinity 40 mg/L; pH 7; sodium; chlorine; odor/color). https://sca.coffee/research (handbook landing) ; reported table: https://thirdwavewater.eu/blogs/news/what-is-sca-water-standard-complete-guide-to-coffee-brewing-water-quality
- **Jonathan Gagné — "Water for Coffee Extraction," Coffee ad Astra** (mechanism of Mg²⁺/Ca²⁺ extraction, bicarbonate buffer trade-off, SCA target numbers quoted). https://coffeeadastra.com/2018/12/16/water-for-coffee-extraction/
- **Jonathan Gagné — "An Investigation of Kettle Temperature Stability," Coffee ad Astra** (temp drop magnitudes; taste worsens above ~205 °F/96 °C in syphon tests). https://coffeeadastra.com/2019/09/06/an-investigation-of-kettle-temperature-stability/
- **Jonathan Gagné — Coffee ad Astra, Brew Temperature & Extraction categories** (extraction yield as function of time/temperature/grind framing). https://coffeeadastra.com/category/brew-temperature/
- **Hendon, Colonna-Dashwood & Colonna-Dashwood — "The Role of Dissolved Cations in Coffee Extraction," J. Agric. Food Chem. 2014, 62(21):4947-4950** (Mg²⁺ > Ca²⁺ > Na⁺ for binding/extracting flavor; cations coordinate to nucleophilic motifs; bicarbonate load mutes flavor; ideal-water concentrate recipes). https://pubs.acs.org/doi/10.1021/jf501687c ; ResearchGate: https://www.researchgate.net/publication/262111309
- **Colonna-Dashwood & Hendon — "Water for Coffee" (book, Maxwell Colonna-Dashwood)** (practical hardness/alkalinity targets, mineral recipes). https://maxwelldashwood.com/products/water-for-coffee
- **Scott Rao — updated V60 method / water temperature guidance** ("just off boil" to remove temp as a variable and boost extraction; temp↔grind interchangeability for roast). https://www.scottrao.com (blog) ; method summary: r/Coffee discussion of Rao V60.
- **James Hoffmann — V60 technique brew temperature (90-96 °C / 195-205 °F)** as relayed in V60 brewing guides. https://theluwakcoffee.com/james-hoffman-v60-technique-a-step-by-step-guide
- **Mogiana Coffee — "Coffee Extraction II: Water Temperature"** (90-96 °C ideal; too hot→bitter/over, too cool→weak/under). https://mogianacoffee.com/blogs/news/coffee-extraction-ii-water-temperature

> Source-quality note: SCA, Gagné (Coffee ad Astra), Hendon & Colonna-Dashwood (peer-reviewed paper + book), Hoffmann, and Rao are the primary credible sources. Retailer/blog pages (Third Wave Water, Mogiana, Luwak) are used only to relay the **already-established SCA temperature band and water-spec numbers**, which corroborate the primary sources. The peer-reviewed ACS abstract was paywalled (HTTP 403) on direct fetch; its findings here are drawn from the paper's reported abstract/summaries and Gagné's discussion of the same chemistry.
