"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Sidebar({ className, collapsed = false, ...props }) {
  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={cn(
        "hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-14" : "w-[288px]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }) {
  return <div data-slot="sidebar-header" className={cn("flex items-center gap-2 p-3", className)} {...props} />;
}

function SidebarContent({ className, ...props }) {
  return <div data-slot="sidebar-content" className={cn("min-h-0 flex-1 px-3 pb-3", className)} {...props} />;
}

function SidebarMenu({ className, ...props }) {
  return <div data-slot="sidebar-menu" className={cn("flex flex-col gap-1", className)} {...props} />;
}

function SidebarMenuButton({ className, isActive, ...props }) {
  return (
    <button
      type="button"
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-white",
        className,
      )}
      {...props}
    />
  );
}

export { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton };
