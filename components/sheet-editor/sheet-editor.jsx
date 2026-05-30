"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { SheetCellContextMenu } from "@/components/sheet-editor/sheet-cell-context-menu";
import { useOfficeFile } from "@/lib/persistence/use-office-file";
import {
  COLUMN_COUNT,
  ROW_COUNT,
  columns,
  defaultCellWidth,
  defaultRowHeight,
  defaultStyle,
  rows,
} from "@/components/sheet-editor/constants";
import { keyOf, labelOf, sameCell, sameRange } from "@/components/sheet-editor/utils/cell-utils";
import {
  forEachRangeCell,
  normalizeRange,
  rangeLabelOf,
} from "@/components/sheet-editor/utils/range-utils";
import { referencedCellKeys } from "@/components/sheet-editor/utils/formula-utils";
import { createSheet, shiftSheet } from "@/components/sheet-editor/utils/sheet-utils";
import { coerceCellValue } from "@/components/sheet-editor/utils/format-utils";
import { evaluateSheet } from "@/components/sheet-editor/engine/evaluate-sheet";
import { SheetToolbar } from "@/components/sheet-editor/components/sheet-toolbar";
import { FormulaBar } from "@/components/sheet-editor/components/formula-bar";
import { SpreadsheetGrid } from "@/components/sheet-editor/components/spreadsheet-grid";
import { SheetTabs } from "@/components/sheet-editor/components/sheet-tabs";
import { SheetSidebar } from "@/components/sheet-editor/components/sheet-sidebar";
import { SheetHeader } from "@/components/sheet-editor/components/sheet-header";
import { SheetEditorSkeleton } from "@/components/sheet-editor/components/sheet-editor-skeleton";
import { FindReplaceDialog } from "@/components/sheet-editor/components/find-replace-dialog";

