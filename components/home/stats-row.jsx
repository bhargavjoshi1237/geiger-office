"use client";

import { FileText, Files, Presentation, Sheet } from "lucide-react";

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
    detail: (s) => `${s?.trashed ?? 0} in trash`,
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map(({ key, label, Icon, accent, detail }) => (
        <div
          key={key}
          className="group rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3a3a3a]"
        >
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-[#525252]">
            <Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: accent }}
              strokeWidth={2}
            />
            <span className="truncate">{label}</span>
          </div>
          <p className="mt-2 text-xl font-semibold tabular-nums text-[#e7e7e7]">
            {loading ? <span className="text-[#3a3a3a]">—</span> : (stats?.[key] ?? 0)}
          </p>
          <p className="mt-1 text-xs text-[#737373]">
            {loading ? (
              <span className="text-[#3a3a3a]">Loading…</span>
            ) : (
              detail(stats)
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
