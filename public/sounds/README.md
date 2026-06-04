# Brew-it sound clips

The Brew it button plays a method-appropriate clip. Selection logic lives in
`src/lib/sound/brew-sound.ts`; the player resolves each clip to a file here
(`src/lib/sound/player.ts`, `CLIP_URL`). Until a file exists, playback fails
silently — the ritual still runs.

**HITL:** a human sources and approves the actual audio (licensing + taste).
Short royalty-free / lightweight clips are fine; pro sound design is out of
scope. Drop the files below into this directory.

| File                         | Methods                         | Sound                                  |
| ---------------------------- | ------------------------------- | -------------------------------------- |
| `pour-gurgle.mp3`            | V60, Chemex-style, AeroPress    | water pouring + gurgle                 |
| `espresso-whir.mp3`          | Espresso                        | machine whir + crema hiss              |
| `french-press-plunge.mp3`    | French press                    | the plunger pressing down              |
| `phin-drip.mp3`              | Vietnamese phin                 | slow metal drip                        |
| `cold-brew-pour.mp3`         | Cold brew                       | ice / pour                             |

Keep clips short (≈1–3 s) and small. MP3 is assumed; change the extension in
`CLIP_URL` if you use another format.

## Licensing

Clips sourced from [SoundBible](https://soundbible.com). **Pending human taste +
licensing approval.** Attribution-3.0 clips require crediting the author wherever
the app credits assets (e.g. an About/Credits note) — see the CC BY 3.0 deed.

| File                      | SoundBible original | Author          | License                                                          |
| ------------------------- | ------------------- | --------------- | ---------------------------------------------------------------- |
| `pour-gurgle.mp3`         | Pouring Hot Tea     | Cori Samuel     | Public Domain                                                    |
| `espresso-whir.mp3`       | Making Espresso     | BlastwaveFx.com | [Attribution 3.0](https://creativecommons.org/licenses/by/3.0/)  |
| `french-press-plunge.mp3` | Bubbling            | Mike Koenig     | [Attribution 3.0](https://creativecommons.org/licenses/by/3.0/)  |
| `phin-drip.mp3`           | Water Droplet       | Mike Koenig     | [Attribution 3.0](https://creativecommons.org/licenses/by/3.0/)  |
| `cold-brew-pour.mp3`      | Ice Cubes In Cup    | (SoundBible)    | Public Domain                                                    |

> These are stand-in picks chosen for fit, not final taste-approved sound design.
> Swap any file in place (keep the name) to replace a clip.
