// brew-sound — the deep module's pure core. `selectClip` is the only decision:
// which audio clip a Brew should play, given the method and mute state. It has
// no side-effects (no Audio, no fetch, no DOM) so it's trivially testable and
// the playback wrapper (./player.ts) stays a thin shell around it.
//
// Clip coverage (one clip per "voice"; several methods share the pour-gurgle):
//   pour-gurgle        — V60 / Chemex-style pour-overs / AeroPress
//   espresso-whir      — espresso machine whir + crema hiss
//   french-press-plunge— the plunger pressing down
//   phin-drip          — slow metal drip of the Vietnamese phin
//   cold-brew-pour     — ice / pour of cold brew
import type { Method } from "@/lib/coffee/types";

/** The distinct audio clips the playground can voice. */
export type ClipId =
  | "pour-gurgle"
  | "espresso-whir"
  | "french-press-plunge"
  | "phin-drip"
  | "cold-brew-pour";

/** Which clip each Method speaks with. */
export const CLIP_BY_METHOD: Record<Method, ClipId> = {
  v60: "pour-gurgle",
  aeropress: "pour-gurgle",
  espresso: "espresso-whir",
  "french-press": "french-press-plunge",
  phin: "phin-drip",
  "cold-brew": "cold-brew-pour",
};

/** Selection options. Kept as an object so callers read at the call site. */
export interface SelectClipOptions {
  /** When true, no clip is selected — the Brew is silent. */
  muted: boolean;
}

/**
 * Pure clip selection: maps a Method to its ClipId, or `null` when muted.
 * No playback, no loading — see `createBrewSoundPlayer` for the side-effects.
 */
export function selectClip(method: Method, { muted }: SelectClipOptions): ClipId | null {
  if (muted) return null;
  return CLIP_BY_METHOD[method];
}
