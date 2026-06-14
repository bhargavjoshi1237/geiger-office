"use client";

import { PanelLeft } from "lucide-react";
import { ProfileDropdown } from "@/components/editor/profile-dropdown";
import { NotificationsDropdown } from "@/components/editor/notifications-dropdown";
import { CommandSearch } from "@/components/editor/command-search";
import { HelpDropdown } from "@/components/editor/help-dropdown";
import ThemeToggle from "@/components/ui/theme-toggle";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function Topbar({ onMenuClick }) {
  return (
    <header className="relative z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-topbar-border bg-topbar-bg px-4 text-foreground backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-active hover:text-foreground md:hidden"
          aria-label="Open navigation"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded md:-ml-1.5 md:flex">
          <img
            src={`${assetPrefix}/logo1.svg`}
            alt=""
            className="-mr-0.5 h-5 w-5"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.innerHTML =
                '<div class="w-2 h-2 bg-white rounded-full"></div>';
            }}
          />
        </div>
        <div className="hidden cursor-pointer items-center pl-2 sm:flex md:border-l md:border-border">
          <span className="ml-1 text-sm font-semibold text-white">Office</span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 md:hidden">
        <img
          src={`${assetPrefix}/logo1.svg`}
          alt=""
          className="h-5 w-5"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="text-sm font-semibold text-white">Office</span>
      </div>

      <div className="flex justify-between gap-4 md:gap-8 sm:mr-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <CommandSearch triggerClassName="hidden border-border bg-surface-card sm:flex" />

          <div className="ml-0 flex items-center gap-0 sm:ml-1 sm:gap-1">
            <ThemeToggle />
            <HelpDropdown triggerClassName="hidden sm:flex" />
            <NotificationsDropdown triggerClassName="hidden sm:flex" />
            <ProfileDropdown triggerClassName="ml-1 border-border" />
          </div>
        </div>
      </div>
    </header>
  );
}
