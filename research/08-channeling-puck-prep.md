# 08 · Channeling & Puck Prep (espresso extraction evenness)

Sourced reference for the **Extraction Evenness** dimension (ADR-0003): the
espresso-only **Puck Prep** Technique, the **Channeling** failure mode, its
sour-and-bitter-at-once taste signature, and the bottomless-portafilter spray
that makes it visible. Every claim traces to a named source. Do not add coffee
facts here without a citation.

> Note on sources: Barista Hustle's channeling/WDT lessons are paywalled (HTTP
> 402) and could not be quoted directly. The claims below stand on Perfect Daily
> Grind, Clive Coffee, Five Senses, Brew Coffee Home, Home-Barista, Scott Rao,
> Barista Magazine, and espresso troubleshooting references.

## 1. How channeling forms

Channeling is water finding a narrow fast path through the puck instead of
flowing through the whole bed evenly. It is driven by **uneven resistance** —
water always takes the path of least resistance, so any weak spot becomes a
channel.

- **Path of least resistance / weak spots**: "Channeling occurs when there are
  weak spots in your coffee bed. In these spots, water can pass through
  quickly." — [Perfect Daily Grind](https://perfectdailygrind.com/2022/03/what-is-channeling-espresso-extraction/)
- **Uneven density from clumps / poor distribution**: clumps create higher-density
  zones; low-density zones become the fast path while dense zones stay
  under-saturated. — [Perfect Daily Grind](https://perfectdailygrind.com/2022/03/what-is-channeling-espresso-extraction/)
- **Uneven / sloped tamp**: "If there is a slope in the tamp, all the water will
  run through the lower side of the puck first." — [Perfect Daily Grind](https://perfectdailygrind.com/2022/03/what-is-channeling-espresso-extraction/); "If it is tamped even at a slight angle, it will create an area of uneven distribution and a path of less resistance." — [Clive Coffee](https://clivecoffee.com/blogs/learn/even-extraction-the-pursuit-of-perfection)
- **Static / clumping & fines**: static during grinding causes clumps and uneven
  density. Nuance: over-aggressive WDT can itself cause **fines migration**
  (small particles packing the bottom), creating dense layers that channel — so
  "more prep" is not monotonically better. — [Complete Home Barista](https://completehomebarista.com/problems/fix-espresso-channeling/)
- **Scott Rao** ties channeling volatility (flow/pressure spikes) to "poor puck
  prep or too many clumps in the dry grounds." — [Scott Rao](https://www.scottrao.com/blog/2019/4/6/extraction-curve-analysis)

## 2. Taste signature — sour AND bitter at once

The defining signature, and the one the single-point control chart cannot show:
fast-path zones get too much water (over-extract → **bitter**) while bypassed
zones get too little (under-extract → **sour**), simultaneously.

- "This causes a combination of under and overextraction, and creates an
  espresso shot which is both weak and sour as well as overly bitter." —
  [Perfect Daily Grind](https://perfectdailygrind.com/2022/03/what-is-channeling-espresso-extraction/)
- A shot that "tastes sour and bitter simultaneously" is the diagnostic
  signature of channeling. — [Coffee Gear Hub](https://www.coffeegearhub.com/espresso-troubleshooting-guide/)
- Result reads as "muddied, unclear flavors" from simultaneous over/under
  extraction → low balance, low sweetness, low clarity. — [Clive Coffee](https://clivecoffee.com/blogs/learn/what-is-channeling)

**Model implication**: low evenness raises *both* the bitterness and the acidity
axes at once and tanks balance/sweetness — the "harsh" complaint.

## 3. Puck Prep — what each step does (abstracted into one knob)

- **WDT (Weiss Distribution Technique)**: stirring loose grounds with thin
  needles breaks up clumps and homogenizes density → uniform bed, even flow,
  prevents channeling. — [Complete Home Barista](https://completehomebarista.com/problems/fix-espresso-channeling/)
- **Distribution**: uneven particle distribution makes "water flow at different
  rates through the bed"; distribution fills the basket evenly "all the way to
  the sides." — [Clive Coffee](https://clivecoffee.com/blogs/learn/even-extraction-the-pursuit-of-perfection)
- **Level tamp**: "The real key is ensuring your tamp is perfectly level" — gives
  uniform horizontal resistance so water can't favor one side. — [Clive Coffee](https://clivecoffee.com/blogs/learn/even-extraction-the-pursuit-of-perfection)

The app's single **Puck Prep** (Sloppy↔Dialed) knob abstracts WDT + distribution
+ level tamp into one Technique input.

## 4. "Fix prep, not grind" — channeling is a Technique problem

The key insight for the Coach: channeling is fixed by puck prep, not by chasing
grind numbers.

- "Channeling is the most frequently misdiagnosed espresso problem — and the one
  most often 'fixed' by changing grind or recipe when the real cause is puck
  preparation." Prescription: "Fix channeling before changing any recipe
  variable" (WDT → distribute → level tamp). — [Coffee Gear Hub](https://www.coffeegearhub.com/espresso-troubleshooting-guide/)
- "The more evenly we distribute our coffee in the portafilter basket, the less
  likely we are to see channeling." — [Clive Coffee](https://clivecoffee.com/blogs/learn/what-is-channeling)

## 5. Bottomless (naked) portafilter — the visual diagnostic

Removing the spout exposes the basket so you can watch the whole extraction and
"easily ascertain whether the water is being pushed through in an even manner."
It is the standard visual diagnostic for evenness/channeling, and "tells all… in
a ruthless way." — [Five Senses](https://www.fivesenses.com.au/blog/getting-dirty-naked-portafilter/); [Home-Barista](https://www.home-barista.com/naked-extraction.html)

**GOOD, even extraction** — drives the "dialed" animation:
- Droplets bead up across the *whole* basket face, then "coalesce into one
  stream centered on the base of the basket." — [Brew Coffee Home](https://www.brewcoffeehome.com/bottomless-portafilter/)
- The single stream is glossy and thick — "pours beautifully like warm honey." —
  [Home-Barista](https://www.home-barista.com/naked-extraction.html)
- Amber/honey/reddish-brown that blondes (lightens) **uniformly** only near the
  end (~25–30s). Even tiger-striping is a positive sign. — [Five Senses](https://www.fivesenses.com.au/blog/getting-dirty-naked-portafilter/); [Espresso Coffee Guide](https://espressocoffeeguide.com/all-about-espresso/how-to-make-espresso/espresso-blonding-channeling-tiger-striping/)

**BAD, channeled extraction** — drives the "sloppy" spray animation:
- Thin high-velocity jets squirt sideways at angles — "spurters" and "geysers,"
  espresso "sprays out in… jet-like streams at varying angles," can hit the
  portafilter skirt. — [Keep Roasting](https://www.keeproasting.com/articles/how-do-i-stop-my-bottomless-portafilter-from-spitting)
- "Espresso shoots out the bottom… at high speeds and in unpredictable
  directions," sputtering. Flow never converges to one clean column; "water will
  pour from the side of the basket rather than through the middle." — [Home-Barista](https://www.home-barista.com/naked-extraction.html); [Five Senses](https://www.fivesenses.com.au/blog/getting-dirty-naked-portafilter/)
- Premature pale/blonde streaks/patches appear early and in localized spots
  (where the puck isn't compressed tightly), not uniformly. — [Five Senses](https://www.fivesenses.com.au/blog/getting-dirty-naked-portafilter/); [Crema Coffee Products](https://cremacoffeeproducts.com/blogs/news/how-to-fix-channeling)

**Animation model**:
- *Dialed*: many droplets across the face → merge into one glossy, centered,
  honey-thick rivulet running straight down.
- *Sloppy*: off-center thin jets spraying sideways/diagonally, sputtering, no
  clean convergence.

**Realism caveat (not modeled, noted)**: a naked portafilter can mislead —
late-shot spritz isn't always channeling, and a clean pour isn't a guarantee of
evenness. — [Lance Hedrick, "Naked Portafilters Are Liars…Sometimes"](https://www.youtube.com/watch?v=2j5RFFFINPA)

## Sources

- Perfect Daily Grind — What Is Channeling: https://perfectdailygrind.com/2022/03/what-is-channeling-espresso-extraction/
- Clive Coffee — Even Extraction: https://clivecoffee.com/blogs/learn/even-extraction-the-pursuit-of-perfection
- Clive Coffee — What Is Channeling: https://clivecoffee.com/blogs/learn/what-is-channeling
- Complete Home Barista — Fix Espresso Channeling: https://completehomebarista.com/problems/fix-espresso-channeling/
- Coffee Gear Hub — Espresso Troubleshooting Guide: https://www.coffeegearhub.com/espresso-troubleshooting-guide/
- Scott Rao — Extraction Curve Analysis: https://www.scottrao.com/blog/2019/4/6/extraction-curve-analysis
- Barista Magazine — Changing Espresso Extraction with Scott Rao: https://www.baristamagazine.com/changing-espresso-extraction-with-scott-rao/
- Five Senses — Getting Dirty with a Naked Portafilter: https://www.fivesenses.com.au/blog/getting-dirty-naked-portafilter/
- Brew Coffee Home — Bottomless Portafilter: https://www.brewcoffeehome.com/bottomless-portafilter/
- Home-Barista — Diagnosing Espresso Extraction Problems: https://www.home-barista.com/naked-extraction.html
- Espresso Coffee Guide — Blonding, Channeling, Tiger Striping: https://espressocoffeeguide.com/all-about-espresso/how-to-make-espresso/espresso-blonding-channeling-tiger-striping/
- Keep Roasting — Stop Portafilter Squirting: https://www.keeproasting.com/articles/how-do-i-stop-my-bottomless-portafilter-from-spitting
- Crema Coffee Products — How to Fix Channeling: https://cremacoffeeproducts.com/blogs/news/how-to-fix-channeling
- Lance Hedrick — Naked Portafilters Are Liars…Sometimes: https://www.youtube.com/watch?v=2j5RFFFINPA
