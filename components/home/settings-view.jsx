"use client";

import { useEffect, useState } from "react";
import { Bell, Palette, Save, ShieldCheck, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const NOTIF_STORAGE_KEY = "office:notification-prefs";
const NOTIF_DEFAULTS = { comments: true, shares: true, updates: false };

const NOTIF_ROWS = [
  { key: "comments", label: "Comments & mentions" },
  { key: "shares", label: "Shares & invites" },
  { key: "updates", label: "Product updates" },
];

function useNotificationPrefs() {
  const [prefs, setPrefs] = useState(NOTIF_DEFAULTS);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) setPrefs({ ...NOTIF_DEFAULTS, ...JSON.parse(stored) });
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const toggle = (key) => {
    setPrefs((current) => {
      const next = { ...current, [key]: !current[key] };
      try {
        window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore unwritable storage */
      }
      return next;
    });
  };

  return { prefs, toggle };
}

function ToggleRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between border-t border-[#2a2a2a] py-2.5 text-sm first:border-t-0 first:pt-0">
      <span className="text-[#a3a3a3]">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function NotificationsCard() {
  const { prefs, toggle } = useNotificationPrefs();
  return (
    <Card title="Notifications" description="Choose what you're emailed about." Icon={Bell}>
      {NOTIF_ROWS.map((row) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          checked={prefs[row.key]}
          onCheckedChange={() => toggle(row.key)}
        />
      ))}
    </Card>
  );
}

function Card({ title, description, Icon, children }) {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a] text-[#a3a3a3]">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-[#737373]">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-t border-[#2a2a2a] py-2.5 text-sm first:border-t-0 first:pt-0">
      <span className="text-[#a3a3a3]">{label}</span>
      <span className="text-[#e7e7e7]">{value}</span>
    </div>
  );
}

export function SettingsView({ email }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Profile" description="Your account across the Geiger suite." Icon={UserCircle}>
        <Row label="Email" value={email || "—"} />
        <Row label="Plan" value="Workspace" />
      </Card>

      <Card title="Editing" description="How your files save and behave." Icon={Save}>
        <Row label="Autosave" value="On" />
        <Row label="Save interval" value="1s after a change" />
      </Card>

      <Card title="Appearance" description="Theme and density." Icon={Palette}>
        <Row label="Theme" value="Dark" />
        <Row label="Accent" value="System" />
      </Card>

      <Card title="Sharing & privacy" description="Defaults for new files." Icon={ShieldCheck}>
        <Row label="Default access" value="Restricted" />
        <Row label="Link access" value="Sign-in required" />
      </Card>

      <NotificationsCard />
    </div>
  );
}
