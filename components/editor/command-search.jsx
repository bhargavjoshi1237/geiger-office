"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Loader2, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { FILE_TYPE_LIST, editorHref, getFileType } from "@/lib/files/file-meta";

function apiBase() {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files`;
}

/**
 * Global command palette. Renders a search-styled trigger (matching the editor
 * headers) and a Ctrl/Cmd+K dialog that searches files and offers quick actions.
 */
export function CommandSearch({ placeholder = "Search...", triggerClassName }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    fetch(`${apiBase()}?filter=recent`)
      .then((res) => (res.ok ? res.json() : { files: [] }))
      .then((data) => setFiles(data.files ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [open]);

  const createFile = useCallback(
    async (type) => {
      setOpen(false);
      try {
        const res = await fetch(apiBase(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.push(editorHref(await res.json()));
      } catch {
        /* swallow — palette is best-effort navigation */
      }
    },
    [router],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const actions = [
      { id: "go-home", label: "Go to Home", Icon: Home, run: () => router.push("/home") },
      ...FILE_TYPE_LIST.map((meta) => ({
        id: `new-${meta.type}`,
        label: `New ${meta.newLabel}`,
        Icon: Plus,
        run: () => createFile(meta.type),
      })),
    ].filter((a) => !q || a.label.toLowerCase().includes(q));

    const fileItems = files
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((f) => {
        const meta = getFileType(f.type);
        return {
          id: `file-${f.id}`,
          label: f.name,
          Icon: meta.icon,
          hint: meta.label,
          run: () => router.push(editorHref(f)),
        };
      });

    return [...actions, ...fileItems];
  }, [query, files, router, createFile]);

  const activeIndex = items.length ? Math.min(active, items.length - 1) : 0;

  const runItem = (item) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  const onListKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runItem(items[activeIndex]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex h-8 w-8 items-center justify-center rounded-md border border-[#333333] bg-[#242424] px-2 text-sm text-[#a3a3a3] shadow-sm transition-colors hover:border-[#474747] hover:bg-[#2a2a2a] hover:text-white sm:w-[240px] sm:justify-start sm:px-2.5",
          triggerClassName,
        )}
      >
        <Search className="h-4 w-4 text-[#a3a3a3] transition-colors group-hover:text-white sm:mr-2" />
        <span className="hidden text-[#a3a3a3] transition-colors group-hover:text-white sm:inline-block">
          {placeholder}
        </span>
        <div className="absolute right-1.5 top-1.5 hidden items-center gap-1 sm:flex">
          <KbdGroup>
            <Kbd className="border border-[#333333] bg-[#202020] text-[#a3a3a3] transition-colors group-hover:bg-[#2a2a2a] group-hover:text-white">
              Ctrl
            </Kbd>
            <Kbd className="border border-[#333333] bg-[#202020] text-[#a3a3a3] transition-colors group-hover:bg-[#2a2a2a] group-hover:text-white">
              K
            </Kbd>
          </KbdGroup>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(560px,calc(100vw-32px))] p-0">
          <DialogTitle className="sr-only">Search and commands</DialogTitle>
          <div className="flex items-center gap-2 border-b border-[#333333] px-3.5 py-3">
            <Search className="h-4 w-4 shrink-0 text-[#737373]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onListKeyDown}
              placeholder="Search files or run a command..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#737373]"
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#737373]">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#737373]">No matches.</div>
            ) : (
              items.map((item, index) => {
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => runItem(item)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      index === activeIndex ? "bg-[#2a2a2a] text-white" : "text-[#d4d4d4]",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#a3a3a3]" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.hint ? (
                      <span className="shrink-0 text-xs text-[#737373]">{item.hint}</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
