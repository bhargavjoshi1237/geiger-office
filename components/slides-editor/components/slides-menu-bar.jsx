"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { slideMenus } from "@/components/slides-editor/data/menu-config";

export function SlidesMenuBar({ onAction }) {
  return (
    <nav className="hidden items-center gap-1 text-sm text-white md:flex" aria-label="Slides menu">
      {slideMenus.map((menu) => (
        <DropdownMenu key={menu.label}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 rounded px-2 py-2 text-sm font-normal text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white focus-visible:ring-[#474747] data-[state=open]:bg-[#2a2a2a] data-[state=open]:text-white"
            >
              {menu.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {menu.groups.map((group, groupIndex) => (
              <div key={`${menu.label}-${groupIndex}`}>
                {groupIndex > 0 && <DropdownMenuSeparator />}
                {group.map((item) => {
                  if (item.type === "download") {
                    return (
                      <DropdownMenuSub key={item.label}>
                        <DropdownMenuSubTrigger>
                          <span>{item.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="min-w-52">
                          <DropdownMenuItem onSelect={() => onAction("export-pptx")}>
                            PowerPoint (.pptx)
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  if (item.hasSubmenu) {
                    return (
                      <DropdownMenuSub key={item.label}>
                        <DropdownMenuSubTrigger>
                          <span>{item.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem disabled>Coming soon</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  return (
                    <DropdownMenuItem
                      key={item.label}
                      disabled={!item.action}
                      onSelect={() => item.action && onAction(item.action)}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}
