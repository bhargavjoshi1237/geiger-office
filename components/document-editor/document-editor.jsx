"use client";

import { useReducer, useState } from "react";
import { DocumentCanvas } from "@/components/document-editor/document-canvas";
import { DocumentHeader } from "@/components/document-editor/document-header";
import { DocumentTabsSidebar } from "@/components/document-editor/document-tabs-sidebar";
import { EditorToolbar } from "@/components/document-editor/editor-toolbar";
import { useDocumentFormatting } from "@/components/document-editor/formatting/use-document-formatting";
import { collectDocumentHeadings } from "@/components/document-editor/headings";
import { useDocumentEditor } from "@/components/document-editor/use-document-editor";

function DocumentEditor() {
  const [mode, setMode] = useState("edit");
  const [zoom, setZoom] = useState(100);
  const [, refreshToolbar] = useReducer((version) => version + 1, 0);
  const isEditing = mode === "edit";
  const editor = useDocumentEditor({ isEditing, onStateChange: refreshToolbar });
  const formatting = useDocumentFormatting(editor, { isEditing });
  const headings = collectDocumentHeadings(editor);

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <DocumentHeader
        editor={editor}
        toolbar={<EditorToolbar mode={mode} formatting={formatting} zoom={zoom} onModeChange={setMode} onZoomChange={setZoom} />}
      />
      <div className="flex min-h-0 flex-1 bg-[#161616]">
        <DocumentTabsSidebar headings={headings} />
        <DocumentCanvas editor={editor} zoom={zoom} />
      </div>
    </div>
  );
}

export { DocumentEditor };