function apiBase() {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function SheetEditor({ fileId }) {
  const router = useRouter();
  const { file, initialContent, isLoading, status, canEdit, role, starred, toggleStar, saveContent, rename } = useOfficeFile(fileId);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [workbookName, setWorkbookName] = useState("Untitled Spreadsheet");
  const [sheets, setSheets] = useState([createSheet()]);
  const [activeSheetId, setActiveSheetId] = useState(() => sheets[0].id);
  const [activeCell, setActiveCell] = useState({ row: 1, col: 1 });
  const [mode, setMode] = useState("edit");
  const [columnWidths, setColumnWidths] = useState(() => Array.from({ length: COLUMN_COUNT }, () => defaultCellWidth));
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [formulaValue, setFormulaValue] = useState("");
  const [history, setHistory] = useState([]);
  const [rowHeights, setRowHeights] = useState(() => Array.from({ length: ROW_COUNT }, () => defaultRowHeight));
  const [selectedRange, setSelectedRange] = useState({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
  const [future, setFuture] = useState([]);
  const [showFormulas, setShowFormulas] = useState(false);
  const importInputRef = useRef(null);
  const hydratedRef = useRef(false);
  const lastSavedJsonRef = useRef(null);

  useEffect(() => {
    if (isLoading || hydratedRef.current) return;
    const saved = initialContent;
    if (saved && Array.isArray(saved.sheets) && saved.sheets.length > 0) {
      const cw = Array.isArray(saved.columnWidths)
        ? saved.columnWidths
        : Array.from({ length: COLUMN_COUNT }, () => defaultCellWidth);
      const rh = Array.isArray(saved.rowHeights)
        ? saved.rowHeights
        : Array.from({ length: ROW_COUNT }, () => defaultRowHeight);
      setSheets(saved.sheets);
      setActiveSheetId(saved.sheets[0].id);
      setActiveCell({ row: 1, col: 1 });
      setSelectedRange({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
      setFormulaValue(saved.sheets[0].cells?.["1:1"] ?? "");
      setColumnWidths(cw);
      setRowHeights(rh);
      lastSavedJsonRef.current = JSON.stringify({ sheets: saved.sheets, columnWidths: cw, rowHeights: rh });
    } else {
      lastSavedJsonRef.current = null;
    }
    if (file?.name) setWorkbookName(file.name);
    hydratedRef.current = true;
  }, [isLoading, initialContent, file]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const json = JSON.stringify({ sheets, columnWidths, rowHeights });
    if (json === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = json;
    saveContent({ sheets, columnWidths, rowHeights });
  }, [sheets, columnWidths, rowHeights, saveContent]);

  const handleRename = useCallback(
    (nextName) => {
      setWorkbookName(nextName);
      rename(nextName);
    },
    [rename],
  );
  const activeSheet = sheets.find((sheet) => sheet.id === activeSheetId) ?? sheets[0];
  const activeKey = keyOf(activeCell.row, activeCell.col);
  const activeStyle = { ...defaultStyle, ...(activeSheet.styles[activeKey] ?? {}) };
  const evaluatedCell = useMemo(() => evaluateSheet(activeSheet), [activeSheet]);
  const isEditable = mode === "edit" && canEdit !== false;
  const selectionBounds = normalizeRange(selectedRange);
  const selectionRowCount = selectionBounds.end.row - selectionBounds.start.row + 1;
  const selectionColCount = selectionBounds.end.col - selectionBounds.start.col + 1;
  const deferredFormulaValue = useDeferredValue(formulaValue);
  const referencedKeys = useMemo(() => referencedCellKeys(deferredFormulaValue), [deferredFormulaValue]);
  const sheetsRef = useRef(sheets);
  const activeSheetIdRef = useRef(activeSheetId);
  const activeSheetRef = useRef(activeSheet);
  const activeCellRef = useRef(activeCell);
  const selectedRangeRef = useRef(selectedRange);

  useEffect(() => {
    sheetsRef.current = sheets;
    activeSheetIdRef.current = activeSheetId;
    activeSheetRef.current = activeSheet;
    activeCellRef.current = activeCell;
    selectedRangeRef.current = selectedRange;
  }, [activeCell, activeSheet, activeSheetId, selectedRange, sheets]);

  const pushSnapshot = useCallback(() => {
    setHistory((current) => [...current.slice(-24), sheetsRef.current]);
    setFuture([]);
  }, []);

  const updateActiveSheet = useCallback((updater) => {
    setSheets((currentSheets) => currentSheets.map((sheet) => (sheet.id === activeSheetIdRef.current ? updater(sheet) : sheet)));
  }, []);

  const selectCell = useCallback((cell) => {
    setActiveCell((current) => (sameCell(current, cell) ? current : cell));
    setSelectedRange((current) => {
      const nextRange = { start: cell, end: cell };
      return sameRange(current, nextRange) ? current : nextRange;
    });
    const nextValue = activeSheetRef.current.cells[keyOf(cell.row, cell.col)] ?? "";
    setFormulaValue((current) => (current === nextValue ? current : nextValue));
  }, []);

  const commitCellValue = (value, cell = activeCell) => {
    if ((activeSheet.cells[keyOf(cell.row, cell.col)] ?? "") === value) {
      setFormulaValue(value);
      return;
    }

    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextCells = { ...sheet.cells };
      const cellKey = keyOf(cell.row, cell.col);

      if (value === "") delete nextCells[cellKey];
      else nextCells[cellKey] = value;

      return { ...sheet, cells: nextCells };
    });
    setFormulaValue(value);
  };

  const commitGridCells = useCallback((changes) => {
    if (!changes.length) return;
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextCells = { ...sheet.cells };

      changes.forEach(({ row, col, value }) => {
        const cellKey = keyOf(row, col);
        if (value === "") delete nextCells[cellKey];
        else nextCells[cellKey] = value;
      });

      return { ...sheet, cells: nextCells };
    });

    const active = activeCellRef.current;
    const activeChange = changes.find((change) => change.row === active.row && change.col === active.col);
    if (activeChange) setFormulaValue(activeChange.value);
  }, [pushSnapshot, updateActiveSheet]);

  const updateStyle = (patch) => {
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextStyles = { ...sheet.styles };

      forEachRangeCell(selectedRange, (row, col) => {
        const cellKey = keyOf(row, col);
        nextStyles[cellKey] = { ...(nextStyles[cellKey] ?? {}), ...patch };
      });

      return { ...sheet, styles: nextStyles };
    });
  };

  const clearFormatting = () => {
    let hasFormatting = false;
    forEachRangeCell(selectedRange, (row, col) => {
      if (activeSheet.styles[keyOf(row, col)]) hasFormatting = true;
    });
    if (!hasFormatting) return;
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextStyles = { ...sheet.styles };
      forEachRangeCell(selectedRange, (row, col) => delete nextStyles[keyOf(row, col)]);

      return { ...sheet, styles: nextStyles };
    });
  };

  const insertFormula = (formula) => {
    commitCellValue(formula);
  };

  const selectRange = useCallback((range) => {
    const normalized = normalizeRange(range);
    setSelectedRange(normalized);
    setActiveCell(normalized.start);
    setFormulaValue(activeSheetRef.current.cells[keyOf(normalized.start.row, normalized.start.col)] ?? "");
  }, []);

  const setCellNote = useCallback((cellKey, value) => {
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextNotes = { ...(sheet.notes ?? {}) };
      if (value.trim()) nextNotes[cellKey] = value;
      else delete nextNotes[cellKey];

      return { ...sheet, notes: nextNotes };
    });
  }, [pushSnapshot, updateActiveSheet]);

  const addNamedRange = useCallback((name, range) => {
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const existing = (sheet.names ?? []).filter((entry) => entry.name !== name);
      return { ...sheet, names: [...existing, { id: crypto.randomUUID(), name, range: normalizeRange(range) }] };
    });
  }, [pushSnapshot, updateActiveSheet]);

  const deleteNamedRange = useCallback((id) => {
    pushSnapshot();
    updateActiveSheet((sheet) => ({ ...sheet, names: (sheet.names ?? []).filter((entry) => entry.id !== id) }));
  }, [pushSnapshot, updateActiveSheet]);

  const transformRange = useCallback((mutate) => {
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextCells = { ...sheet.cells };
      mutate(nextCells);
      return { ...sheet, cells: nextCells };
    });
  }, [pushSnapshot, updateActiveSheet]);

  const clipboardRef = useRef(null);

  const copySelection = useCallback(() => {
    const { start, end } = normalizeRange(selectedRangeRef.current);
    const evaluate = evaluateSheet(activeSheetRef.current);
    const lines = [];
    const buffer = [];
    for (let row = start.row; row <= end.row; row += 1) {
      const cols = [];
      const bufferRow = [];
      for (let col = start.col; col <= end.col; col += 1) {
        const cellKey = keyOf(row, col);
        const raw = activeSheetRef.current.cells[cellKey] ?? "";
        const value = typeof raw === "string" && raw.startsWith("=") ? evaluate(row, col) : raw;
        cols.push(value == null ? "" : String(value));
        bufferRow.push({ value: value == null ? "" : value, style: activeSheetRef.current.styles[cellKey] ?? null });
      }
      lines.push(cols.join("\t"));
      buffer.push(bufferRow);
    }
    clipboardRef.current = buffer;
    navigator.clipboard?.writeText(lines.join("\n"));
  }, []);

  // Paste from the in-app buffer captured on the last copy. "values" drops styles,
  // "format" applies only styles, "transpose" flips rows/columns with both.
  const pasteSpecial = useCallback((variant) => {
    const buffer = clipboardRef.current;
    if (!buffer?.length) return;
    const start = activeCellRef.current;
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextCells = { ...sheet.cells };
      const nextStyles = { ...sheet.styles };

      buffer.forEach((bufferRow, rowOffset) => {
        bufferRow.forEach((cell, colOffset) => {
          const row = variant === "transpose" ? start.row + colOffset : start.row + rowOffset;
          const col = variant === "transpose" ? start.col + rowOffset : start.col + colOffset;
          if (row > ROW_COUNT || col > COLUMN_COUNT) return;
          const cellKey = keyOf(row, col);

          if (variant !== "format") {
            const value = String(cell.value);
            if (value === "") delete nextCells[cellKey];
            else nextCells[cellKey] = value;
          }
          if (variant === "format" || variant === "transpose") {
            if (cell.style) nextStyles[cellKey] = { ...cell.style };
            else delete nextStyles[cellKey];
          }
        });
      });

      return { ...sheet, cells: nextCells, styles: nextStyles };
    });
  }, [pushSnapshot, updateActiveSheet]);

  const insertRows = useCallback((position) => {
    const { start, end } = normalizeRange(selectedRangeRef.current);
    const count = end.row - start.row + 1;
    const at = position === "below" ? end.row + 1 : start.row;
    pushSnapshot();
    updateActiveSheet((sheet) => shiftSheet(sheet, { axis: "row", at, delta: count }));
  }, [pushSnapshot, updateActiveSheet]);

  const deleteRows = useCallback(() => {
    const { start, end } = normalizeRange(selectedRangeRef.current);
    const count = end.row - start.row + 1;
    pushSnapshot();
    updateActiveSheet((sheet) => shiftSheet(sheet, { axis: "row", at: start.row, delta: -count }));
  }, [pushSnapshot, updateActiveSheet]);

  const insertColumns = useCallback((position) => {
    const { start, end } = normalizeRange(selectedRangeRef.current);
    const count = end.col - start.col + 1;
    const at = position === "right" ? end.col + 1 : start.col;
    pushSnapshot();
    updateActiveSheet((sheet) => shiftSheet(sheet, { axis: "col", at, delta: count }));
  }, [pushSnapshot, updateActiveSheet]);

  const deleteColumns = useCallback(() => {
    const { start, end } = normalizeRange(selectedRangeRef.current);
    const count = end.col - start.col + 1;
    pushSnapshot();
    updateActiveSheet((sheet) => shiftSheet(sheet, { axis: "col", at: start.col, delta: -count }));
  }, [pushSnapshot, updateActiveSheet]);

  const clearNotesSelection = useCallback(() => {
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextNotes = { ...(sheet.notes ?? {}) };
      forEachRangeCell(selectedRangeRef.current, (row, col) => delete nextNotes[keyOf(row, col)]);
      return { ...sheet, notes: nextNotes };
    });
  }, [pushSnapshot, updateActiveSheet]);

  const insertNotePrompt = useCallback(() => {
    const cell = activeCellRef.current;
    const cellKey = keyOf(cell.row, cell.col);
    const existing = activeSheetRef.current.notes?.[cellKey] ?? "";
    const next = window.prompt(`Note for ${labelOf(cell)}`, existing);
    if (next == null) return;
    setCellNote(cellKey, next);
  }, [setCellNote]);

  const defineNamedRangePrompt = useCallback(() => {
    const range = selectedRangeRef.current;
    const suggested = `Range_${rangeLabelOf(range).replace(":", "_")}`;
    const name = window.prompt("Name this range", suggested);
    if (!name?.trim()) return;
    addNamedRange(name.trim(), range);
  }, [addNamedRange]);

  const insertLinkPrompt = useCallback(() => {
    const url = window.prompt("Link URL", "https://");
    if (!url?.trim()) return;
    const label = window.prompt("Link text", url.trim());
    const cell = activeCellRef.current;
    const formula = `=HYPERLINK("${url.trim()}","${(label ?? url).trim()}")`;
    pushSnapshot();
    updateActiveSheet((sheet) => ({ ...sheet, cells: { ...sheet.cells, [keyOf(cell.row, cell.col)]: formula } }));
    setFormulaValue(formula);
  }, [pushSnapshot, updateActiveSheet]);

  const getCellLink = useCallback(() => {
    const link = `${window.location.href.split("#")[0]}#gid=${activeSheetIdRef.current}&range=${rangeLabelOf(selectedRangeRef.current)}`;
    navigator.clipboard?.writeText(link);
  }, []);

  const clearSelection = useCallback(() => {
    transformRange((cells) => forEachRangeCell(selectedRangeRef.current, (row, col) => delete cells[keyOf(row, col)]));
  }, [transformRange]);

  const cutSelection = useCallback(() => {
    copySelection();
    clearSelection();
  }, [copySelection, clearSelection]);

  const pasteSelection = useCallback(async () => {
    const text = await navigator.clipboard?.readText?.();
    if (!text) return;
    const start = activeCellRef.current;
    const grid = text.replace(/\r/g, "").split("\n");
    transformRange((cells) => {
      grid.forEach((line, rowOffset) => {
        line.split("\t").forEach((value, colOffset) => {
          const row = start.row + rowOffset;
          const col = start.col + colOffset;
          if (row > ROW_COUNT || col > COLUMN_COUNT) return;
          const cellKey = keyOf(row, col);
          if (value === "") delete cells[cellKey];
          else cells[cellKey] = value;
        });
      });
    });
  }, [transformRange]);

  const undo = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setFuture((current) => [sheets, ...current]);
    setHistory((current) => current.slice(0, -1));
    setSheets(previous);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((current) => [...current, sheets]);
    setFuture((current) => current.slice(1));
    setSheets(next);
  };

  const handleGridSelectionChange = useCallback((ranges) => {
    const range = ranges.at(-1);
    if (!range) return;

    const startRow = Math.max(1, Number(range.first.row.rowId));
    const endRow = Math.max(1, Number(range.last.row.rowId));
    const startCol = Math.max(1, columns.indexOf(String(range.first.column.columnId)) + 1);
    const endCol = Math.max(1, columns.indexOf(String(range.last.column.columnId)) + 1);
    const start = { row: Math.min(startRow, endRow), col: Math.min(startCol, endCol) };
    const end = { row: Math.max(startRow, endRow), col: Math.max(startCol, endCol) };

    if (!Number.isFinite(start.row) || !Number.isFinite(end.row) || start.col < 1 || end.col < 1) return;

    startTransition(() => {
      const nextRange = { start, end };
      setSelectedRange((current) => (sameRange(current, nextRange) ? current : nextRange));
      setActiveCell((current) => (sameCell(current, start) ? current : start));

      const nextValue = activeSheetRef.current.cells[keyOf(start.row, start.col)] ?? "";
      setFormulaValue((current) => (current === nextValue ? current : nextValue));
    });
  }, []);

  const resizeColumn = useCallback((col, width) => {
    setColumnWidths((current) => current.map((currentWidth, index) => (index === col - 1 ? width : currentWidth)));
  }, []);

  const resizeRow = useCallback((row, height) => {
    setRowHeights((current) => current.map((currentHeight, index) => (index === row - 1 ? height : currentHeight)));
  }, []);

  const addSheet = () => {
    pushSnapshot();
    const nextSheet = createSheet(`Sheet${sheets.length + 1}`);
    setSheets((current) => [...current, nextSheet]);
    setActiveSheetId(nextSheet.id);
    setActiveCell({ row: 1, col: 1 });
    setSelectedRange({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
    setFormulaValue("");
  };

  const deleteSheet = (sheetId) => {
    if (sheets.length === 1) return;
    pushSnapshot();
    const remainingSheets = sheets.filter((sheet) => sheet.id !== sheetId);
    setSheets(remainingSheets);

    if (sheetId === activeSheetId) {
      setActiveSheetId(remainingSheets[0].id);
      setActiveCell({ row: 1, col: 1 });
      setSelectedRange({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
      setFormulaValue(remainingSheets[0].cells["1:1"] ?? "");
    }
  };

  const duplicateSheet = (sheetId) => {
    const sourceSheet = sheets.find((sheet) => sheet.id === sheetId);
    if (!sourceSheet) return;
    pushSnapshot();
    const nextSheet = {
      ...sourceSheet,
      id: crypto.randomUUID(),
      name: `${sourceSheet.name} copy`,
      cells: { ...sourceSheet.cells },
      styles: { ...sourceSheet.styles },
      notes: { ...(sourceSheet.notes ?? {}) },
      names: (sourceSheet.names ?? []).map((entry) => ({ ...entry, id: crypto.randomUUID() })),
    };
    setSheets((current) => [...current, nextSheet]);
    setActiveSheetId(nextSheet.id);
    setActiveCell({ row: 1, col: 1 });
    setSelectedRange({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
    setFormulaValue(nextSheet.cells["1:1"] ?? "");
  };

  const renameSheet = (sheetId) => {
    const sheet = sheets.find((item) => item.id === sheetId);
    const nextName = window.prompt("Rename sheet", sheet?.name ?? "");
    if (!nextName?.trim()) return;
    pushSnapshot();
    setSheets((current) => current.map((item) => (item.id === sheetId ? { ...item, name: nextName.trim() } : item)));
  };

  const selectSheet = (sheetId) => {
    const nextSheet = sheets.find((sheet) => sheet.id === sheetId);
    setActiveSheetId(sheetId);
    setActiveCell({ row: 1, col: 1 });
    setSelectedRange({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
    setFormulaValue(nextSheet?.cells["1:1"] ?? "");
  };

  const exportWorkbook = () => {
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const data = rows.map((row) =>
        columns.map((_, colIndex) => {
          const rawValue = sheet.cells[keyOf(row, colIndex + 1)] ?? "";
          if (typeof rawValue === "string" && rawValue.startsWith("=")) return { f: rawValue.slice(1) };
          return coerceCellValue(rawValue);
        }),
      );
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(data), sheet.name);
    });

    const filename = workbookName.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "").replace(/\s+/g, "-").toLowerCase() || "geiger-spreadsheet";
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const sortActiveColumn = (direction) => {
    const usedRows = rows
      .slice(1)
      .filter((row) => activeSheet.cells[keyOf(row, 1)] !== "Total")
      .filter((row) => columns.some((_, colIndex) => activeSheet.cells[keyOf(row, colIndex + 1)]));
    if (usedRows.length < 2) return;
    const evaluateCell = evaluateSheet(activeSheet);
    const sortedRows = [...usedRows].sort((leftRow, rightRow) => {
      const leftValue = evaluateCell(leftRow, activeCell.col);
      const rightValue = evaluateCell(rightRow, activeCell.col);
      const leftNumeric = Number(leftValue);
      const rightNumeric = Number(rightValue);
      const comparison =
        Number.isFinite(leftNumeric) && Number.isFinite(rightNumeric)
          ? leftNumeric - rightNumeric
          : String(leftValue).localeCompare(String(rightValue));

      return direction === "desc" ? -comparison : comparison;
    });
    const remapFormula = (value, fromRow, toRow) =>
      typeof value === "string" && value.startsWith("=")
        ? value.replace(new RegExp(`([A-Z])${fromRow}\\b`, "g"), (_, column) => `${column}${toRow}`)
        : value;

    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextCells = { ...sheet.cells };
      const nextStyles = { ...sheet.styles };

      usedRows.forEach((row) => {
        columns.forEach((_, colIndex) => {
          delete nextCells[keyOf(row, colIndex + 1)];
          delete nextStyles[keyOf(row, colIndex + 1)];
        });
      });

      sortedRows.forEach((sourceRow, index) => {
        const targetRow = usedRows[index];
        columns.forEach((_, colIndex) => {
          const col = colIndex + 1;
          const sourceKey = keyOf(sourceRow, col);
          const targetKey = keyOf(targetRow, col);
          if (sheet.cells[sourceKey] !== undefined) nextCells[targetKey] = remapFormula(sheet.cells[sourceKey], sourceRow, targetRow);
          if (sheet.styles[sourceKey]) nextStyles[targetKey] = sheet.styles[sourceKey];
        });
      });

      return { ...sheet, cells: nextCells, styles: nextStyles };
    });
  };

  const importWorkbook = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const importedSheets = workbook.SheetNames.map((name) => {
      const worksheet = workbook.Sheets[name];
      const cells = {};
      const range = worksheet["!ref"] ? XLSX.utils.decode_range(worksheet["!ref"]) : null;

      if (range) {
        for (let rowIndex = range.s.r; rowIndex <= Math.min(range.e.r, ROW_COUNT - 1); rowIndex += 1) {
          for (let colIndex = range.s.c; colIndex <= Math.min(range.e.c, COLUMN_COUNT - 1); colIndex += 1) {
            const address = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            const cell = worksheet[address];
            if (!cell) continue;
            const value = cell.f ? `=${cell.f}` : cell.w ?? cell.v ?? "";
            if (value !== "") cells[keyOf(rowIndex + 1, colIndex + 1)] = String(value);
          }
        }
      }

      return { id: crypto.randomUUID(), name, cells, styles: {}, notes: {}, names: [] };
    });

    if (importedSheets.length) {
      pushSnapshot();
      setSheets(importedSheets);
      setActiveSheetId(importedSheets[0].id);
      setActiveCell({ row: 1, col: 1 });
      setSelectedRange({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
      setFormulaValue(importedSheets[0].cells["1:1"] ?? "");
    }

    event.target.value = "";
  };

  const replaceAll = ({ find, replace, matchCase }) => {
    if (!find) return 0;
    const pattern = new RegExp(escapeRegExp(find), matchCase ? "g" : "gi");
    const current = activeSheetRef.current.cells;
    const updates = {};
    let count = 0;
    Object.entries(current).forEach(([cellKey, value]) => {
      if (typeof value !== "string") return;
      const replaced = value.replace(pattern, replace);
      if (replaced !== value) {
        updates[cellKey] = replaced;
        count += 1;
      }
    });
    if (!count) return 0;
    pushSnapshot();
    updateActiveSheet((sheet) => {
      const nextCells = { ...sheet.cells };
      Object.entries(updates).forEach(([cellKey, replaced]) => {
        if (replaced === "") delete nextCells[cellKey];
        else nextCells[cellKey] = replaced;
      });
      return { ...sheet, cells: nextCells };
    });
    return count;
  };

  const makeCopy = async () => {
    try {
      const res = await fetch(apiBase(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "spreadsheet",
          name: `${workbookName} (copy)`,
          content: { sheets, columnWidths, rowHeights },
        }),
      });
      if (!res.ok) return;
      const created = await res.json();
      router.push(`/sheet/${created.id}`);
    } catch {
      /* best-effort; stay on the current file */
    }
  };

  const moveToTrash = async () => {
    try {
      await fetch(`${apiBase()}/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trashed: true }),
      });
      router.push("/home");
    } catch {
      /* best-effort */
    }
  };

  const renamePrompt = () => {
    const next = window.prompt("Rename spreadsheet", workbookName);
    if (next?.trim()) handleRename(next.trim());
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  };

  if (isLoading) {
    return <SheetEditorSkeleton />;
  }

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <input ref={importInputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={importWorkbook} />
      <FindReplaceDialog open={findReplaceOpen} onOpenChange={setFindReplaceOpen} onReplaceAll={replaceAll} />
      <SheetHeader
        name={workbookName}
        role={role}
        starred={starred}
        onToggleStar={toggleStar}
        menuProps={{
          filterEnabled,
          showFormulas,
          onAddSheet: addSheet,
          onClearFormatting: clearFormatting,
          onImportClick: () => importInputRef.current?.click(),
          onInsertFormula: insertFormula,
          onPrint: () => window.print(),
          onRedo: redo,
          onSortActiveColumn: sortActiveColumn,
          onToggleFilter: () => setFilterEnabled((enabled) => !enabled),
          onToggleShowFormulas: () => setShowFormulas((visible) => !visible),
          onUndo: undo,
          onCut: cutSelection,
          onCopy: copySelection,
          onPaste: pasteSelection,
          onPasteSpecial: () => pasteSpecial("values"),
          onFindReplace: () => setFindReplaceOpen(true),
          onDeleteValues: clearSelection,
          onDeleteRow: deleteRows,
          onDeleteColumn: deleteColumns,
          onInsertRowAbove: () => insertRows("above"),
          onInsertColumnLeft: () => insertColumns("left"),
          onInsertLink: insertLinkPrompt,
          onInsertNote: insertNotePrompt,
          onNamedRanges: defineNamedRangePrompt,
          onSortRange: () => sortActiveColumn("asc"),
          onFullScreen: toggleFullscreen,
          onMakeCopy: makeCopy,
          onRenameFile: renamePrompt,
          onMoveToTrash: moveToTrash,
        }}
        status={status}
        onExportWorkbook={exportWorkbook}
        onRename={handleRename}
      >
        <SheetToolbar
          activeStyle={activeStyle}
          canRedo={future.length > 0}
          canUndo={history.length > 0}
          fileId={fileId}
          filterEnabled={filterEnabled}
          mode={mode}
          name={workbookName}
          showFormulas={showFormulas}
          onClearFormatting={clearFormatting}
          onExportWorkbook={exportWorkbook}
          onImportClick={() => importInputRef.current?.click()}
          onInsertFormula={insertFormula}
          onModeChange={setMode}
          onPrint={() => window.print()}
          onRedo={redo}
          onStyleChange={updateStyle}
          onToggleFilter={() => setFilterEnabled((enabled) => !enabled)}
          onToggleShowFormulas={() => setShowFormulas((visible) => !visible)}
          onUndo={undo}
        />
      </SheetHeader>
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <FormulaBar
            activeCell={activeCell}
            formulaValue={formulaValue}
            selectedRange={selectedRange}
            onFormulaChange={setFormulaValue}
            onFormulaCommit={() => commitCellValue(formulaValue)}
            onJumpToCell={selectCell}
          />
          <SheetCellContextMenu
            colCount={selectionColCount}
            rowCount={selectionRowCount}
            hasNote={Boolean(activeSheet.notes?.[activeKey])}
            isEditable={isEditable}
            filterEnabled={filterEnabled}
            selectionLabel={rangeLabelOf(selectedRange)}
            onCut={cutSelection}
            onCopy={copySelection}
            onPaste={pasteSelection}
            onPasteValues={() => pasteSpecial("values")}
            onPasteFormat={() => pasteSpecial("format")}
            onPasteTransposed={() => pasteSpecial("transpose")}
            onInsertRowAbove={() => insertRows("above")}
            onInsertRowBelow={() => insertRows("below")}
            onInsertColLeft={() => insertColumns("left")}
            onInsertColRight={() => insertColumns("right")}
            onDeleteRows={deleteRows}
            onDeleteColumns={deleteColumns}
            onClearContents={clearSelection}
            onClearFormatting={clearFormatting}
            onClearNotes={clearNotesSelection}
            onSortAsc={() => sortActiveColumn("asc")}
            onSortDesc={() => sortActiveColumn("desc")}
            onToggleFilter={() => setFilterEnabled((enabled) => !enabled)}
            onInsertLink={insertLinkPrompt}
            onInsertNote={insertNotePrompt}
            onDefineNamedRange={defineNamedRangePrompt}
            onGetCellLink={getCellLink}
          >
            <SpreadsheetGrid
              columnWidths={columnWidths}
              evaluatedCell={evaluatedCell}
              filterEnabled={filterEnabled}
              isEditable={isEditable}
              referencedKeys={referencedKeys}
              rowHeights={rowHeights}
              sheet={activeSheet}
              showFormulas={showFormulas}
              onCellsCommit={commitGridCells}
              onColumnResize={resizeColumn}
              onRowResize={resizeRow}
              onSelectionChange={handleGridSelectionChange}
            />
          </SheetCellContextMenu>
          <SheetTabs
            activeSheetId={activeSheetId}
            sheets={sheets}
            onAddSheet={addSheet}
            onDeleteSheet={deleteSheet}
            onDuplicateSheet={duplicateSheet}
            onRenameSheet={renameSheet}
            onSelectSheet={selectSheet}
          />
        </main>
        <SheetSidebar
          activeCell={activeCell}
          selectedRange={selectedRange}
          sheet={activeSheet}
          onInsertFormula={insertFormula}
          onJumpToCell={selectCell}
          onSelectRange={selectRange}
          onSetNote={setCellNote}
          onAddNamedRange={addNamedRange}
          onDeleteNamedRange={deleteNamedRange}
          onTransformRange={transformRange}
        />
      </div>
    </div>
  );
}

export { SheetEditor };
