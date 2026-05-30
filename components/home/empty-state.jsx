"use client";

import { FilePlus2, FileText, Presentation, Sheet, Star, Trash2, Users } from "lucide-react";

const CONFIG = {
  recent: {
    icon: FilePlus2,
    title: "No files yet",
    body: "Create a document, spreadsheet, or presentation to get started.",
  },
  starred: {
    icon: Star,
    title: "No starred files",
    body: "Star files to find them quickly here.",
  },
  shared: {
    icon: Users,
    title: "Nothing shared with you",
    body: "Files other people share with you will show up here.",
  },
  document: {
    icon: FileText,
    title: "No documents",
    body: "Create a document to get started.",
  },
  spreadsheet: {
    icon: Sheet,
    title: "No spreadsheets",
    body: "Create a spreadsheet to get started.",
  },
  presentation: {
    icon: Presentation,
    title: "No presentations",
    body: "Create a presentation to get started.",
  },
  trash: {
    icon: Trash2,
    title: "Trash is empty",
    body: "Files you move to trash will appear here.",
  },
  search: {
    icon: FilePlus2,
    title: "No matches",
    body: "No files match your search.",
  },
};

export function EmptyState({ variant = "recent" }) {
  const { icon: Icon, title, body } = CONFIG[variant] ?? CONFIG.recent;
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a]">
        <Icon className="h-6 w-6 text-[#737373]" />
      </div>
      <h2 className="text-sm font-medium text-[#e7e7e7]">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-[#737373]">{body}</p>
    </div>
  );
}
