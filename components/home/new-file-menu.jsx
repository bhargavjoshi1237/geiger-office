"use client";

import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILE_TYPE_LIST } from "@/lib/files/file-meta";

export function NewFileMenu({ onCreate, creating }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={creating}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5] disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {FILE_TYPE_LIST.map(({ type, newLabel, icon: Icon, accent }) => (
          <DropdownMenuItem key={type} onSelect={() => onCreate(type)}>
            <Icon className="h-4 w-4" style={{ color: accent }} />
            {newLabel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
