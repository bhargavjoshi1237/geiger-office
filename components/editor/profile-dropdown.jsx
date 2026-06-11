"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CachedAvatarImage } from "@/components/cached-avatar-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getUser, invalidateUserCache } from "@/lib/supabase/user";
import { createClient } from "@/utils/supabase/client";
import { clearProfileImageCache } from "@/lib/profile-image-cache";

export function ProfileDropdown({ triggerClassName, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  const pfpUrl = user?.id
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pfp/${user.id}/latest.jpg`
    : null;

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@email.com";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fallbackInitials = initials || "U";

  async function handleSignOut() {
    clearProfileImageCache();
    const supabase = createClient();
    await supabase.auth.signOut();
    invalidateUserCache();
    router.push("/");
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {children || (
          <button
            type="button"
            aria-label="Profile"
            className={cn(
              "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border transition-colors hover:border-border-strong",
              triggerClassName
            )}
          >
            <Avatar className="size-full">
              {pfpUrl && (
                <CachedAvatarImage
                  src={pfpUrl}
                  cacheKey={user.id}
                  alt={displayName}
                />
              )}
              <AvatarFallback className="border-0 bg-border-strong text-[10px] font-semibold text-white">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[100] w-[150px] min-w-[150px] max-w-[208px] bg-surface-subtle border-surface-active shadow-xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem
            asChild
            className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
          >
            <Link href="/home">
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleSignOut}
            className="text-text-secondary focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
