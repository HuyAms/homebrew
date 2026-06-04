// Featured Recipes — curated, read-only recipes from well-known brewers, one or
// more per method (issue #8). The user *loads* them (selecting one animates the
// Variables + morphs the cup); the user never creates or saves their own — see
// ADR-0004 (no brew journal) and CONTEXT.md (Featured Recipe).
//
// Every value is sourced, not invented. Where a brewer's real number falls
// outside a method's simulator range it is clamped to the nearest in-range value
// and the clamp is noted. Sources are cited per recipe.
//
// These recipes are the calibration targets for the Extraction Engine: each is
// tuned to land INSIDE its method's ideal box (methods.ts → CALIBRATION CONTRACT,
// ADR-0005). If you add/edit a recipe, re-run it through extractFrom() and confirm
// it sits in the box — otherwise it will be falsely flagged over/under-extracted.
import type { BrewVars, Method } from "./types";

export interface FeaturedRecipe {
  id: string;
  /** Short recipe name. */
  title: string;
  /** Who the recipe is credited to. */
  brewer: string;
  /** One line on who that brewer is (so a newcomer knows why to trust it). */
  brewerBio: string;
  /** One line on what makes the recipe distinctive. */
  note: string;
  /** Ordered, beginner-followable brewing steps (shown in the recipe's "how to make" info tip). */
  steps: string[];
  /** The Variable set this recipe loads. */
  vars: BrewVars;
}

// James Hoffmann anchors five of the recipes; keep his bio in one place.
const HOFFMANN_BIO =
  "UK Barista Champion, author of The World Atlas of Coffee, and coffee's most-followed YouTube educator.";

