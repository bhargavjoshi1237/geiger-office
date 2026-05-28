"use client";

import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import FormulaParser from "fast-formula-parser";
import { ReactGrid } from "@silevis/reactgrid";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarChart3,
  Bell,
  Bold,
  Calculator,
  ChevronDown,
  Copy,
  Download,
  FileSpreadsheet,
  Filter,
  Grid2X2,
  HelpCircle,
  Highlighter,
  Import,
  Italic,
  Menu,
  Minus,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Percent,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  Search,
  Share2,
  Star,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { IconButton, ToolbarDivider, ToolbarSelect, ToolbarToggle } from "@/components/document-editor/editor-controls";
import { FormattingColorPicker } from "@/components/document-editor/formatting/formatting-color-picker";
import { HIGHLIGHT_COLOR_OPTIONS, TEXT_COLOR_OPTIONS } from "@/components/document-editor/formatting/color-options";
import { cn } from "@/lib/utils";

const COLUMN_COUNT = 26;
const ROW_COUNT = 100;
const columns = Array.from({ length: COLUMN_COUNT }, (_, index) => String.fromCharCode(65 + index));
const rows = Array.from({ length: ROW_COUNT }, (_, index) => index + 1);
const defaultCellWidth = 112;
const defaultRowHeight = 28;
const minCellWidth = 64;
const minRowHeight = 24;
const SHEET_GRID_COLORS = {
  header: "#202020",
  range: "#242424",
  active: "#2a2a2a",
  text: "#ffffff",
  textSecondary: "#a3a3a3",
};
const defaultStyle = {
  align: "left",
  bold: false,
  fillColor: null,
  fontSize: 10,
  italic: false,
  numberFormat: "auto",
  outlined: false,
  strike: false,
  textColor: SHEET_GRID_COLORS.text,
  underline: false,
};
const activeCollaborators = [
  { name: "Maya Patel", initials: "MP", color: "bg-[#365d4f] text-[#d7f4e8]" },
  { name: "Noah Kim", initials: "NK", color: "bg-[#564a72] text-[#ece4ff]" },
  { name: "Ava Chen", initials: "AC", color: "bg-[#6a493c] text-[#ffe5d8]" },
];
const formulaTemplates = [
  { label: "SUM", value: "=SUM(B2:B4)" },
  { label: "AVERAGE", value: "=AVERAGE(B2:B4)" },
  { label: "MIN", value: "=MIN(B2:B4)" },
  { label: "MAX", value: "=MAX(B2:B4)" },
  { label: "COUNT", value: "=COUNT(B2:B4)" },
];
const seededCells = {
  "1:1": "Quarter",
  "1:2": "Revenue",
  "1:3": "Cost",
  "1:4": "Profit",
  "2:1": "Q1",
  "2:2": "125000",
  "2:3": "82000",
  "2:4": "=B2-C2",
  "3:1": "Q2",
  "3:2": "142500",
  "3:3": "91000",
  "3:4": "=B3-C3",
  "4:1": "Q3",
  "4:2": "157400",
  "4:3": "98250",
  "4:4": "=B4-C4",
  "5:1": "Total",
  "5:2": "=SUM(B2:B4)",
  "5:3": "=SUM(C2:C4)",
  "5:4": "=SUM(D2:D4)",
};
const seededStyles = {
  "1:1": { bold: true, fillColor: SHEET_GRID_COLORS.range },
  "1:2": { bold: true, fillColor: SHEET_GRID_COLORS.range, align: "right" },
  "1:3": { bold: true, fillColor: SHEET_GRID_COLORS.range, align: "right" },
  "1:4": { bold: true, fillColor: SHEET_GRID_COLORS.range, align: "right" },
  "5:1": { bold: true },
  "5:2": { bold: true, align: "right" },
  "5:3": { bold: true, align: "right" },
  "5:4": { bold: true, align: "right", fillColor: SHEET_GRID_COLORS.active },
};

function keyOf(row, col) {
  return `${row}:${col}`;
}

function labelOf({ row, col }) {
  return `${columns[col - 1]}${row}`;
}

function rangeLabelOf(range) {
  const normalized = normalizeRange(range);
  const startLabel = labelOf(normalized.start);
  const endLabel = labelOf(normalized.end);

  return startLabel === endLabel ? startLabel : `${startLabel}:${endLabel}`;
}

