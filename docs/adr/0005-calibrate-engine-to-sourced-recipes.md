# Calibrate the extraction engine so sourced recipes land in-box

**Status:** accepted

## Context & decision

Loading a **Featured Recipe** plots it on the **Control Chart**. With the original
calibration, **6 of 8** champion recipes fell outside their ideal box — e.g.
Hoffmann's Ultimate V60 read **over-extracted** (EY 25.5%) and Hedrick's "Soup
Method" read **sour / under-extracted** (EY 15.7%) with the Verdict telling the
user to "grind finer." Telling a newcomer that a celebrated, correctly-sourced
recipe is a mistake to fix directly undercuts the feature's "load a known-good
start" purpose.

The recipe numbers and the `TDS = EY/ratio` mass balance were **not** wrong
(verified against sourced reference EY/TDS). The fault was the engine's
**calibration**: EY swing coefficients were large and additive against a box only
±2% wide, so realistic "hot + long" recipes overshot; and a single per-method
strength box couldn't hold legitimately long-ratio styles.

We **re-calibrated** (tunable data only — engine math unchanged, per ADR-0001),
grounded in sourced numbers (see `research/`):

- **Gentler secondary EY swings.** Grind stays the dominant lever (±5–6% EY);
  water temp (a few °C) and brew time are secondary. Immersion (French press,
  AeroPress) extraction *plateaus* (Barista Hustle), so their `timeSwing` is
  small — a long steep is settling, not more extraction.
- **Method-specific strength boxes.** Espresso strength is a ratio-driven style
  choice (ristretto 1:2 ≈ 10% TDS → long 1:3 ≈ 5–7% TDS); EY (18–22%) is the real
  quality gate, so its box spans 5–12% TDS. Cold brew (RTD ~1:11, stronger than
  drip) and phin (authentic 1:4–1:6 robusta) get their own higher TDS boxes +
  chart domains rather than the filter band.
- **Espresso `time` range raised to 60s** so a long, low-pressure lever shot fits
  instead of being pinned to the 18s floor and read as under-extracted.
- **Cold brew sits a touch under-centre** (baseEY 19) — cold water extracts less
  efficiently, so it tends to run under-extracted vs the hot-filter box.

All 8 Featured Recipes now land in their box, and every method's default recipe
still lands mid-box.

## Considered options

- **Widen the EY box past 18–22%**: rejected — 18–22% is the canonical SCA Golden
  Cup target; widening it to fit would misrepresent the standard.
- **Leave long-ratio recipes (1:3 espresso) outside the box but soften the
  Verdict copy**: rejected — the user still sees a featured recipe sitting visibly
  outside IDEAL, which is the exact complaint. EY is the quality gate; strength is
  preference, so the strength box should reflect the method's intended ratio.
- **Edit the recipe numbers to force them in-box**: rejected — the numbers are
  sourced; the model must bend to reality, not the reverse.

## Consequences

- Temp/time are weaker levers in the playground for immersion methods — physically
  honest (the plateau is real), but the live chart moves less when dragging them.
- Strength boxes now differ per method; the Control Chart's IDEAL box is taller for
  espresso (strength is flexible there). The taste mapper reads each method's box as
  its strength band, so body/balance follow suit.
- Calibration is fit to the shipped recipes; adding a recipe at an extreme of a
  method's range may need a re-check (run the recipe set through the engine).
