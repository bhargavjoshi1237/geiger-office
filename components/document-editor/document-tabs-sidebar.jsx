"use client";

import { useState } from "react";
import { Collapsible } from "radix-ui";
import { Copy, FilePenLine, FileText, Heading, MoreVertical, PanelLeftClose, PanelLeftOpen, Plus, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import { IconButton } from "@/components/document-editor/editor-controls";
import { cn } from "@/lib/utils";

const tabOptions = [
  { label: "Rename tab", icon: FilePenLine },
  { label: "Duplicate tab", icon: Copy },
  { label: "New tab below", icon: Plus },
];

const menuItemClassName = "my-0.5 hover:bg-[#2f2f2f] focus:bg-[#333333]";

function TabOptionsDropdown() {
  return (
    <DropdownMenuContent align="end">
      {tabOptions.map(({ icon: Icon, label }) => (
        <DropdownMenuItem key={label} className={menuItemClassName}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="my-0.5 focus:bg-red-500/20" variant="destructive">
        <Trash2 className="h-4 w-4" />
        <span>Delete tab</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

function TabOptionsContextMenu() {
  return (
    <ContextMenuContent>
      <ContextMenuLabel>Tab 1</ContextMenuLabel>
      {tabOptions.map(({ icon: Icon, label }) => (
        <ContextMenuItem key={label} className={menuItemClassName}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </ContextMenuItem>
      ))}
      <ContextMenuSeparator />
      <ContextMenuItem className="my-0.5 bg-red-500/10 focus:bg-red-500/20" variant="destructive">
        <Trash2 className="h-4 w-4" />
        <span>Delete tab</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

function HeadingList({ headings }) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 space-y-0.5 border-l border-[#333333] pl-2">
      {headings.map((heading) => (
        <button
          key={heading.id}
          type="button"
          title={heading.text}
          className="flex h-7 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-xs text-[#a3a3a3] transition-colors hover:bg-[#2a2a2a] hover:text-white"
          style={{ paddingLeft: `${Math.max(8, heading.level * 6)}px` }}
        >
          <Heading className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{heading.text}</span>
        </button>
      ))}
    </div>
  );
}

function DocumentTabsSidebar({ headings = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Collapsible.Root open={isExpanded} onOpenChange={setIsExpanded} asChild>
      <Sidebar collapsed={!isExpanded} className="bg-[#202020]" aria-label="Document Tabs">
        <SidebarHeader className={cn(isExpanded ? "justify-between" : "justify-center px-2")}>
          {isExpanded ? (
            <>
              <IconButton label="Add tab" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </IconButton>
              <h2 className="min-w-0 flex-1 truncate text-center text-sm font-medium text-white">Document Tabs</h2>
              <div className="flex items-center gap-1">
                <Collapsible.Trigger asChild>
                  <IconButton label="Collapse document tabs" className="h-7 w-7">
                    <PanelLeftClose className="h-4 w-4" />
                  </IconButton>
                </Collapsible.Trigger>
              </div>
            </>
          ) : (
            <Collapsible.Trigger asChild>
              <IconButton label="Expand document tabs" className="h-9 w-9">
                <PanelLeftOpen className="h-4 w-4" />
              </IconButton>
            </Collapsible.Trigger>
          )}
        </SidebarHeader>
        <SidebarContent className={cn(!isExpanded && "px-2")}>
          <SidebarMenu>
            <div>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      "group flex items-center rounded-md bg-[#242424] text-white shadow-black/20",
                      isExpanded && "border border-[#333333]",
                    )}
                  >
                    <SidebarMenuButton
                      isActive
                      className={cn(
                        isExpanded ? "min-w-0 flex-1 justify-start pr-1" : "h-10 justify-center px-0",
                        "rounded-r-none hover:bg-[#2a2a2a]",
                      )}
                      aria-label="Tab 1"
                      title="Tab 1"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      {isExpanded && <span className="min-w-0 flex-1 truncate">Tab 1</span>}
                    </SidebarMenuButton>
                    {isExpanded && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Tab 1 options"
                            title="Tab 1 options"
                            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#333333] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#474747]"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <TabOptionsDropdown />
                      </DropdownMenu>
                    )}
                  </div>
                </ContextMenuTrigger>
                <TabOptionsContextMenu />
              </ContextMenu>
              {isExpanded && <HeadingList headings={headings} />}
            </div>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </Collapsible.Root>
  );
}

export { DocumentTabsSidebar };
