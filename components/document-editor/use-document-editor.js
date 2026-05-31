"use client";

import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import { createDocumentExtensions } from "@/components/document-editor/document-extensions";

function useDocumentEditor({ isEditing, onStateChange }) {
  const editor = useEditor({
    extensions: createDocumentExtensions(),
    content: "",
    editable: isEditing,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Document body",
        class: "document-editor-content min-h-[760px] cursor-text text-base leading-6 text-white outline-none",
      },
    },
    onSelectionUpdate: onStateChange,
    onTransaction: onStateChange,
    onUpdate: onStateChange,
  });

  useEffect(() => {
    editor?.setEditable(isEditing);
  }, [editor, isEditing]);

  return editor;
}

export { useDocumentEditor };
