"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CircleUserRound,
  Settings,
  Wallet,
  LogOut,
  UsersRound,
  LifeBuoy,
  MessageCircle,
  ShieldCheck,
  BookMarked,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, invalidateUserCache } from "@/lib/supabase/user";
import { createClient } from "@/utils/supabase/client";

const surfaceStyle = {
  backgroundColor: "#1a1a1a",
  borderColor: "#2a2a2a",
  color: "#ffffff",
};

const itemBaseStyle =
  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-default transition-colors outline-none";

const itemHoverStyle =
  "hover:bg-[#242424] focus:bg-[#242424] text-[#a3a3a3] hover:text-white focus:text-white";

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
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    invalidateUserCache();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button
            type="button"
            aria-label="Profile"
            className={cn(
              "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#333333] transition-colors hover:border-[#474747]",
              triggerClassName
            )}
          >
            <Avatar className="size-full">
              {pfpUrl && <AvatarImage src={pfpUrl} alt={displayName} />}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-semibold border-0">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 p-0 rounded-xl border shadow-xl"
        style={surfaceStyle}
        sideOffset={8}
        align="end"
      >
        <div className="p-4 pb-3">
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-[#333333]">
                {pfpUrl && <AvatarImage src={pfpUrl} alt={displayName} />}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-semibold border-0">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate">
                  {displayName}
                </span>
                <span className="text-xs text-[#a3a3a3] truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </div>

        <DropdownMenuSeparator className="bg-[#2a2a2a] mx-0" />

        <div className="p-1.5">
          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <CircleUserRound className="size-4 text-[#a3a3a3]" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <UsersRound className="size-4 text-[#a3a3a3]" />
            <span>Organization Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <Wallet className="size-4 text-[#a3a3a3]" />
            <span>Billing &amp; Plans</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <Settings className="size-4 text-[#a3a3a3]" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <ShieldCheck className="size-4 text-[#a3a3a3]" />
            <span>Security</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[#2a2a2a] my-1" />

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <BookMarked className="size-4 text-[#a3a3a3]" />
            <span>Documentation</span>
            <ExternalLink className="size-3 ml-auto text-[#737373]" />
          </DropdownMenuItem>

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <MessageCircle className="size-4 text-[#a3a3a3]" />
            <span>Send Feedback</span>
          </DropdownMenuItem>

          <DropdownMenuItem className={`${itemBaseStyle} ${itemHoverStyle}`}>
            <LifeBuoy className="size-4 text-[#a3a3a3]" />
            <span>Help &amp; Support</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleSignOut}
            className={`${itemBaseStyle} hover:bg-[#2a1a1a] focus:bg-[#2a1a1a] text-[#a3a3a3] hover:text-red-400 focus:text-red-400 group`}
          >
            <LogOut className="size-4 group-hover:text-red-400" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>

        <div className="px-4 py-2.5 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between text-[11px] text-[#737373]">
            <div className="flex items-center gap-1">
              <span
                role="img"
                aria-label="Geiger Studio Logo"
                className="size-4 mr-1 rounded-sm bg-[#a3a3a3] [mask-image:url(/logo1.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url(/logo1.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
              />
            <span className="text-xs text-[#a3a3a3] font-medium">Geiger Studio</span>
              </div>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Online
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
