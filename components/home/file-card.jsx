"use client";

import Link from "next/link";
import {
  Copy,
  MoreVertical,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { editorHref, getFileType, timeAgo } from "@/lib/files/file-meta";
import { cn } from "@/lib/utils";

export function FileCard({
  file,
  onRename,
  onDuplicate,
  onToggleStar,
  onTrash,
  onRestore,
  onDelete,
}) {
  const meta = getFileType(file.type);
  const Icon = meta.icon;
  const href = editorHref(file);
  const inTrash = file.trashed;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] transition-colors hover:border-[#474747]">
      <Link
        href={href}
        className="flex h-28 items-center justify-center border-b border-[#2a2a2a] bg-[#202020]"
        aria-label={`Open ${file.name}`}
      >
        <Icon className="h-9 w-9" style={{ color: meta.accent }} strokeWidth={1.5} />
      </Link>

      <div className="flex items-start gap-2 p-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.accent }} />
        <div className="min-w-0 flex-1">
          <Link href={href} className="block">
            <h3 className="truncate text-sm font-medium text-[#e7e7e7] hover:text-white">
              {file.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-[11px] text-[#737373]">
            {meta.label} · {timeAgo(file.updated_at || file.created_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleStar(file)}
          className={cn(
            "rounded-md p-1 text-[#737373] transition-colors hover:bg-[#2a2a2a] hover:text-white",
            file.starred && "text-amber-400 hover:text-amber-300",
            !file.starred && "opacity-0 group-hover:opacity-100 focus:opacity-100",
          )}
          aria-label={file.starred ? "Unstar" : "Star"}
        >
          <Star className="h-4 w-4" fill={file.starred ? "currentColor" : "none"} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1 text-[#737373] opacity-0 transition-colors hover:bg-[#2a2a2a] hover:text-white focus:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!inTrash && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={href}>Open</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onRename(file)}>
                  <Pencil className="h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDuplicate(file)}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onToggleStar(file)}>
                  <Star className="h-4 w-4" />
                  {file.starred ? "Remove star" : "Add star"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onTrash(file)}>
                  <Trash2 className="h-4 w-4" />
                  Move to trash
                </DropdownMenuItem>
              </>
            )}
            {inTrash && (
              <>
                <DropdownMenuItem onSelect={() => onRestore(file)}>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(file)}>
                  <Trash2 className="h-4 w-4" />
                  Delete forever
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
