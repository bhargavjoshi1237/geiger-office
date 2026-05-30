"use client";

import { FILE_TYPE_LIST } from "@/lib/files/file-meta";

const TEMPLATES = [
  { id: "blank-document", type: "document", name: "Blank document", desc: "A fresh, empty page." },
  { id: "blank-spreadsheet", type: "spreadsheet", name: "Blank spreadsheet", desc: "An empty grid." },
  { id: "blank-presentation", type: "presentation", name: "Blank presentation", desc: "An empty deck." },
];

function metaFor(type) {
  return FILE_TYPE_LIST.find((t) => t.type === type) ?? FILE_TYPE_LIST[0];
}

export function TemplatesView({ onCreate, creating }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TEMPLATES.map((tpl) => {
          const meta = metaFor(tpl.type);
          const Icon = meta.icon;
          return (
            <button
              key={tpl.id}
              type="button"
              disabled={creating}
              onClick={() => onCreate(tpl.type)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020] text-left transition-colors hover:border-[#474747] disabled:opacity-60"
            >
              <span className="flex h-28 items-center justify-center border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <Icon className="h-9 w-9" style={{ color: meta.accent }} strokeWidth={1.5} />
              </span>
              <span className="p-3">
                <span className="block text-sm font-medium text-[#e7e7e7] group-hover:text-white">{tpl.name}</span>
                <span className="mt-0.5 block text-xs text-[#737373]">{tpl.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
