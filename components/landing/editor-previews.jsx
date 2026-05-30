"use client";

import { useState } from "react";
import {
  AlignLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
  Plus,
  Sigma,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Focused, self-contained editor previews for the landing page.
 *
 * These intentionally do NOT mount the real full-window editors (which assume a
 * 100dvh shell and break inside a small card). Each one renders a single
 * focused surface — a page, a grid, a slide — that stays interactable at any
 * size without overflowing its container.
 */

const TOOLBAR = [
  { id: "bold", Icon: Bold },
  { id: "italic", Icon: Italic },
  { id: "underline", Icon: Underline },
  { id: "divider" },
  { id: "bullet", Icon: List },
  { id: "ordered", Icon: ListOrdered },
  { id: "align", Icon: AlignLeft },
];

export function DocumentPreview() {
  const [active, setActive] = useState({ bold: false, italic: false, underline: false });

  const toggle = (id) =>
    setActive((prev) => (id in prev ? { ...prev, [id]: !prev[id] } : prev));

  return (
    <div className="flex h-full flex-col bg-[#1b1b1b]">
      <div className="flex items-center gap-1 border-b border-zinc-800 px-3 py-2">
        <div className="mr-2 hidden h-7 items-center rounded-md border border-zinc-700 bg-[#222] px-2 text-xs text-zinc-300 sm:flex">
          Normal text
        </div>
        {TOOLBAR.map(({ id, Icon }) =>
          id === "divider" ? (
            <span key={id} className="mx-1 h-5 w-px bg-zinc-700" />
          ) : (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-[#262626] hover:text-zinc-100",
                active[id] && "bg-[#2f2f2f] text-white",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ),
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-[#161616] p-4 scrollbar-subtle">
        <div className="mx-auto max-w-xl rounded-sm bg-white px-7 py-6 text-zinc-900 shadow-xl">
          <h1
            contentEditable
            suppressContentEditableWarning
            className="mb-3 text-xl font-bold outline-none"
          >
            Q3 Product Brief
          </h1>
          <p
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "text-sm leading-7 text-zinc-700 outline-none",
              active.bold && "font-semibold",
              active.italic && "italic",
              active.underline && "underline",
            )}
          >
            Geiger Office documents support live formatting, tabs, and the same
            controls used across the suite. Click here and start typing — the
            toolbar above toggles styles on this paragraph in real time.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            <li>Drafts, briefs, and plans</li>
            <li>Familiar formatting controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const COLS = ["A", "B", "C", "D", "E"];
const SEED = {
  A1: "Region", B1: "Q1", C1: "Q2", D1: "Q3", E1: "Total",
  A2: "North", B2: "1200", C2: "1850", D2: "2100", E2: "=SUM",
  A3: "South", B3: "980", C3: "1120", D3: "1340", E3: "=SUM",
  A4: "East", B4: "1500", C4: "1620", D4: "1990", E4: "=SUM",
  A5: "West", B5: "760", C5: "910", D5: "1180", E5: "=SUM",
};

export function SheetPreview() {
  const [selected, setSelected] = useState("D3");
  const [data, setData] = useState(SEED);

  const update = (cell, value) => setData((prev) => ({ ...prev, [cell]: value }));

  return (
    <div className="flex h-full flex-col bg-[#1b1b1b] text-zinc-200">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <span className="flex h-6 min-w-[2.5rem] items-center justify-center rounded border border-zinc-700 bg-[#222] px-2 text-xs font-medium text-zinc-300">
          {selected}
        </span>
        <Sigma className="h-3.5 w-3.5 text-zinc-500" />
        <span className="truncate text-xs text-zinc-400">
          {data[selected] || ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto scrollbar-subtle">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-10 w-9 border border-zinc-800 bg-[#202020]" />
              {COLS.map((c) => (
                <th
                  key={c}
                  className="border border-zinc-800 bg-[#202020] px-2 py-1 font-medium text-zinc-400"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                <td className="border border-zinc-800 bg-[#202020] text-center font-medium text-zinc-500">
                  {row}
                </td>
                {COLS.map((col) => {
                  const cell = `${col}${row}`;
                  const isSel = selected === cell;
                  return (
                    <td
                      key={cell}
                      onClick={() => setSelected(cell)}
                      className={cn(
                        "h-7 cursor-cell border border-zinc-800 px-2 text-left",
                        row === 1 ? "font-semibold text-zinc-200" : "text-zinc-300",
                        isSel ? "bg-emerald-500/15 ring-1 ring-inset ring-emerald-400" : "bg-[#161616]",
                      )}
                    >
                      {isSel ? (
                        <input
                          autoFocus
                          value={data[cell] ?? ""}
                          onChange={(e) => update(cell, e.target.value)}
                          className="h-full w-full bg-transparent text-zinc-100 outline-none"
                        />
                      ) : (
                        data[cell] ?? ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SLIDES = [
  {
    title: "Geiger Office",
    subtitle: "One suite. Docs, sheets, slides.",
    accent: "#f4b400",
  },
  {
    title: "Built for teams",
    subtitle: "Plan, report, and present together.",
    accent: "#4285f4",
  },
  {
    title: "Works offline",
    subtitle: "Keep editing without a connection.",
    accent: "#0f9d58",
  },
];

export function SlidePreview() {
  const [current, setCurrent] = useState(0);
  const slide = SLIDES[current];

  return (
    <div className="flex h-full bg-[#1b1b1b]">
      <div className="flex w-20 shrink-0 flex-col gap-2 overflow-y-auto border-r border-zinc-800 bg-[#181818] p-2 scrollbar-subtle">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={cn(
              "flex aspect-video w-full flex-col items-start justify-center gap-0.5 rounded-sm border bg-[#0f0f0f] p-1.5 text-left transition-colors",
              current === i ? "border-amber-400 ring-1 ring-amber-400/40" : "border-zinc-700 hover:border-zinc-500",
            )}
          >
            <span className="h-1 w-6 rounded-full" style={{ backgroundColor: s.accent }} />
            <span className="line-clamp-2 text-[7px] font-semibold leading-tight text-zinc-300">
              {s.title}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        <div className="flex aspect-video w-full max-w-md flex-col justify-center rounded-lg bg-gradient-to-br from-[#101010] to-[#1d1d1d] px-8 shadow-2xl ring-1 ring-zinc-700">
          <span
            className="mb-3 h-1.5 w-12 rounded-full"
            style={{ backgroundColor: slide.accent }}
          />
          <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{slide.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
