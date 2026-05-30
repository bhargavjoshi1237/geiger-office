// Cell key/label conversions and equality helpers.

import { COLUMN_COUNT, ROW_COUNT, columns } from "@/components/sheet-editor/constants";

export function keyOf(row, col) {
  return `${row}:${col}`;
}

export function keyToCell(cellKey) {
  const [row, col] = cellKey.split(":").map(Number);
  return { row, col };
}

export function labelOf({ row, col }) {
  return `${columns[col - 1]}${row}`;
}

export function parseCellLabel(value) {
  const match = value.trim().toUpperCase().match(/^([A-Z])(\d{1,3})$/);

  if (!match) return null;

  const col = match[1].charCodeAt(0) - 64;
  const row = Number(match[2]);

  if (col < 1 || col > COLUMN_COUNT || row < 1 || row > ROW_COUNT) return null;

  return { row, col };
}

export function sameCell(left, right) {
  return left.row === right.row && left.col === right.col;
}

export function sameRange(left, right) {
  return sameCell(left.start, right.start) && sameCell(left.end, right.end);
}
