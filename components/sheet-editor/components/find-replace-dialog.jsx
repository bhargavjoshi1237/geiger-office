"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FindReplaceDialog({ open, onOpenChange, onReplaceAll }) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [result, setResult] = useState(null);

  const handleReplaceAll = () => {
    if (!find) return;
    const count = onReplaceAll({ find, replace, matchCase });
    setResult(count);
  };

  const handleOpenChange = (next) => {
    if (!next) {
      setResult(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[min(440px,calc(100vw-32px))]">
        <DialogHeader>
          <DialogTitle>Find and replace</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-[#a3a3a3]">
            Find
            <Input
              autoFocus
              value={find}
              onChange={(event) => {
                setFind(event.target.value);
                setResult(null);
              }}
              placeholder="Text to find"
              className="border-[#333333] bg-[#202020] text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#a3a3a3]">
            Replace with
            <Input
              value={replace}
              onChange={(event) => setReplace(event.target.value)}
              placeholder="Replacement text"
              className="border-[#333333] bg-[#202020] text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#d4d4d4]">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(event) => setMatchCase(event.target.checked)}
              className="h-4 w-4 accent-[#365d4f]"
            />
            Match case
          </label>
          {result != null ? (
            <p className="text-xs text-[#8ab4f8]">
              {result === 0 ? "No matches found." : `Replaced ${result} cell${result === 1 ? "" : "s"}.`}
            </p>
          ) : null}
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" className="h-8 px-3" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <Button type="button" className="h-8 px-3" disabled={!find} onClick={handleReplaceAll}>
              Replace all
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
