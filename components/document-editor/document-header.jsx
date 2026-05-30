"use client";

import Image from "next/image";
import Link from "next/link";
import { EditorMenuBar } from "@/components/document-editor/editor-menubar";
import { ProfileDropdown } from "@/components/editor/profile-dropdown";
import { NotificationsDropdown } from "@/components/editor/notifications-dropdown";
import { StarButton } from "@/components/editor/star-button";
import { CommandSearch } from "@/components/editor/command-search";
import { HelpDropdown } from "@/components/editor/help-dropdown";
import { SaveStatus } from "@/components/editor/save-status";
import { ViewOnlyBadge } from "@/components/share/share-button";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

const DOC_SHORTCUTS = [
  { keys: ["Ctrl", "B"], label: "Bold" },
  { keys: ["Ctrl", "I"], label: "Italic" },
  { keys: ["Ctrl", "U"], label: "Underline" },
];

function DocumentHeader({ editor, toolbar, name = "Untitled document", onRename, status, role, starred, onToggleStar, fileActions }) {
  return (
    <header className="shrink-0 border-b border-[#333333] bg-[#202020] shadow-sm shadow-black/20">
      <div className="flex h-14 items-center gap-3 px-4 mt-2">
        <div className="mr-auto flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/home"
                aria-label="Go to home"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[#2a2a2a]"
              >
                <Image src={`${assetPrefix}/logo1.svg`} alt="Home" width={20} height={20} />
              </Link>
              <div className="grid min-w-0 max-w-[52vw] items-center">
                <span
                  aria-hidden="true"
                  className="pointer-events-none invisible col-start-1 row-start-1 whitespace-pre rounded-md border border-transparent px-1 text-sm font-semibold leading-7"
                >
                  {name || "Untitled document"}
                </span>
                <input
                  value={name}
                  onChange={(event) => onRename?.(event.target.value)}
                  aria-label="Document name"
                  spellCheck={false}
                  className="col-start-1 row-start-1 w-full rounded-md border border-transparent bg-transparent px-1 text-sm font-semibold leading-7 text-white outline-none transition-colors hover:border-[#3a3a3a] focus:border-[#474747] focus:bg-[#161616]"
                />
              </div>
              <StarButton
                starred={starred}
                onToggle={onToggleStar}
                label="Star document"
                className="h-7 w-7"
              />
              <SaveStatus status={status} className="ml-1" />
              <ViewOnlyBadge role={role} className="ml-1" />
            </div>
            <EditorMenuBar editor={editor} fileActions={fileActions} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CommandSearch placeholder="Search..." />

          <div className="ml-0 flex items-center gap-0 sm:ml-1 sm:gap-1">
            <HelpDropdown shortcuts={DOC_SHORTCUTS} appName="Office Docs" triggerClassName="hidden sm:flex" />
            <NotificationsDropdown />
            <ProfileDropdown triggerClassName="ml-1 bg-[#242424] hover:bg-[#2a2a2a]" />
          </div>
        </div>
      </div>
      {toolbar}
    </header>
  );
}

export { DocumentHeader };
