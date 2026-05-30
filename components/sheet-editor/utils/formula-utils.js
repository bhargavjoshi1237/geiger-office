// Extract and rewrite A1-style references inside formulas.

import { COLUMN_COUNT, ROW_COUNT } from "@/components/sheet-editor/constants";
import { keyOf, parseCellLabel } from "@/components/sheet-editor/utils/cell-utils";
import { forEachRangeCell } from "@/components/sheet-editor/utils/range-utils";

export function referencedCellKeys(formula) {
  const keys = new Set();
  if (typeof formula !== "string" || !formula.startsWith("=")) return keys;

  const refPattern = /([A-Z]{1,2}\d{1,3})(?::([A-Z]{1,2}\d{1,3}))?/g;
  let match;

  while ((match = refPattern.exec(formula.toUpperCase())) !== null) {
    const start = parseCellLabel(match[1]);
    if (!start) continue;
    const end = match[2] ? parseCellLabel(match[2]) : start;
    if (!end) continue;
    forEachRangeCell({ start, end }, (row, col) => keys.add(keyOf(row, col)));
  }

  return keys;
}

// Shift the A1-style references inside a formula when rows/columns are inserted or
// removed. `at` is the 1-based index where the change happens, `delta` is +count for
// inserts and -count for deletes. References that fall inside a removed band become
// #REF!, matching Google Sheets. The negative lookbehind keeps us from matching the
// digits inside function names like LOG10.
export function adjustFormula(formula, { axis, at, delta }) {
  if (typeof formula !== "string" || !formula.startsWith("=")) return formula;

  return formula.replace(/(?<![A-Za-z$])([A-Z])(\d{1,3})/g, (match, colLetter, rowDigits) => {
    let col = colLetter.charCodeAt(0) - 64;
    let row = Number(rowDigits);

    if (axis === "row") {
      if (delta < 0 && row >= at && row < at - delta) return "#REF!";
      if (row >= at) row += delta;
    } else {
      if (delta < 0 && col >= at && col < at - delta) return "#REF!";
      if (col >= at) col += delta;
    }

    if (row < 1 || row > ROW_COUNT || col < 1 || col > COLUMN_COUNT) return "#REF!";

    return `${String.fromCharCode(64 + col)}${row}`;
  });
}
