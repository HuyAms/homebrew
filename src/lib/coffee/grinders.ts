// Grinder reference — translate the generic grind coarseness into "your
// grinder's clicks" (issue #8). The user picks their grinder model and the Grind
// Size readout shows the setting in *their* clicks; with no grinder picked it
// falls back to the everyday references in grind.ts.
//
// Settings are sourced midpoints of published per-method dial-in ranges, keyed
// by the seven coarseness bands in grind.ts (fine → coarse), which map to brew
// methods as: 0 espresso · 1 Moka · 2 V60 · 3 drip/pour-over · 4 Chemex ·
// 5 French press · 6 cold brew. Primary source: Honest Coffee Guide per-grinder
// charts; clicks-per-rotation / microns-per-click from the makers' own pages.
// Approximate by design (real dial-in always varies), but never invented.
import { grindBandIndex } from "./grind";

export type GrinderId =
  | "generic"
  | "comandante-c40"
  | "1zpresso-jx-pro"
  | "baratza-encore"
  | "timemore-c3"
  | "fellow-ode-2"
  | "kingrinder-k6";

export interface Grinder {
  id: GrinderId;
  name: string;
  /** Display setting per coarseness band (length 7, fine → coarse). */
  byBand?: string[];
}

// Real grinders, with a sourced setting per band. `generic` carries no clicks —
// the everyday references in grind.ts stand in for it.
const GRINDERS: Grinder[] = [
  { id: "generic", name: "Generic / everyday" },
  {
    id: "comandante-c40",
    name: "Comandante C40",
    // clicks from zero. honestcoffeeguide.com/comandante-c40-mk4-grind-settings
    byBand: ["~8 clicks", "~18 clicks", "~20 clicks", "~24 clicks", "~26 clicks", "~32 clicks", "~36 clicks"],
  },
  {
    id: "1zpresso-jx-pro",
    name: "1Zpresso JX-Pro",
    // full rotations of the dial (40 clicks/turn). honestcoffeeguide.com/1zpresso-jx-pro-grind-settings
    byBand: ["~1.5 turns", "~2.7 turns", "~3.0 turns", "~3.6 turns", "~3.8 turns", "~4.4 turns", "~4.7 turns"],
  },
  {
    id: "baratza-encore",
    name: "Baratza Encore",
    // dial 1–40. honestcoffeeguide.com/baratza-encore-grind-settings (espresso is approximate — not a true espresso grinder)
    byBand: ["dial ~3", "dial ~11", "dial ~12", "dial ~17", "dial ~26", "dial ~30", "dial ~34"],
  },
  {
    id: "timemore-c3",
    name: "Timemore C3",
    // clicks from zero (don't go below 6). honestcoffeeguide.com/timemore-c3-grind-settings
    byBand: ["~7 clicks", "~13 clicks", "~14 clicks", "~17 clicks", "~21 clicks", "~22 clicks", "~24 clicks"],
  },
  {
    id: "fellow-ode-2",
    name: "Fellow Ode Gen 2",
    // setting 1–11. honestcoffeeguide.com/fellow-ode-brew-grinder-gen-2-grind-settings (filter-only; espresso approximate)
    byBand: ["setting ~1.5", "setting ~4", "setting ~4", "setting ~5", "setting ~6", "setting ~9", "setting ~10"],
  },
  {
    id: "kingrinder-k6",
    name: "Kingrinder K6",
    // rotation.click notation (60 clicks/turn). honestcoffeeguide.com/kingrinder-k6-grind-settings
    byBand: ["~0.33", "~1.00", "~1.05", "~1.19", "~1.30", "~1.58", "~2.07"],
  },
];

export const GRINDER_OPTIONS = GRINDERS;

const BY_ID = new Map<GrinderId, Grinder>(GRINDERS.map((g) => [g.id, g]));

export function isGrinderId(v: unknown): v is GrinderId {
  return typeof v === "string" && BY_ID.has(v as GrinderId);
}

export function grinderName(id: GrinderId): string {
  return BY_ID.get(id)?.name ?? "Generic / everyday";
}

/** The dial-in setting string for a grinder at a grind value, or null for the
 *  generic fallback (caller shows the everyday references instead). */
export function grinderSetting(id: GrinderId, grindValue: number): string | null {
  const g = BY_ID.get(id);
  if (!g?.byBand) return null;
  return g.byBand[grindBandIndex(grindValue)];
}
