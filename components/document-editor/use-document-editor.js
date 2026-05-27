"use client";

import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Indent } from "@/components/document-editor/extensions/indent-extension";

function useDocumentEditor({ isEditing, onStateChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
        undoRedo: {
          depth: 25,
          newGroupDelay: 500,
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false }),
      Indent,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
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
