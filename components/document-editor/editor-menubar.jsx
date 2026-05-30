"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EXPORT_OPTIONS, exportDocument } from "@/components/document-editor/exports/document-export";

const editorMenus = [
  {
    label: "File",
    groups: [
      [
        { label: "New", shortcut: "Ctrl+Alt+N" },
        { label: "Open", shortcut: "Ctrl+O" },
        { label: "Make a copy" },
      ],
      [
        { label: "Share", hasSubmenu: true },
        { label: "Email", hasSubmenu: true },
        { label: "Download", type: "download" },
      ],
      [
        { label: "Rename" },
        { label: "Move" },
        { label: "Add shortcut to Drive" },
        { label: "Move to trash" },
      ],
      [
        { label: "Version history", hasSubmenu: true },
        { label: "Make available offline" },
      ],
      [
        { label: "Details" },
        { label: "Security limitations" },
        { label: "Language", hasSubmenu: true },
        { label: "Page setup" },
      ],
      [
        { label: "Print", shortcut: "Ctrl+P" },
      ],
    ],
  },
  {
    label: "Edit",
    groups: [
      [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Y" },
      ],
      [
        { label: "Cut", shortcut: "Ctrl+X" },
        { label: "Copy", shortcut: "Ctrl+C" },
        { label: "Paste", shortcut: "Ctrl+V" },
        { label: "Paste without formatting", shortcut: "Ctrl+Shift+V" },
      ],
      [
        { label: "Select all", shortcut: "Ctrl+A" },
        { label: "Find and replace", shortcut: "Ctrl+H" },
      ],
    ],
  },
  {
    label: "View",
    groups: [
      [
        { label: "Editing mode" },
        { label: "Suggesting mode" },
        { label: "Viewing mode" },
      ],
      [
        { label: "Print layout" },
        { label: "Show ruler" },
        { label: "Show outline" },
        { label: "Show comments" },
      ],
      [
        { label: "Full screen" },
      ],
    ],
  },
  {
    label: "Insert",
    groups: [
      [
        { label: "Image" },
        { label: "Table" },
        { label: "Drawing" },
        { label: "Chart" },
      ],
      [
        { label: "Horizontal line" },
        { label: "Page break" },
        { label: "Special characters" },
        { label: "Emoji" },
      ],
      [
        { label: "Link", shortcut: "Ctrl+K" },
        { label: "Comment", shortcut: "Ctrl+Alt+M" },
        { label: "Footnote", shortcut: "Ctrl+Alt+F" },
      ],
      [
        { label: "Headers & footers" },
        { label: "Page numbers" },
        { label: "Table of contents" },
      ],
    ],
  },
  {
    label: "Format",
    groups: [
      [
        { label: "Bold", shortcut: "Ctrl+B" },
        { label: "Italic", shortcut: "Ctrl+I" },
        { label: "Underline", shortcut: "Ctrl+U" },
      ],
      [
        { label: "Text" },
        { label: "Paragraph styles" },
        { label: "Align and indent" },
      ],
      [
        { label: "Line spacing" },
        { label: "Bullets & numbering" },
        { label: "Columns" },
      ],
      [
        { label: "Clear formatting", shortcut: "Ctrl+\\" },
      ],
    ],
  },
  {
    label: "Tools",
    groups: [
      [
        { label: "Spelling and grammar" },
        { label: "Word count", shortcut: "Ctrl+Shift+C" },
      ],
      [
        { label: "Voice typing", shortcut: "Ctrl+Shift+S" },
        { label: "Citations" },
        { label: "Dictionary", shortcut: "Ctrl+Shift+Y" },
      ],
      [
        { label: "Compare documents" },
        { label: "Review suggested edits" },
      ],
      [
        { label: "Preferences" },
        { label: "Accessibility" },
      ],
    ],
  },
  {
    label: "Gemini",
    groups: [
      [
        { label: "Help me write" },
        { label: "Summarize this document" },
        { label: "Create image" },
      ],
    ],
  },
  {
    label: "Extensions",
    groups: [
      [
        { label: "Add-ons" },
        { label: "Apps Script" },
      ],
    ],
  },
  {
    label: "Help",
    groups: [
      [
        { label: "Docs help" },
        { label: "Training" },
        { label: "Keyboard shortcuts", shortcut: "Ctrl+/" },
      ],
    ],
  },
];

function DownloadSubmenu({ editor }) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span>Download</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-56">
        {EXPORT_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.id} onSelect={() => exportDocument(editor, option.id)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

// Menu items whose label maps to a real editor command. Everything else renders as a
// labelled (inert) entry so the menus mirror Google Docs without dead-clicks crashing.
const EDITOR_ACTIONS = {
  Undo: (editor) => editor?.chain().focus().undo().run(),
  Redo: (editor) => editor?.chain().focus().redo().run(),
  "Select all": (editor) => editor?.chain().focus().selectAll().run(),
  Bold: (editor) => editor?.chain().focus().toggleBold().run(),
  Italic: (editor) => editor?.chain().focus().toggleItalic().run(),
  Underline: (editor) => editor?.chain().focus().toggleUnderline().run(),
  "Clear formatting": (editor) => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
  "Horizontal line": (editor) => editor?.chain().focus().setHorizontalRule().run(),
  Link: (editor) => {
    const url = window.prompt("Link URL", "https://");
    if (url?.trim()) editor?.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  },
  "Full screen": () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  },
  Print: () => window.print(),
};

function MenuItem({ editor, item, fileActions }) {
  if (item.type === "download") {
    return <DownloadSubmenu editor={editor} />;
  }

  if (item.hasSubmenu) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <span>{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem disabled>Coming soon</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  const editorAction = EDITOR_ACTIONS[item.label];
  const fileAction = fileActions?.[item.label];
  const onSelect = editorAction ? () => editorAction(editor) : fileAction ? () => fileAction() : undefined;

  return (
    <DropdownMenuItem disabled={!onSelect} onSelect={onSelect}>
      <span>{item.label}</span>
      {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
    </DropdownMenuItem>
  );
}

function EditorMenuBar({ editor, fileActions }) {
  return (
    <nav className="hidden items-center gap-1 text-sm text-white md:flex" aria-label="Document menu">
      {editorMenus.map((menu) => (
        <DropdownMenu key={menu.label}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 rounded px-2 py-2 text-sm font-normal text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white focus-visible:ring-[#474747] data-[state=open]:bg-[#2a2a2a] data-[state=open]:text-white"
            >
              {menu.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {menu.groups.map((group, groupIndex) => (
              <div key={`${menu.label}-${groupIndex}`}>
                {groupIndex > 0 && <DropdownMenuSeparator />}
                {group.map((item) => (
                  <MenuItem key={item.label} editor={editor} item={item} fileActions={fileActions} />
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}

export { EditorMenuBar };
