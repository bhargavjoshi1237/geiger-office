"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentCanvas } from "@/components/document-editor/document-canvas";
import { DocumentHeader } from "@/components/document-editor/document-header";
import { DocumentTabsSidebar } from "@/components/document-editor/document-tabs-sidebar";
import { EditorToolbar } from "@/components/document-editor/editor-toolbar";
import { useDocumentFormatting } from "@/components/document-editor/formatting/use-document-formatting";
import { collectDocumentHeadings } from "@/components/document-editor/headings";
import { useDocumentEditor } from "@/components/document-editor/use-document-editor";
import { useOfficeFile } from "@/lib/persistence/use-office-file";

function isTiptapDoc(content) {
  return content && typeof content === "object" && content.type === "doc";
}

function apiBase() {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files`;
}

function DocumentEditor({ fileId }) {
  const router = useRouter();
  const [mode, setMode] = useState("edit");
  const [zoom, setZoom] = useState(100);
  const [, refreshToolbar] = useReducer((version) => version + 1, 0);
  const isEditing = mode === "edit";
  const editor = useDocumentEditor({ isEditing, onStateChange: refreshToolbar });
  const formatting = useDocumentFormatting(editor, { isEditing });
  const headings = collectDocumentHeadings(editor);

  const { file, initialContent, isLoading, status, canEdit, role, starred, toggleStar, saveContent, rename } =
    useOfficeFile(fileId);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!editor || isLoading || hydratedRef.current) return;
    if (isTiptapDoc(initialContent)) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
    hydratedRef.current = true;

    editor.setEditable(canEdit);
    if (!canEdit) return;

    const handleUpdate = () => saveContent(editor.getJSON());
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, isLoading, initialContent, canEdit, saveContent]);

  const fileActions = {
    "Make a copy": async () => {
      try {
        const res = await fetch(apiBase(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "document",
            name: `${file?.name ?? "Untitled document"} (copy)`,
            content: editor?.getJSON() ?? {},
          }),
        });
        if (!res.ok) return;
        const created = await res.json();
        router.push(`/document/${created.id}`);
      } catch {
        /* best-effort; stay on the current file */
      }
    },
    Rename: () => {
      const next = window.prompt("Rename document", file?.name ?? "Untitled document");
      if (next?.trim()) rename(next.trim());
    },
    "Move to trash": async () => {
      try {
        await fetch(`${apiBase()}/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trashed: true }),
        });
        router.push("/home");
      } catch {
        /* best-effort */
      }
    },
  };

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <DocumentHeader
        editor={editor}
        name={file?.name ?? "Untitled document"}
        onRename={rename}
        status={status}
        role={role}
        starred={starred}
        onToggleStar={toggleStar}
        fileActions={fileActions}
        toolbar={<EditorToolbar mode={mode} formatting={formatting} shareFileId={fileId} shareName={file?.name ?? "Untitled document"} zoom={zoom} onModeChange={setMode} onZoomChange={setZoom} />}
      />
      <div className="flex min-h-0 flex-1 bg-[#161616]">
        <DocumentTabsSidebar headings={headings} />
        <DocumentCanvas editor={editor} zoom={zoom} />
      </div>
    </div>
  );
}

export { DocumentEditor };
