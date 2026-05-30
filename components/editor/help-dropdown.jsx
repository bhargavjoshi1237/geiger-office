"use client";

import { useState } from "react";
import { HelpCircle, Info, Keyboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const COMMON_SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Search / command palette" },
  { keys: ["Ctrl", "Z"], label: "Undo" },
  { keys: ["Ctrl", "Y"], label: "Redo" },
  { keys: ["Ctrl", "C"], label: "Copy" },
  { keys: ["Ctrl", "V"], label: "Paste" },
];

/**
 * Help menu shared across editor headers. Pass `shortcuts` to extend the
 * keyboard-shortcuts dialog with editor-specific entries.
 */
export function HelpDropdown({ shortcuts = [], appName = "Office", triggerClassName }) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const allShortcuts = [...COMMON_SHORTCUTS, ...shortcuts];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Help"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white",
              triggerClassName,
            )}
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={() => setShowShortcuts(true)}>
            <Keyboard className="h-4 w-4 text-[#a3a3a3]" />
            Keyboard shortcuts
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowAbout(true)}>
            <Info className="h-4 w-4 text-[#a3a3a3]" />
            About {appName}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="w-[min(440px,calc(100vw-32px))]">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </DialogHeader>
          <ul className="flex flex-col gap-2">
            {allShortcuts.map((shortcut) => (
              <li
                key={shortcut.label}
                className="flex items-center justify-between gap-3 text-sm text-[#d4d4d4]"
              >
                <span>{shortcut.label}</span>
                <KbdGroup>
                  {shortcut.keys.map((key) => (
                    <Kbd key={key} className="border border-[#333333] bg-[#161616] text-[#a3a3a3]">
                      {key}
                    </Kbd>
                  ))}
                </KbdGroup>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{appName}</DialogTitle>
            <DialogDescription>
              A lightweight documents, spreadsheets, and slides suite by Geiger Studio.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
