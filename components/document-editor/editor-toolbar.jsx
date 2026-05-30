"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Edit2,
  Eye,
  Highlighter,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Link,
  List,
  ListChecks,
  ListOrdered,
  MessageSquareText,
  Minus,
  Palette,
  PaintRoller,
  Plus,
  Printer,
  Redo2,
  RemoveFormatting,
  Share2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { IconButton, ToolbarDivider, ToolbarSelect, ToolbarToggle } from "@/components/document-editor/editor-controls";
import { HIGHLIGHT_COLOR_OPTIONS, TEXT_COLOR_OPTIONS } from "@/components/document-editor/formatting/color-options";
import { CONTENT_OPTIONS } from "@/components/document-editor/formatting/content-options";
import { FONT_FAMILY_OPTIONS } from "@/components/document-editor/formatting/font-family-options";
import { FONT_SIZE_OPTIONS, clampFontSize } from "@/components/document-editor/formatting/font-size-options";
import { FormattingColorPicker } from "@/components/document-editor/formatting/formatting-color-picker";
import { ShareButton } from "@/components/share/share-button";
import { ImageDialog, LinkDialog } from "@/components/document-editor/formatting/insert-dialogs";
import { TEXT_EFFECTS } from "@/components/document-editor/formatting/text-effects";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_PRESETS, ZOOM_STEP, clampZoom } from "@/components/document-editor/zoom-options";
import { cn } from "@/lib/utils";

function ToolbarGroup({ children, className }) {
  return <div className={cn("flex shrink-0 items-center gap-1", className)}>{children}</div>;
}

function ZoomPicker({ zoom, onZoomChange }) {
  const applyZoom = (nextZoom) => onZoomChange(clampZoom(Number(nextZoom)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarSelect className="w-18 justify-between">{zoom}%</ToolbarSelect>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-0 w-28 p-2" align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
        <div className="flex items-stretch gap-2">
          <div className="grid flex-1 gap-1">
            {ZOOM_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset}
                onSelect={() => applyZoom(preset)}
                className={cn("justify-center px-2 py-1 text-sm", zoom === preset && "bg-[#2a2a2a] text-white")}
              >
                {preset}%
              </DropdownMenuItem>
            ))}
          </div>
          <div className="flex w-6 items-center justify-center border-l border-[#333333] pl-2">
            <input
              aria-label="Zoom slider"
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(event) => applyZoom(event.target.value)}
              className="zoom-slider h-28"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HistoryToolbarGroup({ canRedo, canUndo, isPaintFormatActive, zoom, onPaintFormat, onPrint, onRedo, onUndo, onZoomChange }) {
  return (
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
      <IconButton label="Paint format" onClick={onPaintFormat} className={isPaintFormatActive ? "bg-[#333333] text-white" : undefined}>
        <PaintRoller className="h-4 w-4" />
      </IconButton>
      <ZoomPicker zoom={zoom} onZoomChange={onZoomChange} />
    </ToolbarGroup>
  );
}

