// Taste Mapper — deep module (pure, no UI).
//
// Turns a control-chart position into a five-axis Taste Profile and the Cup
// Visualization properties, derived from distance/direction relative to the
// ideal extraction zone (under-extracted → sour↑/sweet↓; over-extracted →
// bitter↑; low TDS → thin body; metal filter / dark roast → more body) and the
// method's strength band.
//
// See CONTEXT.md. Calibration anchors (filter body bonus, strength band) come
// from the Method Registry (methods.ts).
import type { ExtractionResult, Method, TasteResult } from "./types";
import { methodSpec } from "./methods";

export interface TasteMapperInput extends ExtractionResult {
  roast: number;
  method: Method;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const pct = (n: number) => Math.round(Math.max(0, Math.min(100, n)));

const IDEAL_EY = 20; // centre of the universal 18–22 % extraction target

export function mapTaste(input: TasteMapperInput): TasteResult {
  const spec = methodSpec(input.method);
  const { extractionYield: ey, tds, roast } = input;
  const roastT = roast / 100; // 0 light → 1 dark

  // Extraction position relative to the ideal centre.
  const under = Math.max(0, IDEAL_EY - ey); // %below ideal → sour
  const over = Math.max(0, ey - IDEAL_EY); // %above ideal → bitter

  // Acidity is a positive cup attribute, not the sour defect. It's driven mostly
  // by roast (light = bright, dark = flat), then modulated by extraction: acids
  // dissolve first, so under-extraction reads sharp/bright, while over-extraction
  // mutes perceived acidity as bitterness masks it. Never 0 except very dark.
  const acidity = pct((1 - roastT) * 65 + 15 + under * 6 - over * 4.5);
  // Bitterness rises as we over-extract; dark roast adds roasty bitterness.
  const bitterness = pct(over * 13 + roastT * 28);
  // Sweetness peaks in the ideal zone and falls off either side.
  const sweetness = pct(100 - Math.abs(ey - IDEAL_EY) * 12);

  // Body: strength within the method's band, plus a filter/oil bonus.
  const band = spec.chart.ideal;
  const strengthT = clamp01((tds - band.tdsMin) / Math.max(0.001, band.tdsMax - band.tdsMin));
  const body = pct((0.35 + strengthT * 0.5 + spec.filterBody * 0.5) * 100);

  // Balance: best when extraction sits in-box and strength sits in-band.
  const eyMiss = Math.abs(ey - IDEAL_EY) / 4; // 0 at centre, 1 at box edge
  const tdsMiss = Math.abs(strengthT - 0.5) * 2; // 0 centred, 1 at band edge
  const balance = pct(100 - eyMiss * 45 - tdsMiss * 25);

  return {
    taste: { acidity, sweetness, bitterness, body, balance },
    cup: {
      color: cupColor(roastT, strengthT, ey),
      crema: round2(crema(spec.crema, ey)),
      body: round2(0.3 + strengthT * 0.45 + spec.filterBody * 0.45),
    },
  };
}

/** Beverage colour: darker with roast and with strength; under-extraction reads
 *  a touch paler/redder, over-extraction darker/browner. */
function cupColor(roastT: number, strengthT: number, ey: number): string {
  const extractionT = clamp01((ey - 14) / 12); // 0 pale → 1 dark across the chart
  const l = 0.46 - roastT * 0.16 - strengthT * 0.06 - extractionT * 0.04;
  const c = 0.05 + roastT * 0.03 + strengthT * 0.02;
  const h = 58 + (1 - roastT) * 14; // lighter roast → slightly redder/amber
  return `oklch(${clamp01(l).toFixed(3)} ${c.toFixed(3)} ${h.toFixed(0)})`;
}

function crema(base: number, ey: number): number {
  if (base <= 0) return 0;
  // Crema fades when the shot is badly under/over-extracted.
  const quality = 1 - Math.min(1, Math.abs(ey - IDEAL_EY) / 8);
  return clamp01(base * (0.5 + quality * 0.5));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
