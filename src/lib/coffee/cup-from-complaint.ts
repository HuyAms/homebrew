// Cup-from-complaint — pure mapping (no UI).
//
// Reverse mode ("Fix my cup") trusts the tongue: the cup the user *made* is
// rendered from their REPORTED taste, not the simulation. This biases a
// representative (Extraction, Strength) point toward the reported fault — well
// past the method's ideal box — then runs the same Taste Mapper as Forward, so
// the cup's colour/crema/body stay consistent with the rest of the app while
// clearly reading as the reported fault. The user's recipe still informs the
// cup through `roast` (it sets the base colour); the complaint biases the rest.
//
// See CONTEXT.md ("Trust the tongue", "Cup Visualization").
import type { BrewVars, CupVisual, Method, TasteComplaint } from "./types";
import { methodSpec } from "./methods";
import { mapTaste } from "./taste-mapper";

// How far past the ideal-box edge each fault sits, as a fraction of the box, so
// the cup-you-made reads unmistakably faulted rather than borderline.
const EY_OVERSHOOT = 0.9; // sour/bitter push past the extraction edge
const TDS_OVERSHOOT = 0.7; // weak/too-strong push past the strength band

/** The CupVisual for "the cup you made", from the reported taste + the recipe. */
export function cupFromComplaint(
  complaint: TasteComplaint,
  method: Method,
  vars: BrewVars,
): CupVisual {
  const { ideal } = methodSpec(method).chart;
  const eySpan = ideal.eyMax - ideal.eyMin;
  const tdsSpan = ideal.tdsMax - ideal.tdsMin;

  // Start dead-centre of the ideal box; each fault shoves one axis out.
  let extractionYield = (ideal.eyMin + ideal.eyMax) / 2;
  let tds = (ideal.tdsMin + ideal.tdsMax) / 2;
  // Channeling ("harsh") is rendered through low evenness rather than a chart
  // position: it muddies the colour and breaks the crema (the cup you made when
  // the shot sprayed). Dialed (1) for every position fault.
  let evenness = 1;

  switch (complaint) {
    case "sour": // under-extracted — left of the box
      extractionYield = ideal.eyMin - eySpan * EY_OVERSHOOT;
      break;
    case "bitter": // over-extracted — right of the box
      extractionYield = ideal.eyMax + eySpan * EY_OVERSHOOT;
      break;
    case "weak": // low strength — below the band
      tds = ideal.tdsMin - tdsSpan * TDS_OVERSHOOT;
      break;
    case "too-strong": // high strength — above the band
      tds = ideal.tdsMax + tdsSpan * TDS_OVERSHOOT;
      break;
    case "just-right": // dead-centre of the ideal box
      break;
    case "harsh": // channeling — sour & bitter at once; muddied, broken crema
      extractionYield = ideal.eyMax + eySpan * (EY_OVERSHOOT * 0.5);
      evenness = 0.12;
      break;
  }

  return mapTaste({ extractionYield, tds, roast: vars.roast, method, evenness }).cup;
}
