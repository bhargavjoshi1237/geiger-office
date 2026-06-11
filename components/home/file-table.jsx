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
    <span title={meta.label} className="flex justify-center">
      <Icon className="h-5 w-5 text-text-secondary" />
    </span>
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
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <Table className="table-fixed">
        <TableHeader className="bg-surface-subtle">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[48%] pl-5 sm:w-[56%] md:w-[46%] lg:w-[42%]">Name</TableHead>
            <TableHead className="hidden w-[14%] text-center sm:table-cell md:w-[12%]">Type</TableHead>
            <TableHead className="hidden w-[18%] md:table-cell lg:w-[16%]">Owner</TableHead>
            <TableHead className="hidden w-[18%] lg:table-cell">Modified</TableHead>
            <TableHead className="w-[5.5rem] pr-5 text-right lg:w-[9%]">Actions</TableHead>
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
                  <Link href={href} prefetch={false} className="flex min-w-0 items-center gap-3">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground group-hover:text-foreground">
                        {file.name}
                      </span>
                      <span className="text-xs text-text-secondary sm:hidden">
                        {meta.label} · {timeAgo(file.updated_at || file.created_at)}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-center">
                  <TypeBadge type={file.type} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {owned ? (
                    <span className="block truncate text-sm text-muted-foreground">You</span>
                  ) : (
                    <span className="inline-flex min-w-0 max-w-full items-center gap-2 text-sm text-muted-foreground">
                      Shared
                      <Badge className="bg-[#737373] text-text-secondary">{ROLE_LABEL[file._role] ?? "Viewer"}</Badge>
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="block truncate text-sm text-text-secondary">{timeAgo(file.updated_at || file.created_at)}</span>
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!inTrash ? (
                      <button
                        type="button"
                        onClick={() => onToggleStar(file)}
                        className={cn(
                          "rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground",
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
                          className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground data-[state=open]:bg-surface-hover data-[state=open]:text-foreground"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!inTrash && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={href} prefetch={false}>Open</Link>
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
