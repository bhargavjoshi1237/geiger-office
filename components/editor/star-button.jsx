"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toggles the favorite/starred state of the current file.
 * `starred` + `onToggle` come from useOfficeFile (lib/persistence/use-office-file.js).
 */
export function StarButton({ starred, onToggle, label = "Star", className }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={starred}
      aria-label={starred ? `${label} (starred)` : label}
      title={starred ? "Remove star" : label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong",
        className,
      )}
    >
      <Star
        className={cn("h-4 w-4", starred && "fill-yellow-400 text-yellow-400")}
        strokeWidth={2}
      />
    </button>
  );
}
