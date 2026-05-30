"use client";

import Link from "next/link";
import {
  Copy,
  MoreVertical,
  Pencil,
  RotateCcw,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL, editorHref, getFileType, timeAgo } from "@/lib/files/file-meta";
import { cn } from "@/lib/utils";

function TypeBadge({ type }) {
  const meta = getFileType(type);
  const Icon = meta.icon;
  return (
    <Badge className="gap-1.5 bg-[#1a1a1a] text-[#737373]">
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  );
}

export function FileTable({
  files,
  viewerId,
  onRename,
  onDuplicate,
  onToggleStar,
  onTrash,
  onRestore,
  onDelete,
  onShare,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <Table>
        <TableHeader className="bg-[#1a1a1a]">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Name</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Owner</TableHead>
            <TableHead className="hidden lg:table-cell">Modified</TableHead>
            <TableHead className="w-12 pr-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const meta = getFileType(file.type);
            const href = editorHref(file);
            const owned = file.user_id === viewerId;
            const inTrash = file.trashed;
            return (
              <TableRow key={file.id} className="group">
                <TableCell className="pl-5">
                  <Link href={href} className="flex min-w-0 items-center gap-3">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-[#ededed] group-hover:text-white">
                        {file.name}
                      </span>
                      <span className="text-xs text-[#737373] sm:hidden">
                        {meta.label} · {timeAgo(file.updated_at || file.created_at)}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <TypeBadge type={file.type} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {owned ? (
                    <span className="text-sm text-[#a3a3a3]">You</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-[#a3a3a3]">
                      Shared
                      <Badge className="bg-[#737373] text-[#737373]">{ROLE_LABEL[file._role] ?? "Viewer"}</Badge>
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-[#737373]">{timeAgo(file.updated_at || file.created_at)}</span>
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!inTrash ? (
                      <button
                        type="button"
                        onClick={() => onToggleStar(file)}
                        className={cn(
                          "rounded-md p-1.5 text-[#737373] transition-colors hover:bg-[#2a2a2a] hover:text-white",
                          file.starred && "text-amber-400 hover:text-amber-300",
                          !file.starred && !owned && "hidden",
                        )}
                        aria-label={file.starred ? "Unstar" : "Star"}
                        disabled={!owned}
                      >
                        <Star className="h-4 w-4" fill={file.starred ? "currentColor" : "none"} />
                      </button>
                    ) : null}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-[#737373] transition-colors hover:bg-[#2a2a2a] hover:text-white data-[state=open]:bg-[#2a2a2a] data-[state=open]:text-white"
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
                            <DropdownMenuItem onSelect={() => onShare(file)}>
                              <Share2 className="h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            {owned && (
                              <>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
