"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formulaTemplates } from "@/components/sheet-editor/constants";

export function SheetMenuBar({
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
  onToggleFilter,
  onToggleShowFormulas,
  onUndo,
  onCut,
  onCopy,
  onPaste,
  onPasteSpecial,
  onFindReplace,
  onDeleteValues,
  onDeleteRow,
  onDeleteColumn,
  onInsertRowAbove,
  onInsertColumnLeft,
  onInsertLink,
  onInsertNote,
  onNamedRanges,
  onSortRange,
  onFullScreen,
  onMakeCopy,
  onRenameFile,
  onMoveToTrash,
}) {
  const menus = [
    {
      label: "File",
      groups: [
        [
          { label: "New", action: onAddSheet, shortcut: "Ctrl+Alt+N" },
          { label: "Open", shortcut: "Ctrl+O" },
          { label: "Make a copy", action: onMakeCopy },
        ],
        [
          { label: "Import", action: onImportClick },
          { label: "Download (.xlsx)", action: onExportWorkbook },
          { label: "Email" },
          { label: "Share" },
        ],
        [
          { label: "Rename", action: onRenameFile },
          { label: "Move" },
          { label: "Add shortcut to Drive" },
          { label: "Move to trash", action: onMoveToTrash },
        ],
        [
          { label: "Version history" },
          { label: "Make available offline" },
          { label: "Details" },
          { label: "Settings" },
        ],
        [{ label: "Print", action: onPrint, shortcut: "Ctrl+P" }],
      ],
    },
    {
      label: "Edit",
      groups: [
        [
          { label: "Undo", action: onUndo, shortcut: "Ctrl+Z" },
          { label: "Redo", action: onRedo, shortcut: "Ctrl+Y" },
        ],
        [
          { label: "Cut", action: onCut, shortcut: "Ctrl+X" },
          { label: "Copy", action: onCopy, shortcut: "Ctrl+C" },
          { label: "Paste", action: onPaste, shortcut: "Ctrl+V" },
          { label: "Paste special", action: onPasteSpecial, shortcut: "Ctrl+Shift+V" },
        ],
        [
          { label: "Find and replace", action: onFindReplace, shortcut: "Ctrl+H" },
        ],
        [
          { label: "Delete values", action: onDeleteValues, shortcut: "Del" },
          { label: "Delete row", action: onDeleteRow },
          { label: "Delete column", action: onDeleteColumn },
        ],
      ],
    },
    {
      label: "View",
      groups: [
        [{ label: showFormulas ? "Hide formulas" : "Show formulas", action: onToggleShowFormulas }],
        [
          { label: "Freeze" },
          { label: "Group" },
          { label: "Gridlines" },
          { label: "Protected ranges" },
        ],
        [
          { label: "Zoom" },
          { label: "Full screen", action: onFullScreen },
        ],
      ],
    },
    {
      label: "Insert",
      groups: [
        [
          { label: "Sheet", action: onAddSheet, shortcut: "Shift+F11" },
          { label: "Rows above", action: onInsertRowAbove },
          { label: "Columns left", action: onInsertColumnLeft },
          { label: "Cells" },
        ],
        [
          { label: "Chart" },
          { label: "Pivot table" },
          { label: "Image" },
          { label: "Drawing" },
        ],
        [
          { label: "Function" },
          { label: "Link", action: onInsertLink, shortcut: "Ctrl+K" },
          { label: "Checkbox" },
          { label: "Dropdown" },
        ],
        [
          { label: "Comment", action: onInsertNote, shortcut: "Ctrl+Alt+M" },
          { label: "Note", action: onInsertNote },
        ],
      ],
    },
    {
      label: "Format",
      groups: [
        [
          { label: "Theme" },
          { label: "Number" },
          { label: "Text" },
        ],
        [
          { label: "Alignment" },
          { label: "Wrapping" },
          { label: "Rotation" },
          { label: "Merge cells" },
        ],
        [
          { label: "Conditional formatting" },
          { label: "Alternating colors" },
        ],
        [{ label: "Clear formatting", action: onClearFormatting, shortcut: "Ctrl+\\" }],
      ],
    },
    {
      label: "Data",
      groups: [
        [
          { label: filterEnabled ? "Remove filter" : "Create a filter", action: onToggleFilter },
          { label: "Filter views" },
          { label: "Add a slicer" },
        ],
        [
          { label: "Sort sheet A → Z", action: () => onSortActiveColumn("asc") },
          { label: "Sort sheet Z → A", action: () => onSortActiveColumn("desc") },
          { label: "Sort range", action: onSortRange },
        ],
        [
          { label: "Named ranges", action: onNamedRanges },
          { label: "Protected sheets and ranges" },
        ],
        [
          { label: "Data validation" },
          { label: "Data cleanup" },
          { label: "Split text to columns" },
        ],
      ],
    },
    {
      label: "Tools",
      groups: [
        [
          { label: "Create a form" },
          { label: "Spelling" },
        ],
        formulaTemplates.map((template) => ({ label: `Insert ${template.label}`, action: () => onInsertFormula(template.value) })),
        [
          { label: "Accessibility" },
          { label: "Notification settings" },
        ],
      ],
    },
    {
      label: "Extensions",
      groups: [[{ label: "Add-ons" }, { label: "Macros" }, { label: "Apps Script" }]],
    },
    {
      label: "Help",
      groups: [
        [
          { label: "Search the menus" },
          { label: "Sheets help" },
          { label: "Function list" },
          { label: "Keyboard shortcuts", shortcut: "Ctrl+/" },
        ],
      ],
    },
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
          <DropdownMenuContent align="start" className="min-w-52">
            {menu.groups.map((group, groupIndex) => (
              <div key={`${menu.label}-${groupIndex}`}>
                {groupIndex > 0 && <DropdownMenuSeparator />}
                {group.map((item) => (
                  <DropdownMenuItem key={item.label} disabled={!item.action} onSelect={item.action}>
                    {item.label}
                    {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}
