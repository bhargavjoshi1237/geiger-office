"use client";

import { memo } from "react";
import {
  ArrowDownToLine,
  ArrowRightToLine,
  ClipboardPaste,
  Copy,
  Eraser,
  Filter,
  Link2,
  Scissors,
  ShieldCheck,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  SquareStack,
  StickyNote,
  Trash2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// The whole menu lives OUTSIDE the memoized SpreadsheetGrid: the grid is passed in
// as `children`, so selection-dependent menu state never re-renders the 2,600-cell
// grid. Radix also lazy-mounts ContextMenuContent only while the menu is open, so the
// long list of items costs nothing until the user actually right-clicks.
const SheetCellContextMenu = memo(function SheetCellContextMenu({
  children,
  colCount = 1,
  hasNote = false,
  isEditable = true,
  filterEnabled = false,
  rowCount = 1,
  selectionLabel = "",
  onClearContents,
  onClearFormatting,
  onClearNotes,
  onConditionalFormatting,
  onCopy,
  onCut,
  onDataValidation,
  onDefineNamedRange,
  onDeleteColumns,
  onDeleteRows,
  onGetCellLink,
  onInsertColLeft,
  onInsertColRight,
  onInsertLink,
  onInsertNote,
  onInsertRowAbove,
  onInsertRowBelow,
  onPaste,
  onPasteFormat,
  onPasteTransposed,
  onPasteValues,
  onProtectRange,
  onSortAsc,
  onSortDesc,
  onToggleFilter,
}) {
  const rowWord = rowCount > 1 ? `${rowCount} rows` : "row";
  const colWord = colCount > 1 ? `${colCount} columns` : "column";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-60">
        <ContextMenuItem disabled={!isEditable} onSelect={onCut}>
          <Scissors className="h-4 w-4" />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onCopy}>
          <Copy className="h-4 w-4" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onPaste}>
          <ClipboardPaste className="h-4 w-4" />
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset disabled={!isEditable}>
            Paste special
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            <ContextMenuItem onSelect={onPasteValues}>
              Paste values only
              <ContextMenuShortcut>Ctrl+Shift+V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={onPasteFormat}>Paste format only</ContextMenuItem>
            <ContextMenuItem onSelect={onPasteTransposed}>Paste transposed</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem disabled={!isEditable} onSelect={onInsertRowAbove}>
          Insert {rowCount > 1 ? `${rowCount} rows` : "1 row"} above
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onInsertRowBelow}>
          Insert {rowCount > 1 ? `${rowCount} rows` : "1 row"} below
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onInsertColLeft}>
          Insert {colCount > 1 ? `${colCount} columns` : "1 column"} left
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onInsertColRight}>
          Insert {colCount > 1 ? `${colCount} columns` : "1 column"} right
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem disabled={!isEditable} onSelect={onDeleteRows}>
          <ArrowDownToLine className="h-4 w-4" />
          Delete {rowWord}
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onDeleteColumns}>
          <ArrowRightToLine className="h-4 w-4" />
          Delete {colWord}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset disabled={!isEditable}>
            Clear
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            <ContextMenuItem onSelect={onClearContents}>
              Clear contents
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onSelect={onClearFormatting}>
              Clear formatting
              <ContextMenuShortcut>Ctrl+\</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled={!hasNote} onSelect={onClearNotes}>
              Clear notes
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={onSortAsc}>
          <SortAsc className="h-4 w-4" />
          Sort sheet A → Z
        </ContextMenuItem>
        <ContextMenuItem onSelect={onSortDesc}>
          <SortDesc className="h-4 w-4" />
          Sort sheet Z → A
        </ContextMenuItem>
        <ContextMenuItem onSelect={onToggleFilter}>
          <Filter className="h-4 w-4" />
          {filterEnabled ? "Remove filter" : "Create a filter"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem disabled={!isEditable} onSelect={onInsertLink}>
          <Link2 className="h-4 w-4" />
          Insert link
          <ContextMenuShortcut>Ctrl+K</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onInsertNote}>
          <StickyNote className="h-4 w-4" />
          {hasNote ? "Edit note" : "Insert note"}
        </ContextMenuItem>
        <ContextMenuItem disabled={!isEditable} onSelect={onDefineNamedRange}>
          <SquareStack className="h-4 w-4" />
          Define named range
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger inset>View more cell actions</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-60">
            <ContextMenuLabel className="font-mono">{selectionLabel}</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem disabled={!isEditable} onSelect={onConditionalFormatting}>
              <SlidersHorizontal className="h-4 w-4" />
              Conditional formatting
            </ContextMenuItem>
            <ContextMenuItem disabled={!isEditable} onSelect={onDataValidation}>
              <ShieldCheck className="h-4 w-4" />
              Data validation
            </ContextMenuItem>
            <ContextMenuItem disabled={!isEditable} onSelect={onProtectRange}>
              <Eraser className="h-4 w-4" />
              Protect range
            </ContextMenuItem>
            <ContextMenuItem onSelect={onGetCellLink}>
              <Link2 className="h-4 w-4" />
              Get link to this cell
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
});

export { SheetCellContextMenu };
