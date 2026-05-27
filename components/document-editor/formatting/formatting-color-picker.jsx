"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/document-editor/editor-controls";
import { cn } from "@/lib/utils";

function normalizeHexColor(value) {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (/^#[0-9a-fA-F]{3}$/.test(prefixed)) {
    return `#${prefixed[1]}${prefixed[1]}${prefixed[2]}${prefixed[2]}${prefixed[3]}${prefixed[3]}`.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(prefixed)) {
    return prefixed.toLowerCase();
  }

  return null;
}

function formatHexInput(value) {
  const trimmed = value.trim();
  const hasHash = trimmed.startsWith("#");
  const hex = trimmed.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();

  return hasHash ? `#${hex}` : hex;
}

function FormattingColorPicker({ activeColor, disabled, icon: Icon, label, options, onSelectColor }) {
  const [hexValue, setHexValue] = useState(activeColor ?? "");
  const normalizedHex = normalizeHexColor(hexValue);
  const canApplyHex = Boolean(normalizedHex);

  const applyColor = (color) => {
    onSelectColor(color);
    setHexValue(color ?? "");
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && setHexValue(activeColor ?? "")}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <IconButton label={label} disabled={disabled} className={activeColor ? "bg-[#333333] text-white" : undefined}>
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Icon className="h-4 w-4" />
            {activeColor ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 h-0.5 w-4 rounded-full"
                style={{ backgroundColor: activeColor }}
              />
            ) : null}
          </span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[244px] p-2" align="start" onCloseAutoFocus={(event) => event.preventDefault()}>
        <div className="grid grid-cols-10 gap-1.5">
          {options.map((option) => {
            const isActive = activeColor?.toLowerCase() === option.value.toLowerCase();

            return (
              <button
                key={option.id}
                type="button"
                aria-label={`${label} ${option.value}`}
                title={option.value}
                onClick={() => applyColor(option.value)}
                className={cn(
                  "h-5 w-5 rounded-full border border-white/10 ring-offset-2 ring-offset-[#202020] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  isActive && "ring-1 ring-white",
                )}
                style={{ backgroundColor: option.value }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Input
            aria-label={`${label} hex value`}
            value={hexValue}
            onChange={(event) => setHexValue(formatHexInput(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && normalizedHex) {
                applyColor(normalizedHex);
              }
            }}
            maxLength={7}
            placeholder="#RRGGBB"
            className="h-8 font-mono text-xs uppercase"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canApplyHex}
            onClick={() => applyColor(normalizedHex)}
            className="h-8 px-2"
          >
            Apply
          </Button>
          <IconButton label={`Reset ${label}`} onClick={() => applyColor(null)}>
            <RotateCcw className="h-4 w-4" />
          </IconButton>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { FormattingColorPicker, formatHexInput, normalizeHexColor };
