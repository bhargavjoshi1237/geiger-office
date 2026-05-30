// Range normalization, iteration, and labelling.

import { labelOf } from "@/components/sheet-editor/utils/cell-utils";

export function normalizeRange(range) {
  return {
    start: {
      row: Math.min(range.start.row, range.end.row),
      col: Math.min(range.start.col, range.end.col),
    },
    end: {
      row: Math.max(range.start.row, range.end.row),
      col: Math.max(range.start.col, range.end.col),
    },
  };
}

export function forEachRangeCell(range, callback) {
  const normalized = normalizeRange(range);

  for (let row = normalized.start.row; row <= normalized.end.row; row += 1) {
    for (let col = normalized.start.col; col <= normalized.end.col; col += 1) {
      callback(row, col);
    }
  }
}

export function rangeLabelOf(range) {
  const normalized = normalizeRange(range);
  const startLabel = labelOf(normalized.start);
  const endLabel = labelOf(normalized.end);

  return startLabel === endLabel ? startLabel : `${startLabel}:${endLabel}`;
}
