"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  const startEditingName = () => {
    setNameDraft(name);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setNameDraft(name);
    setIsEditingName(false);
  };

  const saveName = () => {
    const nextName = nameDraft.trim();
    if (!nextName) return;
    onRename?.(nextName);
    setIsEditingName(false);
    if (nextName !== name) toast.success("Renamed", { description: nextName });
  };

  return (
    <header className="shrink-0 border-b border-border bg-surface-card shadow-sm shadow-black/20">
      <div className="flex h-14 items-center gap-3 px-4 mt-2">
        <div className="mr-auto flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/home"
                aria-label="Go to home"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-surface-hover"
              >
                <Image src={`${assetPrefix}/logo1.svg`} alt="Home" width={20} height={20} />
              </Link>
              {isEditingName ? (
                <form
                  className="flex min-w-0 items-center gap-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveName();
                  }}
                >
                  <input
                    ref={nameInputRef}
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") cancelEditingName();
                    }}
                    aria-label="Document name"
                    spellCheck={false}
                    className="h-8 w-[220px] max-w-[52vw] rounded-md border border-border-strong bg-background px-2 text-sm font-semibold text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!nameDraft.trim()}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Save document name"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingName}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                    aria-label="Cancel renaming document"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <h1
                  className="max-w-[240px] truncate text-sm font-semibold leading-7 text-white"
                  title="Double-click to rename"
                  onDoubleClick={startEditingName}
                >
                  {name || "Untitled document"}
                </h1>
              )}
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
          <CommandSearch placeholder="Search..." triggerClassName="hidden sm:flex" />

          <div className="ml-0 flex items-center gap-0 sm:ml-1 sm:gap-1">
            <HelpDropdown shortcuts={DOC_SHORTCUTS} appName="Office Docs" triggerClassName="hidden sm:flex" />
            <NotificationsDropdown triggerClassName="hidden sm:flex" />
            <ProfileDropdown triggerClassName="ml-1 bg-surface-active hover:bg-surface-hover" />
          </div>
        </div>
      </div>
      {toolbar}
    </header>
  );
}

export { DocumentHeader };
