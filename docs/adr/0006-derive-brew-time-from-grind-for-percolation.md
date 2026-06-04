# Derive brew time from grind for gravity-percolation methods

**Status:** accepted

## Context & decision

Brew Time shipped as a free **Variable** slider for all six methods. For gravity
percolation (V60, phin) that is physically a lie: with grind, dose, water, and
pour held fixed, drawdown time is **not** something the brewer sets — it is a
*consequence* of grind (finer → more flow resistance → slower flow → longer
contact). The simulator let the user drag time from 1:30 to 5:00 at fixed grind,
a brew that cannot exist on a V60. It also **double-counted** grind: a finer
grind raises Extraction Yield both by surface area (`grindSwing`) and by slowing
flow — but the engine credited the slowing-flow effect a second time through an
independent `timeSwing`, as if time were a separate knob.

The physics splits cleanly by regime (see `research/04`, Gagné, the equilibrium-
desorption literature):

- **Immersion** (French press, AeroPress, cold brew): the brewer holds the clock
  and decides when to plunge/decant. Time is a **genuine free input**, bounded by
  an extraction plateau. → keep the slider.
- **Gravity percolation** (V60, phin): drawdown follows grind, with only small
  residual freedom (pour cadence, tamp). → time becomes a **derived read-out**.
- **Espresso** (pressure): shot time follows grind *only at fixed pressure*. We
  model no pressure Variable, and a shipped recipe (Hedrick's **Soup Method**)
  deliberately decouples time via a low-pressure soak (coarse grind, long 45s
  pull). Deriving espresso time from grind would break that calibrated recipe and
  misrepresent the shot. → keep time an **input** until a pressure model exists.

We added a per-method `timeMode: "input" | "derived"` flag to the Method Registry
(tunable data, per ADR-0001). For `derived` methods:

- `deriveTime(method, grind)` maps the grind position onto the time range,
  inverted (finer → longer; default grind → default time).
- The engine contributes **no independent `timeEY`** — grind already carries the
  slower-flow effect, so this removes the double-count.
- The UI renders a non-interactive **drawdown gauge** + read-out (labelled
  *Drawdown* for V60, *Drip Time* for phin) that tracks grind live, with the
  caption "Set by grind — finer = slower" — never a disabled slider (which reads
  as broken and has poor screen-reader support). The grind slider is tied to the
  read-out via `aria-describedby`; the read-out is a polite `role="status"`.
- The Coach drops the time lever for derived methods, so it never prescribes an
  unappliable "Steep longer/shorter" fix; grind remains the primary EY lever.

All eight Featured Recipes and every method default still land in their ideal box
after the change (re-verified through `extractFrom`) — no recalibration needed.

## Considered options

- **Hybrid (derived baseline + small residual nudge)** for V60/phin: rejected for
  v1 — the residual pour/tamp freedom is real but secondary, and a moving-anchor
  offset slider is the most complex control in the app. A clean derived read-out
  is the honest core; hybrid can follow if users miss the agency.
- **Derive espresso time from grind too** (the textbook dependent variable):
  rejected — pressure is unmodeled and the Soup recipe exploits the decoupling;
  forcing it derived breaks a sourced recipe.
- **Disabled/greyed time slider** on derived methods: rejected — reads as broken,
  inconsistent assistive-tech support; render plain text + a read-only gauge.
- **Keep time free everywhere**: rejected — it's the original physical lie and the
  double-count this ADR exists to fix.

## Consequences

- On V60/phin, time is no longer draggable; you change drawdown by changing grind,
  and the read-out moves with it — which is what a real brewer experiences.
- The derived drawdown is the model's grind-prediction, so a recipe's displayed
  Drawdown can still differ from its sourced contact time by a few seconds (e.g.
  the 4:6 Method shows ~3:15 vs the recipe's ~3:30); the residual gap is pour
  technique (dose, pour schedule) the model doesn't capture. The per-method anchor
  (`defaults.time`) is tuned so the default grind lands on a *realistic* drawdown —
  V60 at 3:30, phin at 5:00 — rather than leaving the gauge implausibly fast.
  Because time adds no EY on derived methods, retuning the anchor never touches a
  chart box.
- Featured Recipes still store a `time` value; for derived methods it is ignored
  and re-derived from grind. Shared URLs with an explicit `time` on a derived
  method are silently re-derived, so old links stay consistent.
- `timeMode` is per-method tunable data: reclassifying a method (e.g. once a
  pressure or Technique input exists for espresso) is a one-line change.
- Espresso time staying an input is a known, documented approximation, not an
  oversight — revisit when pressure/Technique is modelled.
