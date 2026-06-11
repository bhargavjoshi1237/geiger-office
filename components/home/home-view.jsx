"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  FileText,
  FolderOpen,
  FolderKanban,
  FolderPlus,
  LayoutTemplate,
  Loader2,
  Plus,
  Presentation,
  Search,
  Sheet,
  Star,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FileTable } from "@/components/home/file-table";
import { StatsRow } from "@/components/home/stats-row";
import { TemplatesView } from "@/components/home/templates-view";
import { FoldersView } from "@/components/home/folders-view";
import { SettingsView } from "@/components/home/settings-view";
import { NewFileMenu } from "@/components/home/new-file-menu";
import { UploadDialog } from "@/components/home/upload-dialog";
import { EmptyState } from "@/components/home/empty-state";
import { RenameDialog } from "@/components/home/rename-dialog";
import { ConfirmDialog } from "@/components/home/confirm-dialog";
import { ShareDialog } from "@/components/share/share-dialog";
import { AddToFolderDialog } from "@/components/home/add-to-folder-dialog";
import { editorHref } from "@/lib/files/file-meta";

function apiUrl(path = "") {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files${path}`;
}

function appApiUrl(path) {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api${path}`;
}

function projectParam(projectId) {
  return projectId && projectId !== "all"
    ? `project_id=${encodeURIComponent(projectId)}`
    : "";
}

const NAV = [
  { id: "recent", label: "Recent", Icon: Clock },
  { id: "shared", label: "Shared with me", Icon: Users },
  { id: "starred", label: "Starred", Icon: Star },
  { id: "types-heading", label: "Types", heading: true },
  { id: "document", label: "Documents", Icon: FileText },
  { id: "spreadsheet", label: "Spreadsheets", Icon: Sheet },
  { id: "presentation", label: "Slides", Icon: Presentation },
  { id: "workspace-heading", label: "Workspace", heading: true },
  { id: "folders", label: "Folders", Icon: FolderOpen },
  { id: "templates", label: "Templates", Icon: LayoutTemplate },
  { id: "trash", label: "Trash", Icon: Trash2 },
];

const TYPE_VIEWS = new Set(["document", "spreadsheet", "presentation"]);

const NAV_COUNTS = { shared: "shared", starred: "starred" };

const PAGE = {
  recent: { title: "Recent files", subtitle: "Pick up where you left off." },
  shared: { title: "Shared with me", subtitle: "Files other people have shared with you." },
  starred: { title: "Starred", subtitle: "Files you’ve marked as important." },
  document: { title: "Documents", subtitle: "All your documents." },
  spreadsheet: { title: "Spreadsheets", subtitle: "All your spreadsheets." },
  presentation: { title: "Presentations", subtitle: "All your presentations." },
  templates: { title: "Templates", subtitle: "Start something new." },
  folders: { title: "Folders", subtitle: "Organize your files." },
  trash: { title: "Trash", subtitle: "Files are permanently deleted after you empty trash." },
};

const LIST_VIEWS = new Set([
  "recent",
  "shared",
  "starred",
  "document",
  "spreadsheet",
  "presentation",
  "trash",
]);
const STATS_VIEWS = new Set(["recent", "shared", "starred", "document", "spreadsheet", "presentation"]);

