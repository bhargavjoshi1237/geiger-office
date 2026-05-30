import { FileText, Presentation, Sheet } from "lucide-react";

export const FILE_TYPES = {
  document: {
    type: "document",
    label: "Document",
    newLabel: "Document",
    defaultName: "Untitled document",
    icon: FileText,
    route: "/document",
    accent: "#4285f4",
  },
  spreadsheet: {
    type: "spreadsheet",
    label: "Spreadsheet",
    newLabel: "Spreadsheet",
    defaultName: "Untitled spreadsheet",
    icon: Sheet,
    route: "/sheet",
    accent: "#0f9d58",
  },
  presentation: {
    type: "presentation",
    label: "Presentation",
    newLabel: "Presentation",
    defaultName: "Untitled presentation",
    icon: Presentation,
    route: "/slide",
    accent: "#f4b400",
  },
};

export const FILE_TYPE_LIST = Object.values(FILE_TYPES);

export function getFileType(type) {
  return FILE_TYPES[type] ?? FILE_TYPES.document;
}

export const SHARE_ROLES = [
  { value: "viewer", label: "Viewer", verb: "view", hint: "Can read but not change anything." },
  { value: "commenter", label: "Commenter", verb: "comment on", hint: "Can read and add comments." },
  { value: "editor", label: "Editor", verb: "edit", hint: "Can make changes and share." },
];

export const ROLE_LABEL = {
  owner: "Owner",
  editor: "Editor",
  commenter: "Commenter",
  viewer: "Viewer",
};

export function canEditRole(role) {
  return role === "owner" || role === "editor";
}

export function shareableLink(file) {
  if (typeof window === "undefined") return editorHref(file);
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${window.location.origin}${basePath}${editorHref(file)}`;
}

export function editorHref(file) {
  const meta = getFileType(file.type);
  return `${meta.route}/${file.id}`;
}

export function timeAgo(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (seconds < 45) return "Just Now";

  const units = [
    ["Year", 31536000],
    ["Month", 2592000],
    ["Week", 604800],
    ["Day", 86400],
    ["Hour", 3600],
    ["Minute", 60],
  ];
  for (const [unit, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} Ago`;
  }
  return "Just Now";
}
