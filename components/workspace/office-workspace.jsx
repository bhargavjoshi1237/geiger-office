"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  FileText,
  LayoutTemplate,
  Presentation,
  Search,
  Sheet,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FileTable } from "@/components/home/file-table";
import { StatsRow } from "@/components/home/stats-row";
import { EmptyState } from "@/components/home/empty-state";

// Self-contained, offline demo of the Office home workspace for the landing
// playground. It mounts the REAL AppShell + FileTable + StatsRow, but with
// seeded local data and no network — so it renders (the old bare <AppShell />
// showed nothing) and stays interactable: switch views, search, star files.

const VIEWER_ID = "demo-user";

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
  { id: "trash", label: "Trash", Icon: Trash2 },
];

const TYPE_VIEWS = new Set(["document", "spreadsheet", "presentation"]);

const PAGE = {
  recent: { title: "Recent files", subtitle: "Pick up where you left off." },
  shared: { title: "Shared with me", subtitle: "Files other people have shared with you." },
  starred: { title: "Starred", subtitle: "Files you’ve marked as important." },
  document: { title: "Documents", subtitle: "All your documents." },
  spreadsheet: { title: "Spreadsheets", subtitle: "All your spreadsheets." },
  presentation: { title: "Presentations", subtitle: "All your presentations." },
  templates: { title: "Templates", subtitle: "Start something new." },
  trash: { title: "Trash", subtitle: "Files are permanently deleted after you empty trash." },
};

const DAY = 86_400_000;
const SEED_FILES = [
  { id: "f1", name: "Q3 Product Brief", type: "document", starred: true, daysAgo: 0, owned: true },
  { id: "f2", name: "Revenue Model", type: "spreadsheet", starred: false, daysAgo: 1, owned: true },
  { id: "f3", name: "Launch Keynote", type: "presentation", starred: true, daysAgo: 2, owned: true },
  { id: "f4", name: "Team Roadmap", type: "document", starred: false, daysAgo: 3, owned: false, role: "editor" },
  { id: "f5", name: "Budget 2026", type: "spreadsheet", starred: false, daysAgo: 5, owned: false, role: "viewer" },
  { id: "f6", name: "Onboarding Deck", type: "presentation", starred: false, daysAgo: 8, owned: true },
  { id: "f7", name: "Meeting Notes", type: "document", starred: false, daysAgo: 12, owned: true },
];

function seedFile(f, now) {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    starred: f.starred,
    trashed: false,
    user_id: f.owned ? VIEWER_ID : "someone-else",
    _role: f.role ?? (f.owned ? "owner" : "viewer"),
    updated_at: new Date(now - f.daysAgo * DAY).toISOString(),
    created_at: new Date(now - (f.daysAgo + 4) * DAY).toISOString(),
  };
}

const STATS = {
  total: 7,
  trashed: 0,
  documents: 3,
  spreadsheets: 2,
  presentations: 2,
};

export function OfficeWorkspace() {
  // Stamp times once on mount (Date.now in render is fine on the client).
  const [files, setFiles] = useState(() => {
    const now = Date.now();
    return SEED_FILES.map((f) => seedFile(f, now));
  });
  const [view, setView] = useState("recent");
  const [query, setQuery] = useState("");

  const toggleStar = (file) =>
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, starred: !f.starred } : f)),
    );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((f) => {
      if (view === "trash") return false; // demo has nothing in trash
      if (view === "starred" && !f.starred) return false;
      if (view === "shared" && f.user_id === VIEWER_ID) return false;
      if (TYPE_VIEWS.has(view) && f.type !== view) return false;
      if (q && !f.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [files, view, query]);

  const page = PAGE[view] ?? PAGE.recent;
  const isListView = view !== "templates" && view !== "settings";
  const showStats = !["templates", "settings", "trash"].includes(view);
  const noop = () => {};

  return (
    <AppShell nav={NAV} activeView={view} onViewChange={setView}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{page.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
          </div>
          {isListView ? (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files"
                className="h-9 w-full rounded-md border border-border bg-surface-card pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-text-secondary focus:border-border-strong sm:w-64"
              />
            </div>
          ) : null}
        </div>

        {showStats ? (
          <div className="mb-6 border-b border-border pb-6">
            <StatsRow stats={STATS} loading={false} />
          </div>
        ) : null}

        {view === "templates" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {["Blank document", "Budget tracker", "Pitch deck", "Meeting notes", "Project plan", "Invoice"].map(
              (t) => (
                <div
                  key={t}
                  className="rounded-xl border border-border bg-surface-subtle p-5 text-sm text-foreground transition-colors hover:border-border-strong"
                >
                  {t}
                </div>
              ),
            )}
          </div>
        ) : view === "settings" ? (
          <div className="rounded-xl border border-border bg-surface-subtle p-6 text-sm text-muted-foreground">
            Workspace preferences live here in the full app.
          </div>
        ) : visible.length === 0 ? (
          <EmptyState variant={query.trim() ? "search" : view} />
        ) : (
          <FileTable
            files={visible}
            viewerId={VIEWER_ID}
            onRename={noop}
            onDuplicate={noop}
            onToggleStar={toggleStar}
            onTrash={noop}
            onRestore={noop}
            onDelete={noop}
            onShare={noop}
          />
        )}
      </div>
    </AppShell>
  );
}
