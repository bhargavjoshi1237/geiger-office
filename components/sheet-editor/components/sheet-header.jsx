"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaveStatus } from "@/components/editor/save-status";
import { ProfileDropdown } from "@/components/editor/profile-dropdown";
import { NotificationsDropdown } from "@/components/editor/notifications-dropdown";
import { StarButton } from "@/components/editor/star-button";
import { CommandSearch } from "@/components/editor/command-search";
import { HelpDropdown } from "@/components/editor/help-dropdown";
import { ViewOnlyBadge } from "@/components/share/share-button";
import { SheetMenuBar } from "@/components/sheet-editor/components/sheet-menu-bar";

const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";

export function SheetHeader({ children, menuProps, name, status, onExportWorkbook, onRename, role, starred, onToggleStar }) {
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
    onRename(nextName);
    setIsEditingName(false);
  };

  return (
    <header className="shrink-0 border-b border-[#333333] bg-[#202020] shadow-sm shadow-black/20">
      <div className="mt-2 flex h-14 items-center gap-3 px-4">
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
              {isEditingName ? (
                <form
                  className="flex min-w-0 items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveName();
                  }}
                >
                  <Input
                    ref={nameInputRef}
                    aria-label="Spreadsheet name"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") cancelEditingName();
                    }}
                    className="h-8 w-[220px] max-w-[52vw] bg-[#161616] font-semibold text-white"
                  />
                  <Button type="submit" size="sm" className="h-8 px-3" disabled={!nameDraft.trim()}>
                    Save
                  </Button>
                </form>
              ) : (
                <h1
                  className="max-w-[240px] truncate text-sm font-semibold leading-7 text-white"
                  title="Double-click to rename"
                  onDoubleClick={startEditingName}
                >
                  {name}
                </h1>
              )}
              <StarButton
                starred={starred}
                onToggle={onToggleStar}
                label="Star spreadsheet"
                className="h-7 w-7"
              />
              <SaveStatus status={status} className="ml-1" />
              <ViewOnlyBadge role={role} className="ml-1" />
            </div>
            <SheetMenuBar {...menuProps} onExportWorkbook={onExportWorkbook} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CommandSearch placeholder="Search sheets..." />
          <HelpDropdown appName="Office Sheets" triggerClassName="hidden sm:flex" />
          <NotificationsDropdown />
          <ProfileDropdown triggerClassName="ml-1 bg-[#242424] hover:bg-[#2a2a2a]" />
        </div>
      </div>
      {children}
    </header>
  );
}