export function HomeView() {
  const router = useRouter();
  const [view, setView] = useState("recent");
  const [files, setFiles] = useState([]);
  const [viewerId, setViewerId] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderCreateOpen, setFolderCreateOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [addToFolderOpen, setAddToFolderOpen] = useState(false);
  const [addToFolderTarget, setAddToFolderTarget] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState("all");

  const isListView = LIST_VIEWS.has(view);

  useEffect(() => {
    fetch(appApiUrl("/projects"))
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => setProjects([]));
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const scope = projectParam(activeProject);
      const res = await fetch(apiUrl(`/stats${scope ? `?${scope}` : ""}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      if (data.viewerId) setViewerId(data.viewerId);
    } catch {
    } finally {
      setStatsLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchFiles = useCallback(async () => {
    if (!LIST_VIEWS.has(view)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const filter = TYPE_VIEWS.has(view) ? "recent" : view;
      const type = TYPE_VIEWS.has(view) ? `&type=${view}` : "";
      const scope = projectParam(activeProject);
      const res = await fetch(
        apiUrl(`?filter=${filter}${type}${scope ? `&${scope}` : ""}`),
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFiles(data.files ?? []);
      if (data.viewerId) setViewerId(data.viewerId);
    } catch (err) {
      setError(err.message || "Failed to load files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [activeProject, view]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const navItems = useMemo(
    () =>
      NAV.map((item) =>
        NAV_COUNTS[item.id]
          ? { ...item, count: stats?.[NAV_COUNTS[item.id]] ?? 0 }
          : item,
      ),
    [stats],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, query]);

  const handleCreate = async (type) => {
    setCreating(true);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          project_id:
            activeProject !== "all" && activeProject !== "personal"
              ? activeProject
              : null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const file = await res.json();
      router.push(editorHref(file));
    } catch (err) {
      toast.error("Couldn't create file", { description: err.message });
      setError(err.message || "Failed to create file");
      setCreating(false);
    }
  };

  // Create a file from an already-parsed upload payload ({ type, name, content }).
  // Returns the created file so the dialog can finish its flow.
  const handleUploadCreate = async ({ type, name, content }) => {
    const res = await fetch(apiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name,
        content,
        project_id:
          activeProject !== "all" && activeProject !== "personal"
            ? activeProject
            : null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed (HTTP ${res.status})`);
    }
    return res.json();
  };

  const handleUploaded = (created) => {
    if (!created) return;
    setFiles((prev) => [{ ...created, _role: "owner" }, ...prev]);
    fetchStats();
    toast.success("File uploaded", { description: created.name });
  };

  const patch = async (file, body) => {
    await fetch(apiUrl(`/${file.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  const handleToggleStar = async (file) => {
    const next = !file.starred;
    setFiles((prev) =>
      prev
        .map((f) => (f.id === file.id ? { ...f, starred: next } : f))
        .filter((f) => (view === "starred" ? f.starred : true)),
    );
    await patch(file, { starred: next });
    fetchStats();
  };

  const handleTrash = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    await patch(file, { trashed: true });
    fetchStats();
    toast("Moved to trash", {
      description: file.name,
      action: {
        label: "Undo",
        onClick: async () => {
          await patch(file, { trashed: false });
          fetchFiles();
          fetchStats();
        },
      },
    });
  };

  const handleRestore = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    await patch(file, { trashed: false });
    fetchStats();
    toast.success("Restored", { description: file.name });
  };

  const handleRenameSubmit = async (name) => {
    const file = renameTarget;
    if (!file) return;
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name } : f)));
    await patch(file, { name });
    toast.success("Renamed", { description: name });
  };

  const handleDuplicate = async (file) => {
    try {
      const full = await fetch(apiUrl(`/${file.id}`)).then((r) => r.json());
      const res = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: file.type,
          name: `${file.name} (copy)`,
          content: full.content ?? {},
          project_id: full.project_id ?? null,
        }),
      });
      const created = await res.json();
      setFiles((prev) => [{ ...created, _role: "owner" }, ...prev]);
      fetchStats();
      toast.success("Duplicated", { description: created.name });
    } catch (err) {
      toast.error("Couldn't duplicate file", { description: err.message });
      setError(err.message || "Failed to duplicate file");
    }
  };

  const handleDelete = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    await fetch(apiUrl(`/${file.id}`), { method: "DELETE" });
    fetchStats();
    toast.success("Deleted permanently", { description: file.name });
  };

  const page = PAGE[view] ?? PAGE.recent;
  const showSearch = isListView;
  const showNew = view !== "settings" && view !== "folders";
  const showUpload = showNew && view !== "templates";
  const isTemplateView = view === "templates";
  const isFolderView = view === "folders";

  return (
    <AppShell nav={navItems} activeView={view} onViewChange={setView}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{page.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <FolderKanban className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <select
                value={activeProject}
                onChange={(event) => {
                  setActiveProject(event.target.value);
                  setActiveFolder(null);
                }}
                aria-label="Filter files by project"
                className="h-9 max-w-48 appearance-none rounded-md border border-border bg-surface-card pl-8 pr-8 text-sm text-muted-foreground outline-none transition-colors hover:border-border-strong focus:border-border-strong"
              >
                <option value="all">All files</option>
                <option value="personal">Personal</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            {showSearch ? (
              <div className="relative flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files"
                  className="h-9 w-full rounded-md border border-border bg-surface-card pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-text-secondary focus:border-border-strong sm:w-64"
                />
              </div>
            ) : null}
            {showUpload ? (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                aria-label="Upload a file"
                title="Upload"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-card text-foreground transition-colors hover:border-border-strong hover:bg-surface-active"
              >
                <Upload className="h-4 w-4" />
              </button>
            ) : null}
            {isTemplateView ? (
              <button
                type="button"
                disabled={creating}
                onClick={() => handleCreate("document")}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5] disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                New Template
              </button>
            ) : isFolderView ? (
              activeFolder ? (
                <button
                  type="button"
                  onClick={() => {
                    setAddToFolderTarget(activeFolder);
                    setAddToFolderOpen(true);
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5]"
                >
                  <FolderPlus className="h-4 w-4" />
                  Add to folder
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setFolderCreateOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-[#161616] transition-colors hover:bg-[#e5e5e5]"
                >
                  <FolderPlus className="h-4 w-4" />
                  New folder
                </button>
              )
            ) : showNew ? (
              <NewFileMenu onCreate={handleCreate} creating={creating} />
            ) : null}
          </div>
        </div>

        {STATS_VIEWS.has(view) ? (
          <div className="mb-6 pb-3">
            <StatsRow stats={stats} loading={statsLoading} />
          </div>
        ) : null}

        {view === "templates" ? (
          <TemplatesView onCreate={handleCreate} creating={creating} />
        ) : view === "folders" ? (
          <FoldersView
            key={activeProject}
            projectId={activeProject}
            onCreate={handleCreate}
            creating={creating}
            createOpen={folderCreateOpen}
            onCreateOpenChange={setFolderCreateOpen}
            onActiveFolderChange={setActiveFolder}
            onAddToFolder={(folder) => {
              setAddToFolderTarget(folder);
              setAddToFolderOpen(true);
            }}
          />
        ) : view === "settings" ? (
          <SettingsView email={stats?.email} />
        ) : loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={fetchFiles}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-active hover:text-foreground"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState variant={query.trim() ? "search" : view} />
        ) : (
          <FileTable
            files={visible}
            viewerId={viewerId}
            onRename={setRenameTarget}
            onDuplicate={handleDuplicate}
            onToggleStar={handleToggleStar}
            onTrash={handleTrash}
            onRestore={handleRestore}
            onDelete={setDeleteTarget}
            onShare={setShareTarget}
          />
        )}
      </div>

      <RenameDialog
        open={!!renameTarget}
        file={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onSubmit={handleRenameSubmit}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete forever?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete forever"
        destructive
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
      <ShareDialog
        open={!!shareTarget}
        file={shareTarget}
        onOpenChange={(open) => !open && setShareTarget(null)}
      />
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onCreate={handleUploadCreate}
        onCreated={handleUploaded}
      />
      {addToFolderTarget ? (
        <AddToFolderDialog
          open={addToFolderOpen}
          projectId={activeProject}
          folderId={addToFolderTarget.id}
          folderName={addToFolderTarget.name}
          onClose={() => {
            setAddToFolderOpen(false);
            setAddToFolderTarget(null);
          }}
          onAdded={() => fetchStats()}
        />
      ) : null}
    </AppShell>
  );
}
