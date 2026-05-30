"use client";

import { memo } from "react";
import {
  ArrowUpToLine,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutTemplate,
  MessageSquare,
  Palette,
  Plus,
  Scissors,
  Sparkles,
  SquarePlus,
  Trash2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Self-contained so the thumbnail list never re-renders just because menu state
// changes. The menu content is lazy-mounted by Radix only while open. Each thumbnail
// gets its own instance bound to its slide id; right-clicking also activates the slide.
const SlideFilmstripContextMenu = memo(function SlideFilmstripContextMenu({
  children,
  canDelete = true,
  isFirst = false,
  isSkipped = false,
  layouts = [],
  onApplyLayout,
  onChangeBackground,
  onChangeTheme,
  onComment,
  onCopy,
  onCut,
  onCreateSlide,
  onDelete,
  onDuplicate,
  onMoveToBeginning,
  onNewSlide,
  onOpenForContext,
  onPaste,
  onSkip,
  onTemplates,
  onTransition,
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={onOpenForContext}>
        <div>{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onSelect={onCut}>
          <Scissors className="h-4 w-4" />
          Cut
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onCopy}>
          <Copy className="h-4 w-4" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onPaste}>
          Paste
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={onPaste}>
          Paste without formatting
          <ContextMenuShortcut>Ctrl+Shift+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" disabled={!canDelete} onSelect={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={onNewSlide}>
          <Plus className="h-4 w-4" />
          New slide
          <ContextMenuShortcut>Ctrl+M</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <SquarePlus className="h-4 w-4" />
            Create a slide
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            {layouts.map((layout) => (
              <ContextMenuItem key={layout.id} onSelect={() => onCreateSlide(layout.id)}>
                {layout.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem onSelect={onTemplates}>
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </ContextMenuItem>
        <ContextMenuItem onSelect={onDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate slide
        </ContextMenuItem>
        <ContextMenuItem onSelect={onSkip}>
          {isSkipped ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {isSkipped ? "Unskip slide" : "Skip slide"}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={onChangeBackground}>
          <ImageIcon className="h-4 w-4" />
          Change background
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <LayoutTemplate className="h-4 w-4" />
            Apply layout
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            {layouts.map((layout) => (
              <ContextMenuItem key={layout.id} onSelect={() => onApplyLayout(layout.id)}>
                {layout.label}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem onSelect={onChangeTheme}>
          <Palette className="h-4 w-4" />
          Change theme
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={onTransition}>
          <Sparkles className="h-4 w-4" />
          Transition
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem disabled={isFirst} onSelect={onMoveToBeginning}>
          <ArrowUpToLine className="h-4 w-4" />
          Move slide to beginning
          <ContextMenuShortcut>Ctrl+Shift+↑</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={onComment}>
          <MessageSquare className="h-4 w-4" />
          Comment
          <ContextMenuShortcut>Ctrl+Alt+M</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

export { SlideFilmstripContextMenu };
