"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Loader2,
  Pencil,
  Presentation,
  Sheet,
  Trash2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FILE_TYPE_LIST, editorHref, timeAgo } from "@/lib/files/file-meta";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

function apiUrl(path = "") {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api${path}`;
}

function withProject(path, projectId) {
  if (!projectId || projectId === "all") return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}project_id=${encodeURIComponent(projectId)}`;
}

const FOLDER_COLORS = [
  "#4285f4",
  "#0f9d58",
  "#f4b400",
  "#ea4335",
  "#ab47bc",
  "#00acc1",
  "#ff7043",
  "#8d6e63",
];

function CreateFolderDialog({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
    setName("");
    setColor(FOLDER_COLORS[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-md border border-border bg-surface-subtle p-6 shadow-xl"
      >
        <h2 className="text-sm font-medium text-foreground">New folder</h2>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          className="mt-3 h-9 w-full rounded-md border border-border bg-surface-card px-3 text-sm text-white outline-none transition-colors placeholder:text-text-secondary focus:border-border-strong"
        />
        <div className="mt-3 flex items-center gap-2">
          {FOLDER_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-5 w-5 rounded-full border-2 transition-colors"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "#fff" : "transparent",
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-active hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5] disabled:opacity-60"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

function RenameFolderDialog({ open, folder, onClose, onSubmit }) {
  const [name, setName] = useState("");

  if (!open || !folder) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim() || folder.name;
    onSubmit({ id: folder.id, name: trimmed });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-md border border-border bg-surface-subtle p-6 shadow-xl"
      >
        <h2 className="text-sm font-medium text-foreground">Rename folder</h2>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={folder.name}
          className="mt-3 h-9 w-full rounded-md border border-border bg-surface-card px-3 text-sm text-white outline-none transition-colors placeholder:text-text-secondary focus:border-border-strong"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-active hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5] disabled:opacity-60"
          >
            Rename
          </button>
        </div>
      </form>
    </div>
  );
}

function metaFor(type) {
  return FILE_TYPE_LIST.find((t) => t.type === type) ?? FILE_TYPE_LIST[0];
}

const TYPE_ICONS = {
  document: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

export function FoldersView({ projectId, onCreate, creating, createOpen: controlledCreateOpen, onCreateOpenChange, onActiveFolderChange, onAddToFolder }) {
  const router = useRouter();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  const createOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : internalCreateOpen;
  const setCreateOpen = onCreateOpenChange || setInternalCreateOpen;

  useEffect(() => {
    onActiveFolderChange?.(activeFolder);
  }, [activeFolder, onActiveFolderChange]);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(withProject("/folders", projectId)));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFolders(data.folders ?? []);
    } catch (err) {
      setError(err.message || "Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const fetchFolderFiles = useCallback(async (folderId) => {
    setFilesLoading(true);
    try {
      const res = await fetch(
        apiUrl(withProject(`/files?folder_id=${folderId}`, projectId)),
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFolderFiles(data.files ?? []);
    } catch {
      setFolderFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (activeFolder) {
      fetchFolderFiles(activeFolder.id);
    }
  }, [activeFolder, fetchFolderFiles]);

  const handleCreateFolder = async ({ name, color }) => {
    try {
      const res = await fetch(apiUrl("/folders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color,
          project_id:
            projectId !== "all" && projectId !== "personal" ? projectId : null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const folder = await res.json();
      setFolders((prev) => [folder, ...prev]);
      toast.success("Folder created", { description: folder.name });
    } catch (err) {
      toast.error("Couldn't create folder", { description: err.message });
      setError(err.message || "Failed to create folder");
    }
  };

  const handleRenameFolder = async ({ id, name }) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
    try {
      await fetch(apiUrl(`/folders/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      toast.success("Folder renamed", { description: name });
    } catch {
      toast.error("Couldn't rename folder");
      fetchFolders();
    }
  };

  const handleDeleteFolder = async (folder) => {
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    if (activeFolder?.id === folder.id) setActiveFolder(null);
    try {
      await fetch(apiUrl(`/folders/${folder.id}`), { method: "DELETE" });
      toast.success("Folder deleted", { description: folder.name });
    } catch {
      toast.error("Couldn't delete folder");
      fetchFolders();
    }
  };

  const handleOpenFile = (file) => {
    router.push(editorHref(file));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-secondary">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (activeFolder) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={() => setActiveFolder(null)}
            className="w-10 h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <h2 className="text-sm font-medium text-foreground">
            {activeFolder.name}
          </h2>
        </div>
        {filesLoading ? (
          <div className="flex min-h-[20vh] items-center justify-center text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : folderFiles.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle p-8 text-center">
            <FolderOpen className="mb-3 h-6 w-6 text-text-tertiary" />
            <p className="text-sm font-medium text-foreground">
              This folder is empty
            </p>
            <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
              Move files here to keep them organized.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folderFiles.map((file) => {
              const Icon = TYPE_ICONS[file.type] || FileText;
              const meta = metaFor(file.type);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleOpenFile(file)}
                  className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4 text-left transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-card">
                      <Icon
                        className="h-4 w-4"
                        style={{ color: meta.accent }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">
                      {file.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}

      {folders.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle p-8 text-center">
          <FolderOpen className="mb-3 h-6 w-6 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">No folders yet</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
            Create a folder to organize your files.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => setActiveFolder(folder)}
                  className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4 text-left transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border"
                      style={{
                        backgroundColor: (folder.color || "#4285f4") + "1a",
                      }}
                    >
                      <FolderOpen
                        className="h-4 w-4"
                        style={{ color: folder.color || "#a3a3a3" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-white">
                        {folder.name}
                      </h3>
                      <span className="text-xs text-text-secondary">
                        {folder.file_count ?? 0}{" "}
                        {(folder.file_count ?? 0) === 1 ? "file" : "files"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 border-t border-surface-active pt-2.5 text-[10px] text-text-tertiary">
                    <Clock3 className="h-3 w-3" />
                    Updated {timeAgo(folder.updated_at)}
                  </div>
                </button>
              </ContextMenuTrigger>

              <ContextMenuContent className="w-52 bg-surface-card border-border shadow-xl">
                <ContextMenuItem
                  className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                  onSelect={() => setActiveFolder(folder)}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Open
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                  onSelect={() => onAddToFolder?.(folder)}
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  Add files
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                  onSelect={() => setRenameTarget(folder)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-red-400 focus:bg-surface-hover focus:text-red-300 cursor-pointer gap-2"
                  onSelect={() => handleDeleteFolder(folder)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      )}

      <CreateFolderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateFolder}
      />
      <RenameFolderDialog
        open={!!renameTarget}
        folder={renameTarget}
        onClose={() => setRenameTarget(null)}
        onSubmit={handleRenameFolder}
      />
    </div>
  );
}
