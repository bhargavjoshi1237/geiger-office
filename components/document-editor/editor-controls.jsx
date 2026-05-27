"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

function IconButton({ children, className, label, ...props }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(
        "h-8 w-8 rounded-md text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white focus-visible:ring-[#474747]",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

function ToolbarSelect({ children, className, ...props }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 flex shrink-0 items-center justify-start rounded-md px-2 text-sm font-normal text-[#d4d4d4] hover:bg-[#2a2a2a] hover:text-white focus-visible:ring-[#474747]",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-1.5 mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a3a3a3]" />
    </Button>
  );
}

function ToolbarDivider() {
  return <Separator orientation="vertical" className="mx-1 h-7 bg-[#333333]" />;
}

function ToolbarToggle({ children, className, label, ...props }) {
  return (
    <Toggle
      type="button"
      size="icon"
      aria-label={label}
      title={label}
      className={cn(
        "h-8 w-8 shrink-0 rounded-md text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white focus-visible:ring-[#474747] data-[state=on]:bg-[#3a3a3a] data-[state=on]:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export { IconButton, ToolbarDivider, ToolbarSelect, ToolbarToggle };
