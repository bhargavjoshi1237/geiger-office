"use client";

import { useState } from "react";
import { Collapsible } from "radix-ui";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Mail,
  PaintRoller,
  Plus,
  Sparkles,
  Table2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/document-editor/editor-controls";

const suggestionChips = [
  { icon: PaintRoller, label: "Match doc format" },
  { icon: Table2, label: "Templates" },
  { icon: ClipboardList, label: "Meeting notes" },
  { icon: Mail, label: "Email draft" },
  { icon: Archive, label: "More" },
];

function SuggestionBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} asChild>
      <div className="absolute bottom-5 left-1/2 z-10 w-[min(676px,calc(100%-48px))] -translate-x-1/2">
        <Collapsible.Content>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {suggestionChips.map(({ icon: Icon, label }) => (
              <Badge
                key={label}
                className="h-8 gap-2 rounded-full border border-border-strong bg-surface-active px-3 text-sm font-medium text-[#e5e5e5] shadow-lg shadow-black/20"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Badge>
            ))}
          </div>
          <div className="flex h-[62px] items-center gap-3 rounded-full border border-border-strong bg-surface-active px-5 shadow-2xl shadow-black/35">
            <IconButton label="Add prompt attachment" className="h-8 w-8 shrink-0">
              <Plus className="h-5 w-5" />
            </IconButton>
            <Input
              aria-label="Gemini prompt"
              readOnly
              value=""
              placeholder="Ask the AI to write about..."
              className="h-10 min-w-0 flex-1 border-0 bg-transparent px-1 text-base text-white placeholder:text-muted-foreground focus:border-transparent focus:outline-none"
            />
            <Collapsible.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Collapse writing assistant"
                className="h-9 w-9 shrink-0 rounded-full bg-surface-card text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:ring-border-strong"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </Collapsible.Trigger>
          </div>
        </Collapsible.Content>

        {!isOpen && (
          <Collapsible.Trigger asChild>
            <button
              type="button"
              aria-label="Expand writing assistant"
              className="mx-auto flex h-11 max-w-full items-center gap-3 rounded-full bg-surface-active px-4 text-sm font-medium text-[#e5e5e5] shadow-2xl shadow-black/35 transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
            ><span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="max-w-[190px] truncate sm:max-w-none">Ask the AI to Write</span>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </Collapsible.Trigger>
        )}
      </div>
    </Collapsible.Root>
  );
}

export { SuggestionBar };