function normalizeRange(range) {
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

function forEachRangeCell(range, callback) {
  const normalized = normalizeRange(range);

  for (let row = normalized.start.row; row <= normalized.end.row; row += 1) {
    for (let col = normalized.start.col; col <= normalized.end.col; col += 1) {
      callback(row, col);
    }
  }
}

function rangeSize(range) {
  const normalized = normalizeRange(range);

  return {
    cols: normalized.end.col - normalized.start.col + 1,
    rows: normalized.end.row - normalized.start.row + 1,
  };
}

function sameCell(left, right) {
  return left.row === right.row && left.col === right.col;
}

function sameRange(left, right) {
  return sameCell(left.start, right.start) && sameCell(left.end, right.end);
}

function parseCellLabel(value) {
  const match = value.trim().toUpperCase().match(/^([A-Z])(\d{1,3})$/);

  if (!match) return null;

  const col = match[1].charCodeAt(0) - 64;
  const row = Number(match[2]);

  if (col < 1 || col > COLUMN_COUNT || row < 1 || row > ROW_COUNT) return null;

  return { row, col };
}

function createSheet(name = "Sheet1") {
  return {
    id: crypto.randomUUID(),
    name,
    cells: name === "Sheet1" ? seededCells : {},
    styles: name === "Sheet1" ? seededStyles : {},
  };
}

function coerceCellValue(value) {
  if (value === "" || value == null) return "";
  if (typeof value === "number") return value;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && String(value).trim() !== "" ? numericValue : value;
}

function formatDisplayValue(value, style) {
  if (value == null || value === "") return "";
  if (value instanceof Error) return "#ERROR";
  if (style.numberFormat === "currency" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(Number(value));
  }
  if (style.numberFormat === "percent" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: "percent" }).format(Number(value));
  }
  if (style.numberFormat === "number" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value));
  }

  return String(value);
}

