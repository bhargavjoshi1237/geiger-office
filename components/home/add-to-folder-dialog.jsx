"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, FileText, FolderPlus, Loader2, Presentation, Search, Sheet, X } from "lucide-react";
import { FILE_TYPE_LIST, timeAgo } from "@/lib/files/file-meta";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_FILTERS = [
  { value: "", label: "All types" },
  ...FILE_TYPE_LIST.map((t) => ({ value: t.type, label: t.label })),
];

const TYPE_ICONS = {
  document: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

function apiUrl(path = "") {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files${path}`;
}

export function AddToFolderDialog({ open, folderId, folderName, onClose, onAdded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setQuery("");
    setTypeFilter("");
    setSelected(new Set());

    fetch(apiUrl("?filter=recent"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const available = (data.files ?? []).filter(
          (f) => f.folder_id !== folderId && !f.trashed,
        );
        setFiles(available);
      })
      .catch((err) => setError(err.message || "Failed to load files"))
      .finally(() => setLoading(false));
  }, [open, folderId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((f) => {
      if (typeFilter && f.type !== typeFilter) return false;
      if (q && !f.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [files, query, typeFilter]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((f) => f.id)));
    }
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    try {
      const ids = [...selected];
      await Promise.all(
        ids.map((id) =>
          fetch(apiUrl(`/${id}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder_id: folderId }),
          }),
        ),
      );
      onAdded?.(ids);
      toast.success(
        `${ids.length} ${ids.length === 1 ? "file" : "files"} added`,
        { description: `Added to “${folderName}”` },
      );
      onClose();
    } catch {
      toast.error("Couldn't add some files");
      setError("Failed to add some files");
    } finally {
      setAdding(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#e7e7e7]">Add to folder</h2>
            <p className="mt-0.5 text-xs text-[#737373]">
              Select files to add to &ldquo;{folderName}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#242424] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-5 py-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files"
              autoFocus
              className="h-8 w-full rounded-md border border-[#2a2a2a] bg-[#202020] pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-[#737373] focus:border-[#474747]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 bg-[#202020] border-[#2a2a2a] text-[#ededed] hover:bg-[#1a1a1a] text-xs px-3 rounded-md font-medium"
              >
                {TYPE_FILTERS.find((t) => t.value === typeFilter)?.label || "All types"}
                <ChevronDown className="w-3.5 h-3.5 ml-2 text-[#737373]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                {TYPE_FILTERS.map((t) => (
                  <DropdownMenuRadioItem
                    key={t.value}
                    value={t.value}
                    className="text-xs focus:bg-[#2a2a2a] focus:text-[#ededed] cursor-pointer"
                  >
                    {t.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#737373]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-300">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderPlus className="mb-2 h-8 w-8 text-[#525252]" />
              <p className="text-sm text-[#a3a3a3]">
                {query.trim() || typeFilter ? "No matching files" : "No files available"}
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className="mb-2 text-xs text-[#737373] transition-colors hover:text-white"
              >
                {selected.size === filtered.length ? "Deselect all" : "Select all"}
              </button>
              <div className="space-y-1">
                {filtered.map((file) => {
                  const isSelected = selected.has(file.id);
                  const Icon = TYPE_ICONS[file.type] || FileText;
                  const meta = FILE_TYPE_LIST.find((t) => t.type === file.type);
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => toggle(file.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-[#2a2a2a] ring-1 ring-inset ring-[#474747]"
                          : "hover:bg-[#242424]",
                      )}
                    >
                      <Checkbox checked={isSelected} />
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: meta?.accent || "#737373" }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-[#e7e7e7]">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-[#525252]">
                        Edited: {timeAgo(file.updated_at).toLowerCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#2a2a2a] px-5 py-3">
          <span className="text-xs text-[#737373]">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.size === 0 || adding}
              onClick={handleAdd}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5] disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add to folder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
