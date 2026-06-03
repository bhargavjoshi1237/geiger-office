"use client";

import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpDropdown({ triggerClassName }) {
  return (
    <button
      type="button"
      aria-label="Help"
      onClick={() => { window.location.href = "/doc"; }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white",
        triggerClassName,
      )}
    >
      <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
    </button>
  );
}