export const FEATURED_RECIPES: Record<Method, FeaturedRecipe[]> = {
  v60: [
    {
      id: "v60-hoffmann",
      title: "Ultimate V60",
      brewer: "James Hoffmann",
      brewerBio: HOFFMANN_BIO,
      note: "30g : 500g (1:16.7), two-stage pour with an end stir + swirl for an even, repeatable bed. A clean, bright, forgiving everyday pour-over.",
      steps: [
        "Rinse filter, add 30g coffee, make a center well.",
        "Pour 60g water to bloom, swirl, rest to 0:45.",
        "Pour steadily to 300g total by 1:15.",
        "Pour again to 500g total by ~1:45.",
        "Stir clockwise then anticlockwise to dislodge grounds.",
        "Swirl gently to flatten bed; finish drawdown by ~3:30.",
      ],
      // temp clamped 100→96°C (method ceiling). hario-europe.com/blogs/hario-community/v60-ambassadors-james-hoffmann
      vars: { grind: 42, waterTemp: 96, ratio: 17, time: 210, roast: 35 },
    },
    {
      id: "v60-kasuya",
      title: "4:6 Method",
      brewer: "Tetsu Kasuya",
      brewerBio: "2016 World Brewers Cup champion who invented the 4:6 method to tune taste by pour, not grind.",
      note: "20g : 300g split 40% (sweetness/acidity) + 60% (strength) — five pours that dial taste with no grind change.",
      steps: [
        "Rinse filter, add 20g coffee, level the bed.",
        "Pour 1: 60g water at 0:00 to bloom.",
        "Pour 2: 60g at 0:45 — sets sweetness/acidity.",
        "Pour 3: 60g at 1:30 — begins strength.",
        "Pour 4: 60g at 2:15.",
        "Pour 5: 60g at 3:00 (300g total); drain by ~3:30.",
      ],
      // kurasu.kyoto/blogs/kurasu-journal/2016-world-brewers-cup-champion-tetsu-kasuya
      vars: { grind: 50, waterTemp: 93, ratio: 15, time: 210, roast: 35 },
    },
  ],
  "french-press": [
    {
      id: "fp-hoffmann",
      title: "French Press Technique",
      brewer: "James Hoffmann",
      brewerBio: HOFFMANN_BIO,
      note: "Break the crust at 4 min, skim, let fines settle, then barely press — full body with remarkably little sediment.",
      steps: [
        "Coarse-grind 30g coffee into the press.",
        "Pour 500g water (~96°C); start the timer.",
        "At 4:00, break the crust and stir gently.",
        "Skim off the foam and floating grounds.",
        "Wait 5–8 min for grounds to settle.",
        "Rest plunger at the surface — don't press down; pour slowly.",
      ],
      // total contact clamped ~9–12 min → 600s ceiling. timer.coffee/recipes/french-press/james-hoffmann-french-press-recipe
      vars: { grind: 72, waterTemp: 95, ratio: 17, time: 600, roast: 50 },
    },
  ],
  espresso: [
    {
      id: "esp-hoffmann",
      title: "Standard Espresso (1:2)",
      brewer: "James Hoffmann",
      brewerBio: HOFFMANN_BIO,
      note: "18g in → 36g out in ~28s at 93°C — the modern specialty dial-in baseline every shot starts from.",
      steps: [
        "Weigh 18g coffee into a dry portafilter.",
        "Grind fine, break clumps and distribute (WDT).",
        "Tamp level with firm, even pressure.",
        "Wipe the rim and lock into the group head.",
        "Pull immediately, targeting 36g out in ~25–30s.",
        "Tune grind: finer if fast/sour, coarser if slow/bitter.",
      ],
      // unpacking.coffee/recipes/40-james-hoffmann-espresso-dialing-in
      vars: { grind: 8, waterTemp: 93, ratio: 2, time: 28, roast: 40 },
    },
    {
      id: "esp-hedrick-soup",
      title: "Soup Method",
      brewer: "Lance Hedrick",
      brewerBio: "Barista champion and educator known for accessible, high-clarity extraction recipes.",
      note: "Coarse, long 1:3 lever shot on ultra-light roast — juicy, high-clarity, and forgiving of bad gear.",
      steps: [
        "Grind coarse — about filter level, far coarser than usual.",
        "Dose ~17g, tap level, seat a top screen.",
        "Add ~50g near-boiling water (~96°C) for a 1:3 shot.",
        "Soak the puck at near-zero pressure until fully saturated.",
        "Press through fast and low-pressure (gentle flow).",
        "Stop near 50g out — a juicy, high-clarity cup.",
      ],
      // A deliberately LONG, low-pressure pull (~45s) that drives EY high for
      // clarity; the long 1:3 makes it low-strength (~5–7% TDS) by design, not
      // weak. temp clamped 99→96°C. beanbook.app/recipes/dc-lance-hedrick--soup-method-espresso
      vars: { grind: 16, waterTemp: 96, ratio: 3, time: 45, roast: 12 },
    },
  ],
  aeropress: [
    {
      id: "ap-hoffmann",
      title: "Ultimate AeroPress",
      brewer: "James Hoffmann",
      brewerBio: HOFFMANN_BIO,
      note: "No bloom, 2-min steep then a slow 30s press — stops before the bitter tail. Smooth and easy.",
      steps: [
        "Set AeroPress upright on a mug; add a paper filter.",
        "Add 11g medium-fine coffee — no rinse or preheat.",
        "Pour 200g water (~95°C); start the timer.",
        "Insert plunger ~1cm to seal; steep 2 minutes.",
        "Swirl gently, then wait 30s to settle.",
        "Press slowly all the way down (~30s).",
      ],
      // ratio clamped 1:18→1:17, temp clamped 100→95°C. aeroprecipe.com/recipes/james-hoffmann-aeropress-recipe
      vars: { grind: 32, waterTemp: 95, ratio: 17, time: 150, roast: 35 },
    },
  ],
  "cold-brew": [
    {
      id: "cb-hoffmann",
      title: "Room-Temp Cold Brew",
      brewer: "James Hoffmann / SCA",
      brewerBio: HOFFMANN_BIO,
      note: "Coarse, ~1:11, 18h at room temp — a smooth, sweet, low-acidity batch, no fridge needed.",
      steps: [
        "Coarsely grind coffee at ~1:11 (e.g. 80g : 880g).",
        "Combine grounds with room-temperature filtered water.",
        "Stir gently until all grounds are saturated.",
        "Cover and steep ~18 hours at room temp.",
        "Strain through a paper filter into a clean pitcher.",
        "Serve over ice.",
      ],
      // drink-strength batch interpretation of his 1:4–1:8 concentrate. jameshoffmann.co.uk/weird-coffee-science
      vars: { grind: 85, waterTemp: 20, ratio: 11, time: 64800, roast: 55 },
    },
  ],
  phin: [
    {
      id: "phin-nguyen",
      title: "Cà Phê Sữa Đá",
      brewer: "Nguyen Coffee Supply",
      brewerBio: "Brooklyn roaster (founder Sahra Nguyen) championing Vietnamese robusta and traditional phin brewing.",
      note: "Dark robusta-leaning, slow ~5-min drip onto sweetened condensed milk — strong, syrupy, iced.",
      steps: [
        "Add ~2 tbsp sweetened condensed milk to a glass.",
        "Add ~3 tbsp coarse dark robusta to the phin.",
        "Insert gravity press; push down and twist gently.",
        "Pour ~1 oz water at ~95°C; bloom 30s.",
        "Fill phin to the brim, cover, drip 4–5 min.",
        "Stir to dissolve the milk, then pour over ice.",
      ],
      // authentic 1:4 clamped to 1:6 (method floor). nguyencoffeesupply.com/blogs/vietnamese-coffee-brew-guide/traditional-vietnamese-drip-phin
      vars: { grind: 55, waterTemp: 95, ratio: 6, time: 300, roast: 75 },
    },
  ],
};

/** Featured Recipes for a method (empty array if none). */
export function featuredRecipes(method: Method): FeaturedRecipe[] {
  return FEATURED_RECIPES[method] ?? [];
}
