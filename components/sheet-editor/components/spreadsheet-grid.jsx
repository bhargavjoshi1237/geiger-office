"use client";

import { memo, useCallback, useMemo } from "react";
import { ReactGrid } from "@silevis/reactgrid";
import {
  SHEET_GRID_COLORS,
  columns,
  defaultStyle,
  minCellWidth,
  minRowHeight,
  rows,
} from "@/components/sheet-editor/constants";
import { keyOf } from "@/components/sheet-editor/utils/cell-utils";
import { formatDisplayValue } from "@/components/sheet-editor/utils/format-utils";
import { cn } from "@/lib/utils";

export const SpreadsheetGrid = memo(function SpreadsheetGrid({
  columnWidths,
  evaluatedCell,
  filterEnabled,
  isEditable,
  referencedKeys,
  rowHeights,
  sheet,
  showFormulas,
  onCellsCommit,
  onColumnResize,
  onRowResize,
  onSelectionChange,
}) {
  const handleCellsChanged = useCallback(
    (changes) => {
      onCellsCommit(
        changes
          .map((change) => ({
            row: Number(change.rowId),
            col: columns.indexOf(String(change.columnId)) + 1,
            type: change.type,
            value: change.newCell.text,
          }))
          .filter((change) => change.row > 0 && change.col > 0 && change.type === "text"),
      );
    },
    [onCellsCommit],
  );

  const handleColumnResized = useCallback(
    (columnId, width) => {
      const col = columns.indexOf(String(columnId)) + 1;
      if (col > 0) onColumnResize(col, width);
    },
    [onColumnResize],
  );

  const handleRowResized = useCallback(
    (rowId, height) => {
      const row = Number(rowId);
      if (row > 0) onRowResize(row, height);
    },
    [onRowResize],
  );

  const gridColumns = useMemo(
    () => [
      { columnId: "row-header", width: 44, resizable: false },
      ...columns.map((column, index) => ({
        columnId: column,
        width: columnWidths[index],
        resizable: true,
      })),
    ],
    [columnWidths],
  );

  const makeStyledRenderer = useCallback((text, style) => (
    <span
      className="sheet-grid-cell-value"
      style={{
        fontSize: style.fontSize,
        fontStyle: style.italic ? "italic" : undefined,
        fontWeight: style.bold ? 700 : 400,
        justifyContent: style.align === "right" ? "flex-end" : style.align === "center" ? "center" : "flex-start",
        textDecoration: [style.underline && "underline", style.strike && "line-through"].filter(Boolean).join(" ") || undefined,
      }}
    >
      {text}
    </span>
  ), []);

  const gridRows = useMemo(() => {
    const headerRow = {
      rowId: "header",
      height: 28,
      cells: [
        {
          type: "header",
          text: "",
          nonEditable: true,
          className: "sheet-grid-corner",
          style: { background: SHEET_GRID_COLORS.header, color: SHEET_GRID_COLORS.textSecondary },
        },
        ...columns.map((column, index) => ({
          type: "header",
          text: filterEnabled && index < 4 ? `${column}  Filter` : column,
          nonEditable: true,
          className: "sheet-grid-header",
          style: {
            background: SHEET_GRID_COLORS.header,
            color: SHEET_GRID_COLORS.textSecondary,
          },
        })),
      ],
    };

    const dataRows = rows.map((row) => ({
      rowId: row,
      height: rowHeights[row - 1],
      resizable: true,
      cells: [
        {
          type: "header",
          text: String(row),
          nonEditable: true,
          className: "sheet-grid-row-header",
          style: {
            background: SHEET_GRID_COLORS.header,
            color: SHEET_GRID_COLORS.textSecondary,
          },
        },
        ...columns.map((column, colIndex) => {
          const col = colIndex + 1;
          const cellKey = keyOf(row, col);
          const style = { ...defaultStyle, ...(sheet.styles[cellKey] ?? {}) };
          const rawValue = sheet.cells[cellKey] ?? "";
          const evaluatedValue = rawValue.startsWith?.("=") ? evaluatedCell(row, col) : rawValue;
          const displayedValue = showFormulas && rawValue.startsWith?.("=") ? rawValue : formatDisplayValue(evaluatedValue, style);

          return {
            type: "text",
            text: String(rawValue),
            nonEditable: !isEditable,
            renderer: () => makeStyledRenderer(displayedValue, style),
            className: cn(
              "sheet-grid-data-cell",
              style.outlined && "sheet-grid-outlined-cell",
              referencedKeys?.has(cellKey) && "sheet-grid-ref-cell",
            ),
            style: {
              background: style.fillColor ?? undefined,
              color: style.textColor,
              border: style.outlined
                ? {
                    bottom: { color: SHEET_GRID_COLORS.borderStrong, style: "solid", width: "1px" },
                    left: { color: SHEET_GRID_COLORS.borderStrong, style: "solid", width: "1px" },
                    right: { color: SHEET_GRID_COLORS.borderStrong, style: "solid", width: "1px" },
                    top: { color: SHEET_GRID_COLORS.borderStrong, style: "solid", width: "1px" },
                  }
                : undefined,
            },
          };
        }),
      ],
    }));

    return [headerRow, ...dataRows];
  }, [evaluatedCell, filterEnabled, isEditable, makeStyledRenderer, referencedKeys, rowHeights, sheet, showFormulas]);

  // Radix's onContextMenu prop on ReactGrid returns [] to suppress ReactGrid's own
  // menu; the real menu is the Radix ContextMenu wrapping this grid in the parent.
  return (
    <div data-sheet-grid className="sheet-reactgrid min-h-0 flex-1 overflow-hidden bg-[#161616]">
      <ReactGrid
        columns={gridColumns}
        rows={gridRows}
        stickyTopRows={1}
        stickyLeftColumns={1}
        enableRangeSelection
        enableFillHandle={isEditable}
        enableColumnResizeOnAllHeaders
        minColumnWidth={minCellWidth}
        minRowHeight={minRowHeight}
        onCellsChanged={handleCellsChanged}
        onColumnResized={handleColumnResized}
        onRowResized={handleRowResized}
        onSelectionChanged={onSelectionChange}
        onContextMenu={() => []}
        moveRightOnEnter
      />
    </div>
  );
});
