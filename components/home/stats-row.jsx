"use client";

import { FileText, Files, Presentation, Sheet, Trash2 } from "lucide-react";

function pctOfLibrary(value, total) {
  if (!total) return "0% of library";
  return `${Math.round(((value ?? 0) / total) * 100)}% of library`;
}

const CARDS = [
  {
    key: "total",
    label: "All files",
    Icon: Files,
    accent: "#e7e7e7",
    detail: (s) => {
      const trashed = s?.trashed ?? 0;
      return trashed > 0 ? (
        <span className="flex items-center gap-1">
          <Trash2 className="h-3 w-3" /> {trashed} in trash
        </span>
      ) : null;
    },
  },
  {
    key: "documents",
    label: "Documents",
    Icon: FileText,
    accent: "#4285f4",
    detail: (s) => pctOfLibrary(s?.documents, s?.total),
  },
  {
    key: "spreadsheets",
    label: "Spreadsheets",
    Icon: Sheet,
    accent: "#0f9d58",
    detail: (s) => pctOfLibrary(s?.spreadsheets, s?.total),
  },
  {
    key: "presentations",
    label: "Presentations",
    Icon: Presentation,
    accent: "#f4b400",
    detail: (s) => pctOfLibrary(s?.presentations, s?.total),
  },
];

export function StatsRow({ stats, loading }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CARDS.map(({ key, label, Icon, accent, detail }) => (
        <div
          key={key}
          className="group flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 transition-colors hover:border-[#3a3a3a]"
        >
          <Icon
            className="h-4 w-4 shrink-0"
            style={{ color: accent }}
            strokeWidth={2}
          />
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="min-w-0">
              <span className="truncate text-sm text-[#e7e7e7]">{label}</span>
            </div>
            <span className="text-base font-semibold tabular-nums text-[#e7e7e7]">
              {loading ? <span className="text-[#3a3a3a]">—</span> : (stats?.[key] ?? 0)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
