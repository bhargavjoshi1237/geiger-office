"use client";

import { useState } from "react";
import {
  ArrowDown,
  Bookmark,
  CaseLower,
  CaseUpper,
  Copy,
  Eraser,
  FunctionSquare,
  Hash,
  PanelRightClose,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Type,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { keyOf, keyToCell, labelOf } from "@/components/sheet-editor/utils/cell-utils";
import { forEachRangeCell, normalizeRange, rangeLabelOf } from "@/components/sheet-editor/utils/range-utils";
import { cn } from "@/lib/utils";

const SHEET_FUNCTIONS = [
  { name: "SUM", syntax: "SUM(range)", desc: "Add up a range of numbers", template: "=SUM({range})" },
  { name: "AVERAGE", syntax: "AVERAGE(range)", desc: "Mean of the numbers in a range", template: "=AVERAGE({range})" },
  { name: "COUNT", syntax: "COUNT(range)", desc: "Count cells containing numbers", template: "=COUNT({range})" },
  { name: "COUNTA", syntax: "COUNTA(range)", desc: "Count cells that are not empty", template: "=COUNTA({range})" },
  { name: "MIN", syntax: "MIN(range)", desc: "Smallest value in a range", template: "=MIN({range})" },
  { name: "MAX", syntax: "MAX(range)", desc: "Largest value in a range", template: "=MAX({range})" },
  { name: "IF", syntax: "IF(test, then, else)", desc: "Return a value based on a condition", template: '=IF({cell}>0, "yes", "no")' },
  { name: "SUMIF", syntax: "SUMIF(range, criteria)", desc: "Add cells that meet a condition", template: '=SUMIF({range}, ">0")' },
  { name: "COUNTIF", syntax: "COUNTIF(range, criteria)", desc: "Count cells that meet a condition", template: '=COUNTIF({range}, ">0")' },
  { name: "AVERAGEIF", syntax: "AVERAGEIF(range, criteria)", desc: "Average cells that meet a condition", template: '=AVERAGEIF({range}, ">0")' },
  { name: "ROUND", syntax: "ROUND(value, places)", desc: "Round to a number of decimals", template: "=ROUND({cell}, 2)" },
  { name: "VLOOKUP", syntax: "VLOOKUP(key, range, index)", desc: "Look up a value in the first column", template: "=VLOOKUP({cell}, {range}, 2, FALSE)" },
  { name: "INDEX", syntax: "INDEX(range, row, col)", desc: "Value at a position in a range", template: "=INDEX({range}, 1, 1)" },
  { name: "MATCH", syntax: "MATCH(key, range, type)", desc: "Position of a value in a range", template: "=MATCH({cell}, {range}, 0)" },
  { name: "CONCAT", syntax: "CONCAT(a, b, …)", desc: "Join text values together", template: '=CONCAT({cell}, " ")' },
  { name: "LEFT", syntax: "LEFT(text, count)", desc: "First characters of a text value", template: "=LEFT({cell}, 3)" },
  { name: "RIGHT", syntax: "RIGHT(text, count)", desc: "Last characters of a text value", template: "=RIGHT({cell}, 3)" },
  { name: "LEN", syntax: "LEN(text)", desc: "Number of characters in text", template: "=LEN({cell})" },
  { name: "TRIM", syntax: "TRIM(text)", desc: "Remove extra spaces from text", template: "=TRIM({cell})" },
  { name: "ROUNDUP", syntax: "ROUNDUP(value, places)", desc: "Always round up", template: "=ROUNDUP({cell}, 0)" },
  { name: "TODAY", syntax: "TODAY()", desc: "Insert today's date", template: "=TODAY()" },
];

function SidebarHeader({ title, icon: Icon, onClose }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#333333] px-3">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <button
        type="button"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#2a2a2a] hover:text-white"
        onClick={onClose}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
      >
        <PanelRightClose className="h-4 w-4" />
      </button>
    </div>
  );
}

