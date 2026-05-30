"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Globe,
  Link2,
  Loader2,
  Lock,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABEL, SHARE_ROLES, shareableLink } from "@/lib/files/file-meta";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function basePath() {
  const isProd = process.env.NODE_ENV === "production";
  return isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
}

function apiBase() {
  return `${basePath()}/api/files`;
}

function searchUsersUrl(q) {
  return `${basePath()}/api/users/search?q=${encodeURIComponent(q)}`;
}

function initialFor(email) {
  return (email?.trim()?.[0] ?? "?").toUpperCase();
}

function RoleMenu({ value, onChange, disabled, onRemove }) {
  if (disabled) {
    return <span className="px-2 text-sm text-[#a3a3a3]">{ROLE_LABEL[value] ?? value}</span>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-[#d4d4d4] transition-colors hover:bg-[#2a2a2a]"
        >
          {ROLE_LABEL[value] ?? value}
          <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {SHARE_ROLES.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onSelect={() => onChange(role.value)}
            className="flex-col items-start gap-0.5"
          >
            <span className="flex w-full items-center justify-between">
              {role.label}
              {value === role.value ? <Check className="h-4 w-4" /> : null}
            </span>
            <span className="text-xs text-[#737373]">{role.hint}</span>
          </DropdownMenuItem>
        ))}
        {onRemove ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onRemove}>
              Remove access
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ShareDialog({ open, onOpenChange, file }) {
  const fileId = file?.id;
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const load = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/${fileId}/share`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      setState(await res.json());
    } catch (err) {
      setError(err.message || "Failed to load sharing settings");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (open) {
      setInviteEmail("");
      setInviteRole("editor");
      setCopied(false);
      load();
    }
  }, [open, load]);

  const isOwner = state?.isOwner;
  const fileForLink = state?.file ?? file;

  useEffect(() => {
    const q = inviteEmail.trim();
    if (!isOwner || !suggestOpen || q.length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(searchUsersUrl(q));
        const data = await res.json();
        const taken = new Set([
          (state?.me?.email ?? "").toLowerCase(),
          ...(state?.shares ?? []).map((s) => s.email.toLowerCase()),
        ]);
        setSuggestions((data.users ?? []).filter((u) => !taken.has((u.email ?? "").toLowerCase())));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [inviteEmail, suggestOpen, isOwner, state]);

  const addPerson = async (rawEmail, userId = null) => {
    const email = (rawEmail ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/${fileId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setState((prev) => ({
        ...prev,
        shares: [...prev.shares.filter((s) => s.email !== data.email), data],
      }));
      setInviteEmail("");
      setSuggestions([]);
      setSuggestOpen(false);
    } catch (err) {
      setError(err.message || "Failed to add person");
    } finally {
      setBusy(false);
    }
  };

  const changeShareRole = async (share, role) => {
    setState((prev) => ({
      ...prev,
      shares: prev.shares.map((s) => (s.id === share.id ? { ...s, role } : s)),
    }));
    await fetch(`${apiBase()}/${fileId}/share/${share.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  };

  const removeShare = async (share) => {
    setState((prev) => ({ ...prev, shares: prev.shares.filter((s) => s.id !== share.id) }));
    await fetch(`${apiBase()}/${fileId}/share/${share.id}`, { method: "DELETE" });
  };

  const updateGeneralAccess = async (patch) => {
    setState((prev) => ({ ...prev, ...patch }));
    await fetch(`${apiBase()}/${fileId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        "visibility" in patch
          ? { visibility: patch.visibility }
          : { link_role: patch.linkRole },
      ),
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink(fileForLink));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy the link");
    }
  };

  const isLink = state?.visibility === "link";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(512px,calc(100vw-32px))] p-0">
        <div className="border-b border-[#2a2a2a] p-5">
          <DialogTitle className="truncate pr-8">
            Share {fileForLink?.name ? `“${fileForLink.name}”` : "file"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {isOwner
              ? "Invite people or create a link others can open."
              : "You can open this file. Only the owner can change who has access."}
          </DialogDescription>
        </div>

        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center text-[#737373]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto p-5 scrollbar-subtle">
            {isOwner ? (
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <input
                    value={inviteEmail}
                    onChange={(event) => {
                      setInviteEmail(event.target.value);
                      setSuggestOpen(true);
                    }}
                    onFocus={() => setSuggestOpen(true)}
                    onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addPerson(inviteEmail);
                      if (event.key === "Escape") setSuggestOpen(false);
                    }}
                    placeholder="Add people by email"
                    type="email"
                    autoComplete="off"
                    className="h-9 w-full rounded-md border border-[#333333] bg-[#161616] px-3 text-sm text-white outline-none transition-colors placeholder:text-[#737373] focus:border-[#474747]"
                  />
                  {suggestOpen && (searching || suggestions.length > 0) ? (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-[#333333] bg-[#202020] py-1 shadow-xl shadow-black/40">
                      {suggestions.length === 0 && searching ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#737373]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Searching…
                        </div>
                      ) : null}
                      {suggestions.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => addPerson(u.email, u.id)}
                          className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors hover:bg-[#2a2a2a]"
                        >
                          <Avatar className="h-7 w-7">
                            {u.avatar_url ? <AvatarImage src={u.avatar_url} alt="" /> : null}
                            <AvatarFallback className="text-[11px] text-white">
                              {initialFor(u.name || u.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-white">{u.name}</span>
                            <span className="block truncate text-xs text-[#737373]">{u.email}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <RoleMenu value={inviteRole} onChange={setInviteRole} />
                <Button size="sm" className="h-9" disabled={busy || !inviteEmail.trim()} onClick={() => addPerson(inviteEmail)}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Invite
                </Button>
              </div>
            ) : null}

            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#737373]">
                People with access
              </p>
              <ul className="flex flex-col">
                <li className="flex items-center gap-3 py-2">
                  <Avatar>
                    <AvatarFallback className="text-xs text-white">
                      {initialFor(isOwner ? state?.me?.email : "owner")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">
                      {isOwner ? `${state?.me?.email ?? "You"} (you)` : "Owner"}
                    </p>
                  </div>
                  <span className="px-2 text-sm text-[#a3a3a3]">Owner</span>
                </li>

                {(state?.shares ?? []).map((share) => (
                  <li key={share.id} className="flex items-center gap-3 py-2">
                    <Avatar>
                      <AvatarFallback className="text-xs text-white">{initialFor(share.email)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{share.email}</p>
                    </div>
                    <RoleMenu
                      value={share.role}
                      disabled={!isOwner}
                      onChange={(role) => changeShareRole(share, role)}
                      onRemove={() => removeShare(share)}
                    />
                  </li>
                ))}
                {isOwner && (state?.shares ?? []).length === 0 ? (
                  <li className="py-2 text-sm text-[#737373]">No one else has been added yet.</li>
                ) : null}
              </ul>
            </div>

            <div className="mt-5 border-t border-[#2a2a2a] pt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#737373]">
                General access
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    isLink ? "bg-emerald-500/15 text-emerald-300" : "bg-[#2a2a2a] text-[#a3a3a3]",
                  )}
                >
                  {isLink ? <Globe className="h-[18px] w-[18px]" /> : <Lock className="h-[18px] w-[18px]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <GeneralAccessMenu
                    value={state?.visibility ?? "restricted"}
                    disabled={!isOwner}
                    onChange={(visibility) => updateGeneralAccess({ visibility })}
                  />
                  <p className="text-xs text-[#737373]">
                    {isLink
                      ? "Anyone with the link who is signed in can open this file."
                      : "Only people added above can open this file."}
                  </p>
                </div>
                {isLink ? (
                  <RoleMenu
                    value={state?.linkRole ?? "viewer"}
                    disabled={!isOwner}
                    onChange={(linkRole) => updateGeneralAccess({ linkRole })}
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-[#2a2a2a] p-4">
          <Button variant="outline" size="sm" className="h-9" onClick={copyLink} disabled={!fileForLink}>
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {copied ? "Link copied" : "Copy link"}
          </Button>
          <Button size="sm" className="h-9" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GeneralAccessMenu({ value, onChange, disabled }) {
  const label = value === "link" ? "Anyone with the link" : "Restricted";
  if (disabled) {
    return <p className="text-sm font-medium text-white">{label}</p>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2a2a]"
        >
          {label}
          <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuItem onSelect={() => onChange("restricted")} className="flex-col items-start gap-0.5">
          <span className="flex w-full items-center justify-between">
            Restricted
            {value === "restricted" ? <Check className="h-4 w-4" /> : null}
          </span>
          <span className="text-xs text-[#737373]">Only people added can open.</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange("link")} className="flex-col items-start gap-0.5">
          <span className="flex w-full items-center justify-between">
            Anyone with the link
            {value === "link" ? <Check className="h-4 w-4" /> : null}
          </span>
          <span className="text-xs text-[#737373]">Any signed-in person with the link.</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
