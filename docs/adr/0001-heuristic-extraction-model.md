# Heuristic extraction model, not first-principles physics

**Status:** accepted

## Context & decision

The playground must map (method + grind, water temp, brew ratio, brew time, roast level) onto a point on the SCA brewing control chart (Extraction Yield %, TDS %), then onto taste, cup, and a coaching verdict. We decided to drive this with a **research-calibrated heuristic model**: each variable moves EY along a documented monotonic curve with method-specific coefficients, baselines are shifted by roast level and method, and strength uses the real mass-balance relationship `TDS = brew_ratio × EY`. Per-method defaults are tuned to land inside the "tastes great" zone.

We chose this because the target users are practical home/professional brewers, not researchers ([[homebrew-target-users]]): the model must be *directionally correct and honest* rather than lab-precise. The published sources (SCA, Hoffmann, Rao, Barista Hustle, Gagné, Hendon/Colonna-Dashwood — captured in `/research`) give reliable directional relationships and the mass-balance equation, but not verified coefficients for every variable.

## Considered options

- **First-principles physics** (diffusion kinetics, saturating extraction, bed flow resistance): rejected — needs many coefficients the research can't verify, risks false precision, and large effort for no user-visible gain.
- **Preset recipes + interpolation**: rejected as the core — accurate near anchors but kills the free "sandbox" feel of a playground. (Known-good per-method defaults are still used as starting points.)

## Consequences

- Numbers are plausible and self-consistent, not measured truth — fine for teaching and dial-in coaching, not for lab use.
- Calibration lives in tunable per-method coefficient tables; adjusting feel = editing data, not rewriting the engine.
- If verified data later emerges, individual curves can be replaced without changing the architecture.
