// Sheet factory and structural row/column shifting.

import { COLUMN_COUNT, ROW_COUNT } from "@/components/sheet-editor/constants";
import { keyOf } from "@/components/sheet-editor/utils/cell-utils";
import { adjustFormula } from "@/components/sheet-editor/utils/formula-utils";

// Relocate every cell, style and note when a band of rows/columns is inserted or
// removed, fixing up formula references as it goes. Cells pushed off the fixed grid
// edge are dropped; cells inside a removed band disappear.
export function shiftSheet(sheet, { axis, at, delta }) {
  const relocateKey = (row, col) => {
    let nextRow = row;
    let nextCol = col;

    if (axis === "row") {
      if (delta < 0 && row >= at && row < at - delta) return null;
      if (row >= at) nextRow = row + delta;
    } else {
      if (delta < 0 && col >= at && col < at - delta) return null;
      if (col >= at) nextCol = col + delta;
    }

    if (nextRow < 1 || nextRow > ROW_COUNT || nextCol < 1 || nextCol > COLUMN_COUNT) return null;

    return keyOf(nextRow, nextCol);
  };

  const remap = (source, isFormula) => {
    const next = {};

    Object.entries(source ?? {}).forEach(([cellKey, value]) => {
      const [row, col] = cellKey.split(":").map(Number);
      const nextKey = relocateKey(row, col);
      if (!nextKey) return;
      next[nextKey] = isFormula ? adjustFormula(value, { axis, at, delta }) : value;
    });

    return next;
  };

  return {
    ...sheet,
    cells: remap(sheet.cells, true),
    styles: remap(sheet.styles, false),
    notes: remap(sheet.notes, false),
  };
}

export function createSheet(name = "Sheet1") {
  return {
    id: crypto.randomUUID(),
    name,
    cells: {},
    styles: {},
    notes: {},
    names: [],
  };
}
