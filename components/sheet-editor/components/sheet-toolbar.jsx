"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Calculator,
  Download,
  FileSpreadsheet,
  Filter,
  Grid2X2,
  Highlighter,
  Import,
  Italic,
  Minus,
  Palette,
  Percent,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  Strikethrough,
  Underline,
  Undo2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton, ToolbarDivider, ToolbarSelect, ToolbarToggle } from "@/components/document-editor/editor-controls";
import { ModeToolbarGroup } from "@/components/document-editor/editor-toolbar";
import { FormattingColorPicker } from "@/components/document-editor/formatting/formatting-color-picker";
import { HIGHLIGHT_COLOR_OPTIONS, TEXT_COLOR_OPTIONS } from "@/components/document-editor/formatting/color-options";
import { ShareButton } from "@/components/share/share-button";
import { formulaTemplates } from "@/components/sheet-editor/constants";
import { cn } from "@/lib/utils";

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

export function SheetToolbar({
  activeStyle,
  canRedo,
  canUndo,
  fileId,
  filterEnabled,
  mode,
  name,
  showFormulas,
  onClearFormatting,
  onExportWorkbook,
  onImportClick,
  onInsertFormula,
  onModeChange,
  onPrint,
  onRedo,
  onStyleChange,
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
      <ToolbarGroup className="ml-auto gap-2">
        <ModeToolbarGroup mode={mode} onModeChange={onModeChange} />
        <ShareButton
          fileId={fileId}
          fileType="spreadsheet"
          name={name}
          render={(openShare) => (
            <IconButton label="Share" onClick={openShare}>
              <UserPlus className="h-4 w-4" />
            </IconButton>
          )}
        />
      </ToolbarGroup>
    </div>
  );
}
