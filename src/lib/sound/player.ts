// The thin playback wrapper around brew-sound's pure `selectClip`. It owns all
// the side-effects the core refuses to: resolving a clip id to a URL, lazily
// constructing an HTMLAudioElement on first use (nothing audio-related is
// fetched at page load — `preload="none"`, and we only build the element when a
// clip is actually played), caching it for replays, and playing it.
//
// Sound is deliberately independent of `prefers-reduced-motion`: a Brew is an
// explicit user gesture, so autoplay policies are satisfied and a muted-motion
// user still hears the ritual.
import { selectClip, type ClipId } from "./brew-sound";
import type { Method } from "@/lib/coffee/types";

/** Where each clip's audio file lives (served from `public/sounds/`). A human
 *  sources/approves the actual clips; until a file exists, `play` fails silently. */
export const CLIP_URL: Record<ClipId, string> = {
  "pour-gurgle": "/sounds/pour-gurgle.mp3",
  "espresso-whir": "/sounds/espresso-whir.mp3",
  "french-press-plunge": "/sounds/french-press-plunge.mp3",
  "phin-drip": "/sounds/phin-drip.mp3",
  "cold-brew-pour": "/sounds/cold-brew-pour.mp3",
};

export interface BrewSoundPlayer {
  /** Play the method's clip unless muted. Safe to call on every Brew press. */
  play(method: Method, opts: { muted: boolean }): void;
}

/** Create a player. Audio elements are cached per clip and built on first play. */
export function createBrewSoundPlayer(
  resolveUrl: (clip: ClipId) => string = (c) => CLIP_URL[c],
): BrewSoundPlayer {
  // SSR / non-browser guard: no Audio constructor → a no-op player.
  const canPlay = typeof Audio !== "undefined";
  const cache = new Map<ClipId, HTMLAudioElement>();

  return {
    play(method, { muted }) {
      const clip = selectClip(method, { muted });
      if (!clip || !canPlay) return;

      let el = cache.get(clip);
      if (!el) {
        el = new Audio();
        el.preload = "none"; // nothing fetched until this first play
        el.src = resolveUrl(clip);
        cache.set(clip, el);
      }
      // Restart from the top so rapid re-brews retrigger the clip.
      el.currentTime = 0;
      // play() rejects if the file is missing or autoplay is blocked — swallow
      // it; sound is a flourish and must never break the Brew.
      void el.play().catch(() => {});
    },
  };
}
