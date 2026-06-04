# Extraction Evenness as a non-point model dimension

**Status:** accepted

## Context & decision

Until now a brew has been a single point on the **Control Chart** — one (Extraction Yield, TDS) dot computed deterministically from five **Variables** (`grind, waterTemp, ratio, time, roast`), and a `Fix` has always been a `keyof BrewVars`. This cleanly models *position* faults (sour, bitter, weak, strong) but cannot represent the single loudest espresso complaint in our user research: **"sour and bitter at the same time"** — i.e. **Channeling**, where part of the bed over-extracts while part under-extracts simultaneously. Its fix is not a Variable; it is *technique*.

We are adding **Extraction Evenness** as a second model dimension (espresso-only at launch):

- A new input *kind*, **Technique**, distinct from **Variable**. A Variable moves the dot; a Technique moves the *spread*.
- Exactly one Technique input at launch: **Puck Prep** (a Sloppy↔Dialed slider abstracting WDT + level tamp). It never touches the dose/grind/ratio numbers.
- At low evenness the chart dot widens into a smear/split, the bottomless pull visibly sprays, and the Verdict says *"uneven — fix prep, not grind."*
- A `Fix` can now be a Puck Prep correction, not only a Variable. In Reverse mode this is the one complaint (**"sour & bitter at once"**) that does not map to a single chart direction.

## Considered options

- **Skip evenness; stay a pure single-point simulator**: rejected — sidesteps the most acute espresso pain and the most visually distinctive, defensible feature we have.
- **Full technique variables (WDT / distribution / tamp as separate sliders)**: rejected — recreates the 30-field bloat that users explicitly hate; one abstracted Puck Prep knob carries the concept without the clutter.
- **Model Channeling for all methods**: rejected at launch — it's overwhelmingly an espresso pain; pour-over unevenness is real but far less acute and dilutes the iconic bottomless-spray moment.

## Consequences

- The core type model expands: `BrewVars` is no longer the whole input surface, and `Fix.variable` can no longer be assumed to be a `keyof BrewVars`. Coach/engine code that pattern-matches on Variables must account for a Technique fix path.
- The Control Chart render gains a non-point state (smear/split) for low evenness.
- Reverse mode gains a sixth complaint whose prescription is Puck Prep.
- Evenness is espresso-scoped; other methods keep the single-point model until/unless we revisit.