function evaluateSheet(sheet) {
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

function SheetMenuBar({
  filterEnabled,
  showFormulas,
  onAddSheet,
  onClearFormatting,
  onExportWorkbook,
  onImportClick,
  onInsertFormula,
  onPrint,
  onRedo,
  onSortActiveColumn,
  onToggleChart,
  onToggleFilter,
  onToggleShowFormulas,
  onUndo,
}) {
  const menus = [
    {
      label: "File",
      items: [
        { label: "New sheet", action: onAddSheet },
        { label: "Import workbook", action: onImportClick },
        { label: "Download .xlsx", action: onExportWorkbook },
        { label: "Print", action: onPrint },
      ],
    },
    { label: "Edit", items: [{ label: "Undo", action: onUndo }, { label: "Redo", action: onRedo }] },
    { label: "View", items: [{ label: showFormulas ? "Hide formulas" : "Show formulas", action: onToggleShowFormulas }] },
    { label: "Insert", items: [{ label: "Sheet", action: onAddSheet }, { label: "Chart", action: onToggleChart }] },
    { label: "Format", items: [{ label: "Clear formatting", action: onClearFormatting }] },
    {
      label: "Data",
      items: [
        { label: filterEnabled ? "Remove filter" : "Create filter", action: onToggleFilter },
        { label: "Sort selected column A-Z", action: () => onSortActiveColumn("asc") },
        { label: "Sort selected column Z-A", action: () => onSortActiveColumn("desc") },
      ],
    },
    { label: "Tools", items: formulaTemplates.map((template) => ({ label: `Insert ${template.label}`, action: () => onInsertFormula(template.value) })) },
    { label: "Help", items: [{ label: "Keyboard shortcuts" }] },
  ];

  return (
    <nav className="hidden items-center gap-1 text-sm text-white md:flex">
      {menus.map((menu) => (
        <DropdownMenu key={menu.label}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 rounded px-1.5 text-sm font-normal text-white hover:bg-[#2a2a2a]">
              {menu.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {menu.items.map((item) => (
              <DropdownMenuItem key={item.label} onSelect={item.action}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}

function SheetHeader({ children, menuProps, onExportWorkbook }) {
  return (
    <header className="shrink-0 border-b border-[#333333] bg-[#202020] shadow-sm shadow-black/20">
      <div className="mt-2 flex h-14 items-center gap-3 px-4">
        <div className="mr-auto flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-semibold leading-7 text-white">Untitled spreadsheet</h1>
              <IconButton label="Star spreadsheet" className="h-7 w-7">
                <Star className="h-4 w-4" />
              </IconButton>
            </div>
            <SheetMenuBar {...menuProps} onExportWorkbook={onExportWorkbook} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden -space-x-2 lg:flex" aria-label="People editing this spreadsheet">
            {activeCollaborators.map((collaborator) => (
              <Avatar
                key={collaborator.name}
                className="h-8 w-8 border-2 border-[#202020] shadow-sm shadow-black/20"
                title={`${collaborator.name} is editing`}
              >
                <AvatarFallback className={`text-[10px] font-semibold ${collaborator.color}`}>
                  {collaborator.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <button
            type="button"
            className="group relative flex h-8 w-8 items-center justify-center rounded-md border border-[#333333] bg-[#242424] px-2 text-sm text-[#a3a3a3] shadow-sm transition-colors hover:border-[#474747] hover:bg-[#2a2a2a] hover:text-white sm:w-[240px] sm:justify-start sm:px-2.5"
          >
            <Search className="h-4 w-4 text-[#a3a3a3] transition-colors group-hover:text-white sm:mr-2" />
            <span className="hidden text-[#a3a3a3] transition-colors group-hover:text-white sm:inline-block">Search sheets...</span>
            <div className="absolute right-1.5 top-1.5 hidden items-center gap-1 sm:flex">
              <KbdGroup>
                <Kbd className="border border-[#333333] bg-[#202020] text-[#a3a3a3] transition-colors group-hover:bg-[#2a2a2a] group-hover:text-white">
                  Ctrl
                </Kbd>
                <Kbd className="border border-[#333333] bg-[#202020] text-[#a3a3a3] transition-colors group-hover:bg-[#2a2a2a] group-hover:text-white">
                  K
                </Kbd>
              </KbdGroup>
            </div>
          </button>
          <IconButton label="Download spreadsheet" className="hidden sm:inline-flex" onClick={onExportWorkbook}>
            <Download className="h-4 w-4" />
          </IconButton>
          <IconButton label="Share spreadsheet">
            <Share2 className="h-4 w-4" />
          </IconButton>
          <button
            type="button"
            className="hidden h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white sm:flex"
            aria-label="Help"
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#333333] bg-[#242424] text-[#a3a3a3] transition-colors hover:border-[#474747] hover:bg-[#2a2a2a] hover:text-white"
            aria-label="Profile"
          >
            <UserCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
      {children}
    </header>
  );
}

function ToolbarGroup({ children, className }) {
  return <div className={cn("flex shrink-0 items-center gap-1", className)}>{children}</div>;
}

function NumberFormatPicker({ value, onChange }) {
  const options = [
    { id: "auto", label: "Automatic" },
    { id: "number", label: "Number" },
    { id: "currency", label: "Currency" },
    { id: "percent", label: "Percent" },
  ];
  const active = options.find((option) => option.id === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarSelect className="w-28 justify-between">{active.label}</ToolbarSelect>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem key={option.id} onSelect={() => onChange(option.id)} className={cn(value === option.id && "bg-[#2a2a2a] text-white")}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FontSizePicker({ value, onChange }) {
  const sizes = [8, 9, 10, 11, 12, 14, 16, 18, 24, 36];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-11 shrink-0 rounded-md border-[#474747] bg-[#242424] px-0 text-sm font-normal text-white hover:bg-[#2a2a2a] focus-visible:ring-[#474747]"
        >
          {value}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-0 w-18 p-0.5" align="center">
        {sizes.map((size) => (
          <DropdownMenuItem key={size} onSelect={() => onChange(size)} className={cn("justify-center", value === size && "bg-[#2a2a2a] text-white")}>
            {size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SheetToolbar({
  activeStyle,
  chartOpen,
  canRedo,
  canUndo,
  filterEnabled,
  showFormulas,
  onClearFormatting,
  onExportWorkbook,
  onImportClick,
  onInsertFormula,
  onPrint,
  onRedo,
  onStyleChange,
  onToggleChart,
  onToggleFilter,
  onToggleShowFormulas,
  onUndo,
}) {
  const toggleStyle = (key) => onStyleChange({ [key]: !activeStyle[key] });

  return (
    <div className="mx-3 mb-2 mt-1 flex h-11 items-center gap-1 overflow-x-auto rounded-md px-3 scrollbar-subtle">
      <ToolbarGroup>
        <IconButton label="Undo" disabled={!canUndo} onClick={onUndo}>
          <Undo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Redo" disabled={!canRedo} onClick={onRedo}>
          <Redo2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Print" onClick={onPrint}>
          <Printer className="h-4 w-4" />
        </IconButton>
        <IconButton label="Import workbook" onClick={onImportClick}>
          <Import className="h-4 w-4" />
        </IconButton>
        <IconButton label="Download workbook" onClick={onExportWorkbook}>
          <Download className="h-4 w-4" />
        </IconButton>
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarGroup>
        <NumberFormatPicker value={activeStyle.numberFormat} onChange={(numberFormat) => onStyleChange({ numberFormat })} />
        <IconButton label="Percent format" onClick={() => onStyleChange({ numberFormat: "percent" })}>
          <Percent className="h-4 w-4" />
        </IconButton>
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarGroup>
        <IconButton label="Decrease font size" onClick={() => onStyleChange({ fontSize: Math.max(8, activeStyle.fontSize - 1) })}>
          <Minus className="h-4 w-4" />
        </IconButton>
        <FontSizePicker value={activeStyle.fontSize} onChange={(fontSize) => onStyleChange({ fontSize })} />
        <IconButton label="Increase font size" onClick={() => onStyleChange({ fontSize: Math.min(36, activeStyle.fontSize + 1) })}>
          <Plus className="h-4 w-4" />
        </IconButton>
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarGroup>
        <ToolbarToggle label="Bold" pressed={activeStyle.bold} onClick={() => toggleStyle("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarToggle>
        <ToolbarToggle label="Italic" pressed={activeStyle.italic} onClick={() => toggleStyle("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarToggle>
        <ToolbarToggle label="Underline" pressed={activeStyle.underline} onClick={() => toggleStyle("underline")}>
          <Underline className="h-4 w-4" />
        </ToolbarToggle>
        <ToolbarToggle label="Strikethrough" pressed={activeStyle.strike} onClick={() => toggleStyle("strike")}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarToggle>
        <FormattingColorPicker activeColor={activeStyle.textColor} icon={Palette} label="Text color" options={TEXT_COLOR_OPTIONS} onSelectColor={(textColor) => onStyleChange({ textColor: textColor ?? "#ffffff" })} />
        <FormattingColorPicker activeColor={activeStyle.fillColor} icon={Highlighter} label="Fill color" options={HIGHLIGHT_COLOR_OPTIONS} onSelectColor={(fillColor) => onStyleChange({ fillColor })} />
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarGroup>
        {[
          { id: "left", label: "Align left", Icon: AlignLeft },
          { id: "center", label: "Align center", Icon: AlignCenter },
          { id: "right", label: "Align right", Icon: AlignRight },
        ].map(({ id, label, Icon }) => (
          <ToolbarToggle key={id} label={label} pressed={activeStyle.align === id} onClick={() => onStyleChange({ align: id })}>
            <Icon className="h-4 w-4" />
          </ToolbarToggle>
        ))}
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarGroup>
        <IconButton label="Cell outline" onClick={() => toggleStyle("outlined")} className={activeStyle.outlined ? "bg-[#333333] text-white" : undefined}>
          <Grid2X2 className="h-4 w-4" />
        </IconButton>
        <IconButton label={filterEnabled ? "Remove filter" : "Create filter"} onClick={onToggleFilter} className={filterEnabled ? "bg-[#333333] text-white" : undefined}>
          <Filter className="h-4 w-4" />
        </IconButton>
        <IconButton label={chartOpen ? "Hide chart" : "Show chart"} onClick={onToggleChart} className={chartOpen ? "bg-[#333333] text-white" : undefined}>
          <BarChart3 className="h-4 w-4" />
        </IconButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton label="Functions">
              <Calculator className="h-4 w-4" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {formulaTemplates.map((template) => (
              <DropdownMenuItem key={template.label} onSelect={() => onInsertFormula(template.value)}>
                {template.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <IconButton label={showFormulas ? "Hide formulas" : "Show formulas"} onClick={onToggleShowFormulas} className={showFormulas ? "bg-[#333333] text-white" : undefined}>
          <FileSpreadsheet className="h-4 w-4" />
        </IconButton>
        <IconButton label="Clear formatting" onClick={onClearFormatting}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      </ToolbarGroup>
    </div>
  );
}

function FormulaBar({ activeCell, formulaValue, selectedRange, onFormulaChange, onFormulaCommit, onJumpToCell }) {
  const [nameDraft, setNameDraft] = useState(null);
  const nameValue = nameDraft ?? rangeLabelOf(selectedRange ?? { start: activeCell, end: activeCell });

  return (
    <div className="flex h-9 shrink-0 items-center border-b border-[#333333] bg-[#1a1a1a] text-sm text-[#a3a3a3]">
      <Input
        aria-label="Cell reference"
        value={nameValue}
        onChange={(event) => setNameDraft(event.target.value)}
        onFocus={() => setNameDraft(labelOf(activeCell))}
        onBlur={() => setNameDraft(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const parsed = parseCellLabel(nameValue);
            if (parsed) onJumpToCell(parsed);
            setNameDraft(null);
          }
        }}
        className="h-full w-24 shrink-0 rounded-none border-0 border-r border-[#333333] bg-[#1a1a1a] px-3 text-white focus-visible:ring-0"
      />
      <div className="grid h-full w-12 shrink-0 place-items-center border-r border-[#333333] text-[#a3a3a3]">
        fx
      </div>
      <Input
        aria-label="Formula"
        value={formulaValue}
        onChange={(event) => onFormulaChange(event.target.value)}
        onBlur={onFormulaCommit}
        onKeyDown={(event) => event.key === "Enter" && onFormulaCommit()}
        className="h-full min-w-0 rounded-none border-0 bg-[#1a1a1a] px-3 text-[#a3a3a3] focus-visible:ring-0"
      />
    </div>
  );
}

const SpreadsheetGrid = memo(function SpreadsheetGrid({
  columnWidths,
  evaluatedCell,
  filterEnabled,
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
            renderer: () => makeStyledRenderer(displayedValue, style),
            className: cn("sheet-grid-data-cell", style.outlined && "sheet-grid-outlined-cell"),
            style: {
              background: style.fillColor ?? undefined,
              color: style.textColor,
              border: style.outlined
                ? {
                    bottom: { color: SHEET_GRID_COLORS.text, style: "solid", width: "1px" },
                    left: { color: SHEET_GRID_COLORS.text, style: "solid", width: "1px" },
                    right: { color: SHEET_GRID_COLORS.text, style: "solid", width: "1px" },
                    top: { color: SHEET_GRID_COLORS.text, style: "solid", width: "1px" },
                  }
                : undefined,
            },
          };
        }),
      ],
    }));

    return [headerRow, ...dataRows];
  }, [evaluatedCell, filterEnabled, makeStyledRenderer, rowHeights, sheet, showFormulas]);

  return (
    <div data-sheet-grid className="sheet-reactgrid min-h-0 flex-1 overflow-hidden bg-[#161616]">
      <ReactGrid
        columns={gridColumns}
        rows={gridRows}
        stickyTopRows={1}
        stickyLeftColumns={1}
        enableRangeSelection
        enableColumnResizeOnAllHeaders
        minColumnWidth={minCellWidth}
        minRowHeight={minRowHeight}
        onCellsChanged={handleCellsChanged}
        onColumnResized={handleColumnResized}
        onRowResized={handleRowResized}
        onSelectionChanged={onSelectionChange}
        onContextMenu={(_, __, ___, menuOptions) => menuOptions}
        moveRightOnEnter
      />
    </div>
  );
});

function SheetTabs({ activeSheetId, sheets, onAddSheet, onDeleteSheet, onDuplicateSheet, onRenameSheet, onSelectSheet }) {
  return (
    <footer className="flex h-10 shrink-0 items-center border-t border-[#333333] bg-[#1a1a1a] text-sm text-[#a3a3a3]">
      <div className="flex h-full items-center gap-2 border-r border-[#333333] px-4">
        <IconButton label="Add sheet" className="h-7 w-7" onClick={onAddSheet}>
          <Plus className="h-4 w-4" />
        </IconButton>
        <IconButton label="All sheets" className="h-7 w-7">
          <Menu className="h-4 w-4" />
        </IconButton>
      </div>
      <div className="flex min-w-0 flex-1 items-center overflow-x-auto scrollbar-hidden">
        {sheets.map((sheet) => (
          <div key={sheet.id} className={cn("flex h-10 shrink-0 border-r border-[#333333]", activeSheetId === sheet.id && "bg-[#2a2a2a] text-white")}>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-none px-4 font-semibold text-[#a3a3a3] hover:bg-[#242424] hover:text-white"
              onClick={() => onSelectSheet(sheet.id)}
            >
              {sheet.name}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-10 w-8 rounded-none text-[#a3a3a3] hover:bg-[#242424] hover:text-white">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={() => onRenameSheet(sheet.id)}>Rename</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDuplicateSheet(sheet.id)}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDeleteSheet(sheet.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </footer>
  );
}

function InsightsRail({ activeCell, activeValue, chartOpen, filterEnabled, sheet }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { chartRows, filledCells, formulaCount } = useMemo(() => {
    const cellValues = Object.values(sheet.cells);
    const evaluateCell = evaluateSheet(sheet);

    return {
      chartRows: [2, 3, 4].map((row) => ({
        label: sheet.cells[keyOf(row, 1)] || `Row ${row}`,
        value: Number(evaluateCell(row, 4)) || 0,
      })),
      filledCells: cellValues.filter(Boolean).length,
      formulaCount: cellValues.filter((value) => typeof value === "string" && value.startsWith("=")).length,
    };
  }, [sheet]);
  const maxChartValue = Math.max(...chartRows.map((row) => row.value), 1);

  return (
    <aside className={cn("hidden shrink-0 border-l border-[#333333] bg-[#1a1a1a] transition-[width] duration-200 xl:block", isSidebarOpen ? "w-64" : "w-12")}>
      <Collapsible open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <div className={cn("border-b border-[#333333]", isSidebarOpen ? "p-4" : "p-2")}>
          <div className={cn("flex items-center", isSidebarOpen ? "justify-between gap-2" : "justify-center")}>
            {isSidebarOpen ? (
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
                <Table2 className="h-4 w-4 shrink-0" />
                <span className="truncate">Sheet summary</span>
              </div>
            ) : null}
            <button
              type="button"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#474747]"
              onClick={() => setIsSidebarOpen((value) => !value)}
              aria-label={isSidebarOpen ? "Collapse sheet sidebar" : "Expand sheet sidebar"}
              aria-expanded={isSidebarOpen}
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <CollapsibleContent>
          <div className="grid gap-4 p-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-normal text-[#737373]">Selected</p>
              <p className="mt-1 font-mono text-white">{labelOf(activeCell)}</p>
              <p className="mt-1 truncate text-[#a3a3a3]">{activeValue || "Blank cell"}</p>
            </div>
            <Separator className="bg-[#333333]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-[#333333] bg-[#202020] p-3">
                <p className="text-xs text-[#a3a3a3]">Cells</p>
                <p className="mt-1 text-lg font-semibold text-white">{filledCells}</p>
              </div>
              <div className="rounded-md border border-[#333333] bg-[#202020] p-3">
                <p className="text-xs text-[#a3a3a3]">Formulas</p>
                <p className="mt-1 text-lg font-semibold text-white">{formulaCount}</p>
              </div>
            </div>
            {chartOpen ? (
              <>
                <Separator className="bg-[#333333]" />
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-normal text-[#737373]">Profit chart</p>
                    {filterEnabled ? <Filter className="h-3.5 w-3.5 text-[#a3a3a3]" /> : null}
                  </div>
                  <div className="grid gap-2">
                    {chartRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[32px_1fr] items-center gap-2">
                        <span className="truncate text-xs text-[#a3a3a3]">{row.label}</span>
                        <div className="h-6 overflow-hidden rounded-sm border border-[#333333] bg-[#202020]">
                          <div className="h-full bg-[#4ade80]" style={{ width: `${Math.max(8, (row.value / maxChartValue) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>
      {!isSidebarOpen ? (
        <div className="grid gap-3 p-2 text-[#a3a3a3]">
          <div className="grid h-8 place-items-center rounded-md border border-[#333333] bg-[#202020] text-[10px] font-semibold text-white">
            {filledCells}
          </div>
          <div className="grid h-8 place-items-center rounded-md border border-[#333333] bg-[#202020]">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function SheetEditor() {
  const [sheets, setSheets] = useState([createSheet()]);
  const [activeSheetId, setActiveSheetId] = useState(() => sheets[0].id);
  const [activeCell, setActiveCell] = useState({ row: 1, col: 1 });
  const [chartOpen, setChartOpen] = useState(true);
  const [columnWidths, setColumnWidths] = useState(() => Array.from({ length: COLUMN_COUNT }, () => defaultCellWidth));
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [formulaValue, setFormulaValue] = useState(seededCells["1:1"]);
  const [history, setHistory] = useState([]);
  const [rowHeights, setRowHeights] = useState(() => Array.from({ length: ROW_COUNT }, () => defaultRowHeight));
  const [selectedRange, setSelectedRange] = useState({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
  const [future, setFuture] = useState([]);
  const [showFormulas, setShowFormulas] = useState(false);
  const importInputRef = useRef(null);
  const activeSheet = sheets.find((sheet) => sheet.id === activeSheetId) ?? sheets[0];
  const activeKey = keyOf(activeCell.row, activeCell.col);
  const activeStyle = { ...defaultStyle, ...(activeSheet.styles[activeKey] ?? {}) };
  const evaluatedCell = useMemo(() => evaluateSheet(activeSheet), [activeSheet]);
  const activeValue = activeSheet.cells[activeKey] ?? "";
  const sheetsRef = useRef(sheets);
  const activeSheetIdRef = useRef(activeSheetId);
  const activeSheetRef = useRef(activeSheet);
  const activeCellRef = useRef(activeCell);

  useEffect(() => {
    sheetsRef.current = sheets;
    activeSheetIdRef.current = activeSheetId;
    activeSheetRef.current = activeSheet;
    activeCellRef.current = activeCell;
  }, [activeCell, activeSheet, activeSheetId, sheets]);

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

    XLSX.writeFile(workbook, "geiger-spreadsheet.xlsx");
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

      return { id: crypto.randomUUID(), name, cells, styles: {} };
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

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <input ref={importInputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={importWorkbook} />
      <SheetHeader
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
          onToggleChart: () => setChartOpen((open) => !open),
          onToggleFilter: () => setFilterEnabled((enabled) => !enabled),
          onToggleShowFormulas: () => setShowFormulas((visible) => !visible),
          onUndo: undo,
        }}
        onExportWorkbook={exportWorkbook}
      >
        <SheetToolbar
          activeStyle={activeStyle}
          chartOpen={chartOpen}
          canRedo={future.length > 0}
          canUndo={history.length > 0}
          filterEnabled={filterEnabled}
          showFormulas={showFormulas}
          onClearFormatting={clearFormatting}
          onExportWorkbook={exportWorkbook}
          onImportClick={() => importInputRef.current?.click()}
          onInsertFormula={insertFormula}
          onPrint={() => window.print()}
          onRedo={redo}
          onStyleChange={updateStyle}
          onToggleChart={() => setChartOpen((open) => !open)}
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
          <SpreadsheetGrid
            columnWidths={columnWidths}
            evaluatedCell={evaluatedCell}
            filterEnabled={filterEnabled}
            rowHeights={rowHeights}
            sheet={activeSheet}
            showFormulas={showFormulas}
            onCellsCommit={commitGridCells}
            onColumnResize={resizeColumn}
            onRowResize={resizeRow}
            onSelectionChange={handleGridSelectionChange}
          />
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
        <InsightsRail activeCell={activeCell} activeValue={activeValue} chartOpen={chartOpen} filterEnabled={filterEnabled} sheet={activeSheet} />
      </div>
    </div>
  );
}

export { SheetEditor };
