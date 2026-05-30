"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { ShareDialog } from "@/components/share/share-dialog";
import { cn } from "@/lib/utils";

const DEFAULT_CLASS =
  "inline-flex h-8 items-center gap-2 rounded-full border border-[#3a3a3a] bg-[#2a2a2a] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#333333]";

export function ShareButton({ fileId, fileType, name, className, label = "Share", render }) {
  const [open, setOpen] = useState(false);
  const file = { id: fileId, type: fileType, name };

  return (
    <>
      {render ? (
        render(() => setOpen(true))
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={cn(DEFAULT_CLASS, className)}>
          <UserPlus className="h-4 w-4" />
          {label}
        </button>
      )}
      {fileId ? <ShareDialog open={open} file={file} onOpenChange={setOpen} /> : null}
    </>
  );
}

export function ViewOnlyBadge({ role, className }) {
  if (role !== "viewer" && role !== "commenter") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#3a3a3a] bg-[#242424] px-2 py-0.5 text-xs font-medium text-[#a3a3a3]",
        className,
      )}
    >
      View only
    </span>
  );
}
