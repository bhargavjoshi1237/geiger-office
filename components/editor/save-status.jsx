"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";

export function SaveStatus({ status, className = "" }) {
  let content;
  if (status === "saving") {
    content = (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </>
    );
  } else if (status === "error") {
    content = (
      <>
        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
        Couldn&apos;t save
      </>
    );
  } else if (status === "saved") {
    content = (
      <>
        <Check className="h-3.5 w-3.5" />
        Saved
      </>
    );
  } else {
    content = <>Saved</>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#a3a3a3] ${className}`}
      aria-live="polite"
    >
      {content}
    </span>
  );
}
