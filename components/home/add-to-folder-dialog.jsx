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

function withProject(path, projectId) {
  if (!projectId || projectId === "all") return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}project_id=${encodeURIComponent(projectId)}`;
}

export function AddToFolderDialog({ open, projectId, folderId, folderName, onClose, onAdded }) {
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

    fetch(apiUrl(withProject("?filter=recent", projectId)))
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
  }, [open, folderId, projectId]);

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
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface-subtle shadow-xl max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Add to folder</h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Select files to add to &ldquo;{folderName}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-active hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files"
              autoFocus
              className="h-8 w-full rounded-md border border-border bg-surface-card pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-text-secondary focus:border-border-strong"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 bg-surface-card border-border text-foreground hover:bg-surface-subtle text-xs px-3 rounded-md font-medium"
              >
                {TYPE_FILTERS.find((t) => t.value === typeFilter)?.label || "All types"}
                <ChevronDown className="w-3.5 h-3.5 ml-2 text-text-secondary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-surface-subtle border-border text-foreground">
              <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                {TYPE_FILTERS.map((t) => (
                  <DropdownMenuRadioItem
                    key={t.value}
                    value={t.value}
                    className="text-xs focus:bg-surface-hover focus:text-foreground cursor-pointer"
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
            <div className="flex items-center justify-center py-10 text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-red-300">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderPlus className="mb-2 h-8 w-8 text-text-tertiary" />
              <p className="text-sm text-muted-foreground">
                {query.trim() || typeFilter ? "No matching files" : "No files available"}
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleAll}
                className="mb-2 text-xs text-text-secondary transition-colors hover:text-foreground"
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
                          ? "bg-surface-hover ring-1 ring-inset ring-border-strong"
                          : "hover:bg-surface-active",
                      )}
                    >
                      <Checkbox checked={isSelected} />
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: meta?.accent || "#737373" }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-text-tertiary">
                        Edited: {timeAgo(file.updated_at).toLowerCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="text-xs text-text-secondary">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-active hover:text-foreground"
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
