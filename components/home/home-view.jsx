"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  LayoutTemplate,
  Loader2,
  Presentation,
  Search,
  Settings,
  Sheet,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FileTable } from "@/components/home/file-table";
import { StatsRow } from "@/components/home/stats-row";
import { TemplatesView } from "@/components/home/templates-view";
import { SettingsView } from "@/components/home/settings-view";
import { NewFileMenu } from "@/components/home/new-file-menu";
import { EmptyState } from "@/components/home/empty-state";
import { RenameDialog } from "@/components/home/rename-dialog";
import { ConfirmDialog } from "@/components/home/confirm-dialog";
import { ShareDialog } from "@/components/share/share-dialog";
import { editorHref } from "@/lib/files/file-meta";

function apiUrl(path = "") {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files${path}`;
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
  { id: "templates", label: "Templates", Icon: LayoutTemplate },
  { id: "settings", label: "Settings", Icon: Settings },
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
  settings: { title: "Settings", subtitle: "Manage your workspace preferences." },
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

  const isListView = LIST_VIEWS.has(view);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/stats"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      if (data.viewerId) setViewerId(data.viewerId);
    } catch {
    } finally {
      setStatsLoading(false);
    }
  }, []);

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
      const res = await fetch(apiUrl(`?filter=${filter}${type}`));
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
  }, [view]);

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
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const file = await res.json();
      router.push(editorHref(file));
    } catch (err) {
      setError(err.message || "Failed to create file");
      setCreating(false);
    }
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
  };

  const handleRestore = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    await patch(file, { trashed: false });
    fetchStats();
  };

  const handleRenameSubmit = async (name) => {
    const file = renameTarget;
    if (!file) return;
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name } : f)));
    await patch(file, { name });
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
        }),
      });
      const created = await res.json();
      setFiles((prev) => [{ ...created, _role: "owner" }, ...prev]);
      fetchStats();
    } catch (err) {
      setError(err.message || "Failed to duplicate file");
    }
  };

  const handleDelete = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    await fetch(apiUrl(`/${file.id}`), { method: "DELETE" });
    fetchStats();
  };

  const page = PAGE[view] ?? PAGE.recent;
  const showSearch = isListView;
  const showNew = view !== "settings";

  return (
    <AppShell nav={navItems} activeView={view} onViewChange={setView}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">{page.title}</h1>
            <p className="mt-1 text-sm text-[#a3a3a3]">{page.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {showSearch ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files"
                  className="h-9 w-full rounded-md border border-[#2a2a2a] bg-[#202020] pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-[#737373] focus:border-[#474747] sm:w-64"
                />
              </div>
            ) : null}
            {showNew ? <NewFileMenu onCreate={handleCreate} creating={creating} /> : null}
          </div>
        </div>

        {STATS_VIEWS.has(view) ? (
          <div className="mb-6 border-b border-[#2a2a2a] pb-6">
            <StatsRow stats={stats} loading={statsLoading} />
          </div>
        ) : null}

        {view === "templates" ? (
          <TemplatesView onCreate={handleCreate} creating={creating} />
        ) : view === "settings" ? (
          <SettingsView email={stats?.email} />
        ) : loading ? (
          <div className="flex min-h-[40vh] items-center justify-center text-[#737373]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={fetchFiles}
              className="rounded-md border border-[#333333] px-3 py-1.5 text-sm text-[#a3a3a3] hover:bg-[#242424] hover:text-white"
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
    </AppShell>
  );
}
