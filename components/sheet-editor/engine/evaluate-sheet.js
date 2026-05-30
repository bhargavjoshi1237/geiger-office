// Memoized formula evaluator with cycle detection, backed by fast-formula-parser.

import FormulaParser from "fast-formula-parser";
import { keyOf } from "@/components/sheet-editor/utils/cell-utils";
import { coerceCellValue } from "@/components/sheet-editor/utils/format-utils";

export function evaluateSheet(sheet) {
  const visiting = new Set();

  function createParser() {
    return new FormulaParser({
      onCell: ({ row, col }) => evaluateCell(row, col),
      onRange: (ref) => {
        const values = [];

        for (let row = ref.from.row; row <= ref.to.row; row += 1) {
          const rowValues = [];

          for (let col = ref.from.col; col <= ref.to.col; col += 1) {
            rowValues.push(evaluateCell(row, col));
          }

          values.push(rowValues);
        }

        return values;
      },
    });
  }

  function evaluateCell(row, col) {
    const cellKey = keyOf(row, col);
    const rawValue = sheet.cells[cellKey] ?? "";

    if (typeof rawValue !== "string" || !rawValue.startsWith("=")) {
      return coerceCellValue(rawValue);
    }

    if (visiting.has(cellKey)) return "#CYCLE";

    try {
      visiting.add(cellKey);
      return createParser().parse(rawValue.slice(1), { row, col, sheet: sheet.name });
    } catch {
      return "#ERROR";
    } finally {
      visiting.delete(cellKey);
    }
  }

  return evaluateCell;
}
