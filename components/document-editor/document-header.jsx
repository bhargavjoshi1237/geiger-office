"use client";

import Image from "next/image";
import { Bell, HelpCircle, Search, Star, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { EditorMenuBar } from "@/components/document-editor/editor-menubar";
import { IconButton } from "@/components/document-editor/editor-controls";

const activeCollaborators = [
  { name: "Maya Patel", initials: "MP", color: "bg-[#365d4f] text-[#d7f4e8]" },
  { name: "Noah Kim", initials: "NK", color: "bg-[#564a72] text-[#ece4ff]" },
  { name: "Ava Chen", initials: "AC", color: "bg-[#6a493c] text-[#ffe5d8]" },
];

function DocumentHeader({ editor, toolbar }) {
  return (
    <header className="shrink-0 border-b border-[#333333] bg-[#202020] shadow-sm shadow-black/20">
      <div className="flex h-14 items-center gap-3 px-4 mt-2">
        <div className="mr-auto flex min-w-0 items-start gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2a2a2a] p-1.5">
            <Image src="/logo1.svg" alt="Geiger Office" width={28} height={28} className="h-7 w-7 object-contain" priority />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-semibold leading-7 text-white">Untitled document</h1>
              <IconButton label="Star document" className="h-7 w-7">
                <Star className="h-4 w-4" />
              </IconButton>
            </div>
            <EditorMenuBar editor={editor} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex -space-x-2" aria-label="People editing this document">
            {activeCollaborators.map((collaborator) => (
              <Avatar
                key={collaborator.name}
                className="h-8 w-8 border-2 border-[#202020] shadow-sm shadow-black/20"
                title={`${collaborator.name} is editing`}
              >
                <AvatarFallback className={`text-[10px] font-semibold ${collaborator.color}`}>
                  {collaborator.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <button
            type="button"
            className="group relative flex h-8 w-8 items-center justify-center rounded-md border border-[#333333] bg-[#242424] px-2 text-sm text-[#a3a3a3] shadow-sm transition-colors hover:border-[#474747] hover:bg-[#2a2a2a] hover:text-white sm:w-[240px] sm:justify-start sm:px-2.5"
          >
            <Search className="h-4 w-4 text-[#a3a3a3] transition-colors group-hover:text-white sm:mr-2" />
            <span className="hidden text-[#a3a3a3] transition-colors group-hover:text-white sm:inline-block">
              Search...
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

          <div className="ml-0 flex items-center gap-0 sm:ml-1 sm:gap-1">
            <button
              type="button"
              className="hidden h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white sm:flex"
              aria-label="Help"
            >
              <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#a3a3a3] transition-colors hover:bg-[#242424] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#333333] bg-[#242424] text-[#a3a3a3] transition-colors hover:border-[#474747] hover:bg-[#2a2a2a] hover:text-white"
              aria-label="Profile"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {toolbar}
    </header>
  );
}

export { DocumentHeader };
