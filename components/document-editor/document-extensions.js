// Shared Tiptap extension set for the document editor. Kept in one place so the
// live editor (use-document-editor) and any offline conversion (e.g. importing
// an uploaded .docx/.html into Tiptap JSON via generateJSON) build against the
// exact same schema.

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

export function createDocumentExtensions() {
  return [
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
  ];
}
