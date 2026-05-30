"use client";

import { useEffect, useState } from "react";
import { PanelLeft, X } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

function SidebarContent({ nav = [], activeView, onViewChange, onNavigate, showHeader = false, collapsed = false, onToggle }) {
  return (
    <>
      {showHeader ? (
        <div className="flex h-14 items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4">
          <div>
            <p className="text-sm font-semibold text-white">Office</p>
          </div>
        </div>
      ) : null}
      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          collapsed ? "px-0" : "px-1",
        )}
      >
        <div
          className={cn(
            "relative flex w-full min-w-0 flex-col",
            collapsed ? "py-2" : "p-2",
          )}
        >
          <ul className="flex w-full min-w-0 flex-col gap-1">
        {nav.map(({ id, label, Icon, heading, count }) => (
          heading ? (
            <li
              key={id}
              className={cn(
                "px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[#737373]",
                collapsed && "sr-only",
              )}
            >
              {label}
            </li>
          ) : (
          <li key={id} className="relative">
          <button
            type="button"
            onClick={() => {
              onViewChange(id);
              onNavigate?.();
            }}
            className={cn(
              "flex h-9 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#474747]",
              collapsed && "mx-auto h-8 w-8 justify-center p-0",
              activeView === id
                ? "bg-[#2a2a2a] font-medium text-white"
                : "text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white",
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className={cn("h-4 w-4 shrink-0", collapsed && "h-[18px] w-[18px]")} strokeWidth={2} />
            <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
            {count > 0 && !collapsed ? (
              <span
                className={cn(
                  "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] tabular-nums",
                  activeView === id
                    ? "bg-[#3a3a3a] text-[#e7e7e7]"
                    : "bg-[#242424] text-[#737373]",
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
          </li>
          )
        ))}
          </ul>
        </div>
      </nav>
      <div className="border-t border-[#2a2a2a] p-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-2 text-[#a3a3a3] transition-all hover:bg-[#2a2a2a] hover:text-white",
            collapsed && "mx-auto h-8 w-8 justify-center p-0",
          )}
          aria-label="Collapse sidebar"
          aria-expanded={!collapsed}
        >
          <PanelLeft className="h-5 w-5 shrink-0" />
        </button>
      </div>
    </>
  );
}

export function AppShell({ nav = [], activeView = "", onViewChange = () => {}, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col bg-[#161616] text-white">
      <Topbar onMenuClick={() => setMobileOpen(true)} />

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-[#2a2a2a] bg-[#1a1a1a] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              nav={nav}
              activeView={activeView}
              onViewChange={onViewChange}
              onNavigate={() => setMobileOpen(false)}
              showHeader
              onToggle={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 border-r border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3] transition-[width] duration-200 ease-linear md:flex md:flex-col",
            collapsed ? "w-12" : "w-64",
          )}
        >
          <SidebarContent
            nav={nav}
            activeView={activeView}
            onViewChange={onViewChange}
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
          />
        </aside>
        <main className="flex-1 overflow-y-auto bg-[#161616] p-4 md:p-8 scrollbar-subtle">{children}</main>
      </div>
    </div>
  );
}
