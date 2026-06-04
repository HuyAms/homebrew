// Featured Recipes — curated, read-only recipes from well-known brewers, one or
// more per method (issue #8). The user *loads* them (selecting one animates the
// Variables + morphs the cup); the user never creates or saves their own — see
// ADR-0004 (no brew journal) and CONTEXT.md (Featured Recipe).
//
// Every value is sourced, not invented. Where a brewer's real number falls
// outside a method's simulator range it is clamped to the nearest in-range value
// and the clamp is noted. Sources are cited per recipe.
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
      // temp clamped 100→96°C (method ceiling). hario-europe.com/blogs/hario-community/v60-ambassadors-james-hoffmann
      vars: { grind: 42, waterTemp: 96, ratio: 17, time: 210, roast: 35 },
    },
    {
      id: "v60-kasuya",
      title: "4:6 Method",
      brewer: "Tetsu Kasuya",
      brewerBio: "2016 World Brewers Cup champion who invented the 4:6 method to tune taste by pour, not grind.",
      note: "20g : 300g split 40% (sweetness/acidity) + 60% (strength) — five pours that dial taste with no grind change.",
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
      // unpacking.coffee/recipes/40-james-hoffmann-espresso-dialing-in
      vars: { grind: 8, waterTemp: 93, ratio: 2, time: 28, roast: 40 },
    },
    {
      id: "esp-hedrick-soup",
      title: "Soup Method",
      brewer: "Lance Hedrick",
      brewerBio: "Barista champion and educator known for accessible, high-clarity extraction recipes.",
      note: "Coarse, long 1:3 lever shot on ultra-light roast — juicy, high-clarity, and forgiving of bad gear.",
      // time clamped 15→18s, temp clamped 99→96°C. beanbook.app/recipes/dc-lance-hedrick--soup-method-espresso
      vars: { grind: 16, waterTemp: 96, ratio: 3, time: 18, roast: 12 },
    },
  ],
  aeropress: [
    {
      id: "ap-hoffmann",
      title: "Ultimate AeroPress",
      brewer: "James Hoffmann",
      brewerBio: HOFFMANN_BIO,
      note: "Inverted, no bloom, 2-min steep then a slow 30s press — stops before the bitter tail. Smooth and easy.",
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
      // authentic 1:4 clamped to 1:6 (method floor). nguyencoffeesupply.com/blogs/vietnamese-coffee-brew-guide/traditional-vietnamese-drip-phin
      vars: { grind: 55, waterTemp: 95, ratio: 6, time: 300, roast: 75 },
    },
  ],
};

/** Featured Recipes for a method (empty array if none). */
export function featuredRecipes(method: Method): FeaturedRecipe[] {
  return FEATURED_RECIPES[method] ?? [];
}
