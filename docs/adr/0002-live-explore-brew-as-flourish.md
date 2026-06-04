# Explore is live; Brew is a flourish; Reverse trusts the tongue

**Status:** accepted

## Context & decision

The original design **brew-gated** the result: sliders gave live *visual* feedback (grounds, beans, chart dot), but the Cup, Taste Profile, and Verdict updated only when the user pressed **Brew**. The stated rationale was that the tweak → Brew → taste → adjust loop "mirrors real dial-in."

In practice the gate confused users: it was unclear that Brew was required to see results, and the button read as decorative. We are **removing the brew-gate in Forward mode (Explore)**:

- **Explore is fully live.** Cup, Taste Profile, Verdict, and Pro chart all update as the user drags. There is no gate.
- **Brew becomes a flourish** in Explore. It changes no data; it replays the method-specific brewing ritual (drain + re-pour animation, method-specific sound, steam, a landing stamp) purely for delight. It can be re-triggered anytime.
- **Reverse mode has no Brew.** The cup was already made in real life; the user reports it. The action there is **Apply** (write the prescribed fix into the recipe).
- **Trust the tongue (Reverse).** The user's *reported* taste is ground truth and overrides the simulation. The simulated Verdict/Taste Profile are hidden in Reverse so the two never conflict.

## Considered options

- **Keep the global brew-gate**: rejected — the documented "mirrors real dial-in" benefit didn't survive contact with users; the gate mostly hid the app's main payoff behind an unexplained click.
- **Remove Brew everywhere (fully decorative app-wide)**: rejected — a button that never does anything real is a UX lie; Reverse's Apply gives the action genuine meaning.
- **Live preview + Brew commits to a journal/history**: rejected for now — adds a persistence concept we don't need for v1; revisit if a brew journal is built.

## Consequences

- Immediacy wins over dial-in realism in Explore: the playground feels like a sandbox, results never hide.
- Brew-it's entire job is now delight (animation + sound), so it can be designed freely without data correctness concerns.
- The `brewed` gating flag is vestigial in Forward and absent in Reverse; the persistent search-param state effectively reduces to the recipe itself.
- Reverse becomes a distinct flow (report → fix → Apply) rather than a re-skin of Explore, and deliberately diverges from the simulation when the user's tongue disagrees.

## Addendum — Reverse deferred

Reverse mode (the Fix-my-cup tab and the Forward/Reverse toggle) is being **removed from the UI for now** and revived later if wanted. The `coachFromComplaint` engine and reverse types are kept dormant. The Reverse design above remains the design-of-record for revival. The live-Explore + Brew-as-flourish decisions stand on their own and are unaffected.
