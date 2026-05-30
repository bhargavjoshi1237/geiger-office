"use client";

import { ChevronDown, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/document-editor/editor-controls";
import { cn } from "@/lib/utils";

export function SheetTabs({ activeSheetId, sheets, onAddSheet, onDeleteSheet, onDuplicateSheet, onRenameSheet, onSelectSheet }) {
  return (
    <footer className="flex h-10 shrink-0 items-center border-t border-[#333333] bg-[#1a1a1a] text-sm text-[#a3a3a3]">
      <div className="flex h-full items-center gap-2 border-r border-[#333333] px-4">
        <IconButton label="Add sheet" className="h-7 w-7" onClick={onAddSheet}>
          <Plus className="h-4 w-4" />
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