function FunctionLibraryPanel({ activeCell, selectedRange, onInsertFormula }) {
  const [query, setQuery] = useState("");
  const rangeLabel = rangeLabelOf(selectedRange);
  const cellLabel = labelOf(activeCell);
  const build = (template) => template.replaceAll("{range}", rangeLabel).replaceAll("{cell}", cellLabel);
  const filtered = SHEET_FUNCTIONS.filter((fn) => {
    const term = query.trim().toLowerCase();
    return !term || fn.name.toLowerCase().includes(term) || fn.desc.toLowerCase().includes(term);
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-[#737373]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search functions…"
            className="h-9 border-[#333333] bg-[#202020] pl-8 text-white placeholder:text-[#737373]"
          />
        </div>
        <p className="mt-2 text-[11px] text-[#737373]">
          Inserts into <span className="font-mono text-[#a3a3a3]">{cellLabel}</span> using <span className="font-mono text-[#a3a3a3]">{rangeLabel}</span>
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-subtle">
        {filtered.map((fn) => (
          <button
            key={fn.name}
            type="button"
            onClick={() => onInsertFormula(build(fn.template))}
            className="group flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-[#242424]"
            title={`Insert ${fn.template}`}
          >
            <span className="font-mono text-sm font-semibold text-white">{fn.name}</span>
            <span className="font-mono text-[11px] text-[#737373]">{fn.syntax}</span>
            <span className="text-xs text-[#a3a3a3]">{fn.desc}</span>
          </button>
        ))}
        {filtered.length === 0 ? <p className="px-2 py-6 text-center text-xs text-[#737373]">No functions match “{query}”.</p> : null}
      </div>
    </div>
  );
}

function DataToolsPanel({ selectedRange, onTransformRange }) {
  const rangeLabel = rangeLabelOf(selectedRange);

  const trimWhitespace = (cells) =>
    forEachRangeCell(selectedRange, (row, col) => {
      const cellKey = keyOf(row, col);
      const value = cells[cellKey];
      if (typeof value !== "string" || value.startsWith("=")) return;
      const trimmed = value.trim().replace(/\s+/g, " ");
      if (trimmed === "") delete cells[cellKey];
      else cells[cellKey] = trimmed;
    });

  const changeCase = (transform) => (cells) =>
    forEachRangeCell(selectedRange, (row, col) => {
      const cellKey = keyOf(row, col);
      const value = cells[cellKey];
      if (typeof value === "string" && !value.startsWith("=")) cells[cellKey] = transform(value);
    });

  const toNumber = (cells) =>
    forEachRangeCell(selectedRange, (row, col) => {
      const cellKey = keyOf(row, col);
      const value = cells[cellKey];
      if (typeof value !== "string" || value.startsWith("=")) return;
      const cleaned = value.replace(/[$,%\s]/g, "");
      if (cleaned !== "" && Number.isFinite(Number(cleaned))) cells[cellKey] = cleaned;
    });

  const fillDown = (cells) => {
    const { start, end } = normalizeRange(selectedRange);
    for (let col = start.col; col <= end.col; col += 1) {
      let last = "";
      for (let row = start.row; row <= end.row; row += 1) {
        const cellKey = keyOf(row, col);
        const value = cells[cellKey];
        if (value == null || value === "") {
          if (last !== "") cells[cellKey] = last;
        } else {
          last = value;
        }
      }
    }
  };

  const removeDuplicates = (cells) => {
    const { start, end } = normalizeRange(selectedRange);
    const seen = new Set();
    const uniqueRows = [];
    for (let row = start.row; row <= end.row; row += 1) {
      const values = [];
      for (let col = start.col; col <= end.col; col += 1) values.push(cells[keyOf(row, col)] ?? "");
      const signature = JSON.stringify(values.map((value) => String(value).trim()));
      if (seen.has(signature)) continue;
      seen.add(signature);
      uniqueRows.push(values);
    }
    let writeRow = start.row;
    uniqueRows.forEach((values) => {
      values.forEach((value, index) => {
        const cellKey = keyOf(writeRow, start.col + index);
        if (value === "" || value == null) delete cells[cellKey];
        else cells[cellKey] = value;
      });
      writeRow += 1;
    });
    for (; writeRow <= end.row; writeRow += 1) {
      for (let col = start.col; col <= end.col; col += 1) delete cells[keyOf(writeRow, col)];
    }
  };

  const titleCase = (value) => value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  const tools = [
    { label: "Trim whitespace", desc: "Remove extra spaces", icon: Eraser, run: trimWhitespace },
    { label: "Remove duplicate rows", desc: "Keep first of each row", icon: Copy, run: removeDuplicates },
    { label: "Fill blanks down", desc: "Copy the value above", icon: ArrowDown, run: fillDown },
    { label: "Text → number", desc: "Strip $ , % and convert", icon: Hash, run: toNumber },
    { label: "UPPERCASE", desc: "Capitalize all letters", icon: CaseUpper, run: changeCase((value) => value.toUpperCase()) },
    { label: "lowercase", desc: "Lowercase all letters", icon: CaseLower, run: changeCase((value) => value.toLowerCase()) },
    { label: "Title Case", desc: "Capitalize each word", icon: Type, run: changeCase(titleCase) },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-3 py-3 text-[11px] text-[#737373]">
        Applies to <span className="font-mono text-[#a3a3a3]">{rangeLabel}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-subtle">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={() => onTransformRange(tool.run)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[#242424]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#333333] bg-[#202020] text-[#d4d4d4]">
              <tool.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-white">{tool.label}</span>
              <span className="block truncate text-xs text-[#737373]">{tool.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotesPanel({ activeCell, sheet, onSetNote, onJumpToCell }) {
  const activeKey = keyOf(activeCell.row, activeCell.col);
  const notes = sheet.notes ?? {};
  const [draft, setDraft] = useState(notes[activeKey] ?? "");
  const entries = Object.entries(notes);

  const commit = () => {
    if ((notes[activeKey] ?? "") !== draft) onSetNote(activeKey, draft);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 p-3">
        <p className="text-[11px] uppercase tracking-normal text-[#737373]">
          Note for <span className="font-mono text-[#a3a3a3]">{labelOf(activeCell)}</span>
        </p>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          placeholder="Add a note for this cell…"
          rows={3}
          className="w-full resize-none rounded-md border border-[#333333] bg-[#202020] p-2 text-sm text-white placeholder:text-[#737373] focus:border-[#474747] focus:outline-none"
        />
      </div>
      <div className="border-t border-[#333333] px-3 py-2 text-[11px] uppercase tracking-normal text-[#737373]">
        All notes ({entries.length})
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-subtle">
        {entries.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-[#737373]">No notes yet. Notes are saved with the file.</p>
        ) : (
          entries.map(([cellKey, text]) => (
            <div key={cellKey} className="group flex items-start gap-2 rounded-md px-2 py-2 hover:bg-[#242424]">
              <button type="button" onClick={() => onJumpToCell(keyToCell(cellKey))} className="min-w-0 flex-1 text-left">
                <span className="font-mono text-xs font-semibold text-[#8ab4f8]">{labelOf(keyToCell(cellKey))}</span>
                <span className="mt-0.5 block truncate text-xs text-[#a3a3a3]">{text}</span>
              </button>
              <button
                type="button"
                onClick={() => onSetNote(cellKey, "")}
                className="shrink-0 rounded p-1 text-[#737373] opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                aria-label={`Delete note for ${labelOf(keyToCell(cellKey))}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function NamedRangesPanel({ selectedRange, sheet, onAddNamedRange, onDeleteNamedRange, onSelectRange }) {
  const [name, setName] = useState("");
  const names = sheet.names ?? [];
  const rangeLabel = rangeLabelOf(selectedRange);

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddNamedRange(trimmed, selectedRange);
    setName("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            add();
          }}
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name this range"
            className="h-9 border-[#333333] bg-[#202020] text-white placeholder:text-[#737373]"
          />
          <Button type="submit" size="sm" className="h-9 shrink-0 px-3" disabled={!name.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[11px] text-[#737373]">
          Will point to <span className="font-mono text-[#a3a3a3]">{rangeLabel}</span>
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-subtle">
        {names.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-[#737373]">No named ranges yet.</p>
        ) : (
          names.map((entry) => (
            <div key={entry.id} className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#242424]">
              <button type="button" onClick={() => onSelectRange(entry.range)} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
                <span className="truncate text-sm text-white">{entry.name}</span>
                <span className="shrink-0 font-mono text-xs text-[#737373]">{rangeLabelOf(entry.range)}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteNamedRange(entry.id)}
                className="shrink-0 rounded p-1 text-[#737373] opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                aria-label={`Delete ${entry.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SheetSidebar({
  activeCell,
  selectedRange,
  sheet,
  onInsertFormula,
  onJumpToCell,
  onSelectRange,
  onSetNote,
  onAddNamedRange,
  onDeleteNamedRange,
  onTransformRange,
}) {
  const [openTool, setOpenTool] = useState(null);
  const tools = [
    { id: "functions", label: "Function library", icon: FunctionSquare },
    { id: "data", label: "Data tools", icon: Wand2 },
    { id: "notes", label: "Cell notes", icon: StickyNote },
    { id: "names", label: "Named ranges", icon: Bookmark },
  ];
  const active = tools.find((tool) => tool.id === openTool);
  const isOpen = Boolean(active);
  const noteCount = Object.keys(sheet.notes ?? {}).length;

  return (
    <aside className={cn("hidden shrink-0 border-l border-[#333333] bg-[#1a1a1a] xl:flex", isOpen ? "w-80" : "w-12")}>
      {active ? (
        <div className="flex min-w-0 flex-1 flex-col border-r border-[#333333]">
          <SidebarHeader title={active.label} icon={active.icon} onClose={() => setOpenTool(null)} />
          {openTool === "functions" ? <FunctionLibraryPanel activeCell={activeCell} selectedRange={selectedRange} onInsertFormula={onInsertFormula} /> : null}
          {openTool === "data" ? <DataToolsPanel selectedRange={selectedRange} onTransformRange={onTransformRange} /> : null}
          {openTool === "notes" ? <NotesPanel key={keyOf(activeCell.row, activeCell.col)} activeCell={activeCell} sheet={sheet} onSetNote={onSetNote} onJumpToCell={onJumpToCell} /> : null}
          {openTool === "names" ? <NamedRangesPanel selectedRange={selectedRange} sheet={sheet} onAddNamedRange={onAddNamedRange} onDeleteNamedRange={onDeleteNamedRange} onSelectRange={onSelectRange} /> : null}
        </div>
      ) : null}
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 py-2">
        {tools.map((tool) => {
          const isActive = tool.id === openTool;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setOpenTool(isActive ? null : tool.id)}
              className={cn(
                "relative grid h-9 w-9 place-items-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white",
                isActive && "bg-[#2a2a2a] text-white",
              )}
              aria-label={tool.label}
              aria-pressed={isActive}
              title={tool.label}
            >
              {isActive ? <span className="absolute right-0 top-1.5 h-6 w-0.5 rounded-full bg-white" /> : null}
              <tool.icon className="h-[18px] w-[18px]" />
              {tool.id === "notes" && noteCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#365d4f] px-1 text-[9px] font-semibold text-[#d7f4e8]">
                  {noteCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