function ToolbarDropdownSelect({ activeId, disabled, options, triggerClassName, triggerLabel, onSelect }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <ToolbarSelect className={triggerClassName}>{triggerLabel}</ToolbarSelect>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40" align="start">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => onSelect(option.id)}
            className={cn("justify-between", activeId === option.id && "bg-[#2a2a2a] text-white")}
            style={option.value ? { fontFamily: option.value } : undefined}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TypeToolbarGroup({
  activeContentId,
  activeContentLabel,
  activeFontFamily,
  activeFontFamilyLabel,
  disabled,
  onContentTypeChange,
  onFontFamilyChange,
}) {
  return (
    <ToolbarGroup>
      <ToolbarDropdownSelect
        activeId={activeContentId}
        disabled={disabled}
        label="Content type"
        options={CONTENT_OPTIONS}
        triggerClassName="w-28 justify-between"
        triggerLabel={<span className="min-w-0 flex-1 truncate text-left">{activeContentLabel}</span>}
        onSelect={onContentTypeChange}
      />
      <ToolbarDropdownSelect
        activeId={FONT_FAMILY_OPTIONS.find((option) => option.value === activeFontFamily)?.id}
        disabled={disabled}
        label="Font family"
        options={FONT_FAMILY_OPTIONS}
        triggerClassName="w-28 justify-between"
        triggerLabel={<span className="min-w-0 flex-1 truncate text-left">{activeFontFamilyLabel}</span>}
        onSelect={onFontFamilyChange}
      />
    </ToolbarGroup>
  );
}

function FontSizePicker({ activeFontSize, disabled, onFontSizeChange }) {
  const [inputValue, setInputValue] = useState(String(activeFontSize));
  const [replaceOnNextDigit, setReplaceOnNextDigit] = useState(false);

  const applyFontSize = (size) => {
    const nextSize = clampFontSize(size);
    onFontSizeChange(nextSize);
    setInputValue(String(nextSize));
  };

  const updateInputValue = (value) => {
    const nextValue = value.replace(/\D/g, "").slice(0, 2);
    const parsedValue = Number.parseInt(nextValue, 10);

    setInputValue(nextValue);

    if (Number.isFinite(parsedValue)) {
      onFontSizeChange(clampFontSize(parsedValue));
    }
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          setInputValue(String(activeFontSize));
          setReplaceOnNextDigit(true);
        }
      }}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-11 shrink-0 rounded-md border-[#474747] bg-[#242424] px-0 text-sm font-normal text-white hover:bg-[#2a2a2a] focus-visible:ring-[#474747]"
        >
          {activeFontSize}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-0 w-18 p-0.5" align="center" onCloseAutoFocus={(event) => event.preventDefault()}>
        <div className="max-h-56 overflow-y-auto scrollbar-hidden">
          {FONT_SIZE_OPTIONS.map((size) => (
            <DropdownMenuItem
              key={size}
              onSelect={() => applyFontSize(size)}
              className={cn("justify-center px-1.5 py-1 text-sm", activeFontSize === size && "bg-[#2a2a2a] text-white")}
            >
              {size}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="mt-0.5 border-t border-[#333333] p-1">
          <Input
            aria-label="Font size value"
            inputMode="numeric"
            maxLength={2}
            value={inputValue}
            onChange={(event) => updateInputValue(event.target.value)}
            onClick={(event) => {
              event.currentTarget.select();
              setReplaceOnNextDigit(true);
            }}
            onFocus={(event) => {
              event.currentTarget.select();
              setReplaceOnNextDigit(true);
            }}
            onKeyDown={(event) => {
              if (/^\d$/.test(event.key) && replaceOnNextDigit) {
                event.preventDefault();
                updateInputValue(event.key);
                setReplaceOnNextDigit(false);
              }
            }}
            className="h-7 px-1 text-center"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FontSizeToolbarGroup({ activeFontSize, disabled, onDecreaseFontSize, onFontSizeChange, onIncreaseFontSize }) {
  return (
    <ToolbarGroup>
      <IconButton label="Decrease font size" disabled={disabled} onClick={onDecreaseFontSize}>
        <Minus className="h-4 w-4" />
      </IconButton>
      <FontSizePicker activeFontSize={activeFontSize} disabled={disabled} onFontSizeChange={onFontSizeChange} />
      <IconButton label="Increase font size" disabled={disabled} onClick={onIncreaseFontSize}>
        <Plus className="h-4 w-4" />
      </IconButton>
    </ToolbarGroup>
  );
}

function TextStyleToolbarGroup({
  activeEffects,
  activeHighlightColor,
  activeTextColor,
  disabled,
  onHighlightColorChange,
  onTextColorChange,
  onToggleEffect,
}) {
  return (
    <ToolbarGroup>
      {TEXT_EFFECTS.map(({ id, label, Icon }) => (
        <ToolbarToggle
          key={id}
          label={label}
          disabled={disabled}
          pressed={Boolean(activeEffects[id])}
          onClick={() => onToggleEffect(id)}
        >
          <Icon className="h-4 w-4" />
        </ToolbarToggle>
      ))}
      <FormattingColorPicker
        activeColor={activeTextColor}
        disabled={disabled}
        icon={Palette}
        label="Text color"
        options={TEXT_COLOR_OPTIONS}
        onSelectColor={onTextColorChange}
      />
      <FormattingColorPicker
        activeColor={activeHighlightColor}
        disabled={disabled}
        icon={Highlighter}
        label="Highlight color"
        options={HIGHLIGHT_COLOR_OPTIONS}
        onSelectColor={onHighlightColorChange}
      />
    </ToolbarGroup>
  );
}

function InsertToolbarGroup({ activeLinkUrl, disabled, onInsertImage, onSetLink }) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  return (
    <>
      <ToolbarGroup>
        <IconButton label="Insert link" disabled={disabled} onClick={() => setIsLinkDialogOpen(true)}>
          <Link className="h-4 w-4" />
        </IconButton>
        <IconButton label="Add comment (coming soon)" disabled>
          <MessageSquareText className="h-4 w-4" />
        </IconButton>
        <IconButton label="Insert image" disabled={disabled} onClick={() => setIsImageDialogOpen(true)}>
          <ImageIcon className="h-4 w-4" />
        </IconButton>
      </ToolbarGroup>
      <LinkDialog activeUrl={activeLinkUrl} open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen} onSubmit={onSetLink} />
      <ImageDialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen} onSubmit={onInsertImage} />
    </>
  );
}

const ALIGNMENT_OPTIONS = [
  { id: "left", label: "Align left", Icon: AlignLeft },
  { id: "center", label: "Align center", Icon: AlignCenter },
  { id: "right", label: "Align right", Icon: AlignRight },
  { id: "justify", label: "Justify", Icon: AlignJustify },
];

function AlignmentPicker({ activeAlignment, disabled, onAlignmentChange }) {
  const activeOption = ALIGNMENT_OPTIONS.find((option) => option.id === activeAlignment) ?? ALIGNMENT_OPTIONS[0];
  const ActiveIcon = activeOption.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <IconButton label={activeOption.label} disabled={disabled}>
          <ActiveIcon className="h-4 w-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-36" align="start">
        {ALIGNMENT_OPTIONS.map(({ id, label, Icon }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => onAlignmentChange(id)}
            className={cn(activeAlignment === id && "bg-[#2a2a2a] text-white")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ParagraphToolbarGroup({
  activeAlignment,
  disabled,
  isBulletListActive,
  isOrderedListActive,
  isTaskListActive,
  onAlignmentChange,
  onClearFormatting,
  onDecreaseIndent,
  onIncreaseIndent,
  onToggleBulletList,
  onToggleOrderedList,
  onToggleTaskList,
}) {
  return (
    <ToolbarGroup>
      <AlignmentPicker activeAlignment={activeAlignment} disabled={disabled} onAlignmentChange={onAlignmentChange} />
      <IconButton label="Checklist" disabled={disabled} onClick={onToggleTaskList} className={isTaskListActive ? "bg-[#333333] text-white" : undefined}>
        <ListChecks className="h-4 w-4" />
      </IconButton>
      <IconButton
        label="Bulleted list"
        disabled={disabled}
        onClick={onToggleBulletList}
        className={isBulletListActive ? "bg-[#333333] text-white" : undefined}
      >
        <List className="h-4 w-4" />
      </IconButton>
      <IconButton
        label="Numbered list"
        disabled={disabled}
        onClick={onToggleOrderedList}
        className={isOrderedListActive ? "bg-[#333333] text-white" : undefined}
      >
        <ListOrdered className="h-4 w-4" />
      </IconButton>
      <IconButton label="Decrease indent" disabled={disabled} onClick={onDecreaseIndent}>
        <IndentDecrease className="h-4 w-4" />
      </IconButton>
      <IconButton label="Increase indent" disabled={disabled} onClick={onIncreaseIndent}>
        <IndentIncrease className="h-4 w-4" />
      </IconButton>
      <IconButton label="Clear formatting" disabled={disabled} onClick={onClearFormatting}>
        <RemoveFormatting className="h-4 w-4" />
      </IconButton>
    </ToolbarGroup>
  );
}

function ModeToolbarGroup({ mode, onModeChange }) {
  const isEditing = mode === "edit";

  return (
    <ToolbarGroup>
      <div
        className="flex h-8 items-center gap-0.5 rounded-full border border-[#333333] bg-[#242424] px-1"
        role="group"
        aria-label="Document mode"
      >
        <button
          type="button"
          aria-pressed={mode === "view"}
          aria-label="View mode"
          title="View mode"
          onClick={() => onModeChange("view")}
          className={cn(
            "flex h-6 w-7 items-center justify-center rounded-full text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white",
            mode === "view" && "bg-[#333333] text-white",
          )}
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-pressed={isEditing}
          aria-label="Edit mode"
          title="Edit mode"
          onClick={() => onModeChange("edit")}
          className={cn(
            "flex h-6 w-7 items-center justify-center rounded-full text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white",
            isEditing && "bg-[#333333] text-white",
          )}
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>
    </ToolbarGroup>
  );
}

function RightToolbarGroup({ mode, shareFileId, shareName, onModeChange }) {
  return (
    <ToolbarGroup className="ml-auto flex gap-2">
      <ModeToolbarGroup mode={mode} onModeChange={onModeChange} />
      <ShareButton
        fileId={shareFileId}
        fileType="document"
        name={shareName}
        render={(openShare) => (
          <IconButton label="Share" onClick={openShare}>
            <Share2 className="h-4 w-4" />
          </IconButton>
        )}
      />
    </ToolbarGroup>
  );
}

function EditorToolbar({ formatting, mode, shareFileId, shareName, zoom, onModeChange, onZoomChange }) {
  const isEditing = mode === "edit";

  return (
    <div className="mx-3 mb-2 mt-1 flex h-11 items-center gap-1 overflow-x-auto rounded-md px-3 scrollbar-subtle">
      <HistoryToolbarGroup
        canRedo={formatting.canRedo}
        canUndo={formatting.canUndo}
        isPaintFormatActive={formatting.isPaintFormatActive}
        zoom={zoom}
        onPaintFormat={formatting.applyPaintFormat}
        onPrint={formatting.printDocument}
        onRedo={formatting.redo}
        onUndo={formatting.undo}
        onZoomChange={onZoomChange}
      />
      <ToolbarDivider />
      <TypeToolbarGroup
        activeContentId={formatting.activeContentId}
        activeContentLabel={formatting.activeContentLabel}
        activeFontFamily={formatting.activeFontFamily}
        activeFontFamilyLabel={formatting.activeFontFamilyLabel}
        disabled={!isEditing}
        onContentTypeChange={formatting.setContentType}
        onFontFamilyChange={formatting.setFontFamily}
      />
      <ToolbarDivider />
      <FontSizeToolbarGroup
        activeFontSize={formatting.activeFontSize}
        disabled={!isEditing}
        onDecreaseFontSize={formatting.decreaseFontSize}
        onFontSizeChange={formatting.setFontSize}
        onIncreaseFontSize={formatting.increaseFontSize}
      />
      <ToolbarDivider />
      <TextStyleToolbarGroup
        activeEffects={formatting.activeEffects}
        activeHighlightColor={formatting.activeHighlightColor}
        activeTextColor={formatting.activeTextColor}
        disabled={!isEditing}
        onHighlightColorChange={formatting.setHighlightColor}
        onTextColorChange={formatting.setTextColor}
        onToggleEffect={formatting.toggleTextEffect}
      />
      <ToolbarDivider />
      <InsertToolbarGroup
        activeLinkUrl={formatting.activeLinkUrl}
        disabled={!isEditing}
        onInsertImage={formatting.insertImage}
        onSetLink={formatting.setLink}
      />
      <ToolbarDivider />
      <ParagraphToolbarGroup
        activeAlignment={formatting.activeAlignment}
        disabled={!isEditing}
        isBulletListActive={formatting.isBulletListActive}
        isOrderedListActive={formatting.isOrderedListActive}
        isTaskListActive={formatting.isTaskListActive}
        onAlignmentChange={formatting.setTextAlignment}
        onClearFormatting={formatting.clearFormatting}
        onDecreaseIndent={formatting.decreaseIndent}
        onIncreaseIndent={formatting.increaseIndent}
        onToggleBulletList={formatting.toggleBulletList}
        onToggleOrderedList={formatting.toggleOrderedList}
        onToggleTaskList={formatting.toggleTaskList}
      />
      <RightToolbarGroup mode={mode} shareFileId={shareFileId} shareName={shareName} onModeChange={onModeChange} />
    </div>
  );
}

export {
  EditorToolbar,
  FontSizeToolbarGroup,
  HistoryToolbarGroup,
  InsertToolbarGroup,
  ModeToolbarGroup,
  ParagraphToolbarGroup,
  RightToolbarGroup,
  ShareDocumentButton,
  TextStyleToolbarGroup,
  ToolbarGroup,
  TypeToolbarGroup,
};
