"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { labelOf, parseCellLabel } from "@/components/sheet-editor/utils/cell-utils";
import { rangeLabelOf } from "@/components/sheet-editor/utils/range-utils";

export function FormulaBar({ activeCell, formulaValue, selectedRange, onFormulaChange, onFormulaCommit, onJumpToCell }) {
  const [nameDraft, setNameDraft] = useState(null);
  const nameValue = nameDraft ?? rangeLabelOf(selectedRange ?? { start: activeCell, end: activeCell });

  return (
    <div className="flex h-9 shrink-0 items-center border-b border-[#333333] bg-[#1a1a1a] text-sm text-[#a3a3a3]">
      <Input
        aria-label="Cell reference"
        value={nameValue}
        onChange={(event) => setNameDraft(event.target.value)}
        onFocus={() => setNameDraft(labelOf(activeCell))}
        onBlur={() => setNameDraft(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const parsed = parseCellLabel(nameValue);
            if (parsed) onJumpToCell(parsed);
            setNameDraft(null);
          }
        }}
        className="h-full w-24 shrink-0 rounded-none border-0 border-r border-[#333333] bg-[#1a1a1a] px-3 text-white focus-visible:ring-0"
      />
      <div className="grid h-full w-12 shrink-0 place-items-center border-r border-[#333333] text-[#a3a3a3]">
        fx
      </div>
      <Input
        aria-label="Formula"
        value={formulaValue}
        onChange={(event) => onFormulaChange(event.target.value)}
        onBlur={onFormulaCommit}
        onKeyDown={(event) => event.key === "Enter" && onFormulaCommit()}
        className="h-full min-w-0 rounded-none border-0 bg-[#1a1a1a] px-3 text-[#a3a3a3] focus-visible:ring-0"
      />
    </div>
  );
}
