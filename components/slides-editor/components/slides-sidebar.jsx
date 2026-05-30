"use client";

import { useState } from "react";
import { LayoutTemplate, PanelRightClose, Palette, Sparkles, StickyNote } from "lucide-react";
import { layouts } from "@/components/slides-editor/data/layout-presets";
import { themeOptions } from "@/components/slides-editor/data/theme-presets";
import { transitionOptions } from "@/components/slides-editor/constants";
import { cn } from "@/lib/utils";

function SlidesPanelHeader({ title, icon: Icon, onClose }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#333333] px-3">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      <button
        type="button"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#2a2a2a] hover:text-white"
        onClick={onClose}
        aria-label="Collapse panel"
        title="Collapse panel"
      >
        <PanelRightClose className="h-4 w-4" />
      </button>
    </div>
  );
}

function LayoutsPanel({ activeLayout, onAddSlide }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="shrink-0 px-3 py-3 text-[11px] text-[#737373]">Click a layout to insert a new slide.</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-subtle">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onAddSlide(layout.id)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[#242424]"
          >
            <span className="grid h-9 w-12 shrink-0 place-items-center rounded border border-[#333333] bg-[#202020] text-[#a3a3a3]">
              <LayoutTemplate className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-white">{layout.label}</span>
              {activeLayout === layout.id ? <span className="block text-[11px] text-[#737373]">Current layout</span> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemesPanel({ activeThemeId, onApplyTheme }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-subtle">
      {themeOptions.map((theme) => {
        const isActive = theme.id === activeThemeId;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onApplyTheme(theme)}
            className={cn(
              "mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[#242424]",
              isActive && "bg-[#242424]",
            )}
          >
            <span className="flex h-9 w-12 shrink-0 items-center justify-center gap-1 rounded border border-[#333333]" style={{ background: theme.background }}>
              <span className="h-4 w-4 rounded-full" style={{ background: theme.accent }} />
              <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: theme.text }} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-white">{theme.label}</span>
            {isActive ? <span className="shrink-0 text-[11px] text-[#737373]">Current</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function TransitionsPanel({ activeTransition, onSetTransition }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-subtle">
      {transitionOptions.map((transition) => {
        const isActive = transition === activeTransition;
        return (
          <button
            key={transition}
            type="button"
            onClick={() => onSetTransition(transition)}
            className={cn(
              "mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[#242424]",
              isActive ? "bg-[#242424] text-white" : "text-[#d4d4d4]",
            )}
          >
            {transition}
            {isActive ? <span className="text-[11px] text-[#737373]">Current</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function SlideNotesPanel({ notes, onSetNotes }) {
  const [draft, setDraft] = useState(notes ?? "");
  const commitNotes = () => {
    if ((notes ?? "") !== draft) onSetNotes(draft);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3">
      <p className="mb-2 text-[11px] uppercase tracking-normal text-[#737373]">Notes for this slide</p>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitNotes}
        placeholder="Add speaker notes…"
        className="min-h-0 flex-1 resize-none rounded-md border border-[#333333] bg-[#202020] p-2 text-sm text-white placeholder:text-[#737373] focus:border-[#474747] focus:outline-none"
      />
    </div>
  );
}

export function SlidesSidebar({
  activeSlide,
  openTool: controlledOpenTool,
  onOpenToolChange,
  onAddSlide,
  onApplyTheme,
  onSetTransition,
  onSetNotes,
}) {
  const [internalOpenTool, setInternalOpenTool] = useState(null);
  const isControlled = controlledOpenTool !== undefined;
  const openTool = isControlled ? controlledOpenTool : internalOpenTool;
  const setOpenTool = (next) => {
    if (isControlled) onOpenToolChange?.(next);
    else setInternalOpenTool(next);
  };

  const tools = [
    { id: "layouts", label: "Layouts", icon: LayoutTemplate },
    { id: "themes", label: "Themes", icon: Palette },
    { id: "transitions", label: "Transitions", icon: Sparkles },
    { id: "notes", label: "Speaker notes", icon: StickyNote },
  ];
  const active = tools.find((tool) => tool.id === openTool);

  return (
    <aside className={cn("hidden shrink-0 border-l border-[#333333] bg-[#1a1a1a] xl:flex", active ? "w-80" : "w-12")}>
      {active ? (
        <div className="flex min-w-0 flex-1 flex-col border-r border-[#333333]">
          <SlidesPanelHeader title={active.label} icon={active.icon} onClose={() => setOpenTool(null)} />
          {openTool === "layouts" ? <LayoutsPanel activeLayout={activeSlide.layout} onAddSlide={onAddSlide} /> : null}
          {openTool === "themes" ? <ThemesPanel activeThemeId={activeSlide.themeId} onApplyTheme={onApplyTheme} /> : null}
          {openTool === "transitions" ? <TransitionsPanel activeTransition={activeSlide.transition} onSetTransition={onSetTransition} /> : null}
          {openTool === "notes" ? <SlideNotesPanel key={activeSlide.id} notes={activeSlide.notes} onSetNotes={onSetNotes} /> : null}
        </div>
      ) : null}
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 py-2">
        {tools.map((tool) => {
          const isActive = tool.id === openTool;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setOpenTool(isActive ? null : tool.id)}
              className={cn(
                "relative grid h-9 w-9 place-items-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white",
                isActive && "bg-[#2a2a2a] text-white",
              )}
              aria-label={tool.label}
              aria-pressed={isActive}
              title={tool.label}
            >
              {isActive ? <span className="absolute right-0 top-1.5 h-6 w-0.5 rounded-full bg-white" /> : null}
              <tool.icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
