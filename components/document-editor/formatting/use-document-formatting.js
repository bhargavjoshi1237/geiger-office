"use client";

import { useCallback, useState } from "react";
import { DEFAULT_HIGHLIGHT_COLOR } from "@/components/document-editor/formatting/color-options";
import { getContentOption } from "@/components/document-editor/formatting/content-options";
import { DEFAULT_FONT_FAMILY, getFontFamilyOption, getFontFamilyOptionByValue } from "@/components/document-editor/formatting/font-family-options";
import { DEFAULT_FONT_SIZE, clampFontSize, parseFontSize, toFontSizeValue } from "@/components/document-editor/formatting/font-size-options";
import { TEXT_EFFECTS, getTextEffect } from "@/components/document-editor/formatting/text-effects";

function isTextEffectActive(editor, effect) {
  if (!editor) {
    return false;
  }

  const markType = editor.schema.marks[effect.mark];

  if (!markType) {
    return false;
  }

  if (!editor.state.selection.empty) {
    return editor.isActive(effect.mark);
  }

  const cursorMarks = editor.state.storedMarks || editor.state.selection.$from.marks();

  return Boolean(markType.isInSet(cursorMarks));
}

function readActiveEffects(editor) {
  return TEXT_EFFECTS.reduce((activeEffects, effect) => {
    activeEffects[effect.id] = isTextEffectActive(editor, effect);
    return activeEffects;
  }, {});
}

function readFormattingState(editor) {
  const textStyleAttributes = editor?.getAttributes("textStyle") ?? {};
  const activeHeading = [1, 2, 3, 4, 5, 6].find((level) => editor?.isActive("heading", { level }));
  const activeFontFamilyOption = getFontFamilyOptionByValue(textStyleAttributes.fontFamily);

  return {
    activeEffects: readActiveEffects(editor),
    activeAlignment: editor?.getAttributes("paragraph").textAlign ?? editor?.getAttributes("heading").textAlign ?? "left",
    activeContentId: activeHeading ? `heading-${activeHeading}` : "paragraph",
    activeContentLabel: activeHeading ? `Heading ${activeHeading}` : "Normal text",
    activeFontFamily: textStyleAttributes.fontFamily ?? null,
    activeFontFamilyLabel: activeFontFamilyOption?.label ?? DEFAULT_FONT_FAMILY,
    activeHighlightColor: editor?.getAttributes("highlight").color ?? null,
    activeFontSize: parseFontSize(textStyleAttributes.fontSize),
    activeLinkUrl: editor?.getAttributes("link").href ?? "",
    isBulletListActive: Boolean(editor?.isActive("bulletList")),
    isOrderedListActive: Boolean(editor?.isActive("orderedList")),
    isTaskListActive: Boolean(editor?.isActive("taskList")),
    activeTextColor: textStyleAttributes.color ?? null,
    canRedo: Boolean(editor?.can().redo()),
    canUndo: Boolean(editor?.can().undo()),
  };
}

function useDocumentFormatting(editor, { isEditing }) {
  const [paintFormat, setPaintFormat] = useState(null);

  const toggleTextEffect = useCallback(
    (effect) => {
      if (!isEditing || !editor) {
        return;
      }

      editor.chain().focus()[effect.command]().run();
    },
    [editor, isEditing],
  );

  const toggleTextEffectById = useCallback(
    (effectId) => {
      const effect = getTextEffect(effectId);

      if (!effect) {
        return;
      }

      toggleTextEffect(effect);
    },
    [toggleTextEffect],
  );

  const setTextColor = useCallback(
    (color) => {
      if (!isEditing || !editor) {
        return;
      }

      const chain = editor.chain().focus();

      if (color) {
        chain.setColor(color).run();
      } else {
        chain.unsetColor().run();
      }
    },
    [editor, isEditing],
  );

  const setHighlightColor = useCallback(
    (color = DEFAULT_HIGHLIGHT_COLOR) => {
      if (!isEditing || !editor) {
        return;
      }

      const chain = editor.chain().focus();

      if (color) {
        chain.setHighlight({ color }).run();
      } else {
        chain.unsetHighlight().run();
      }
    },
    [editor, isEditing],
  );

  const setContentType = useCallback(
    (optionId) => {
      if (!isEditing || !editor) {
        return;
      }

      const option = getContentOption(optionId);

      if (!option) {
        return;
      }

      const chain = editor.chain().focus();

      if (option.type === "paragraph") {
        chain.setParagraph().run();
      } else {
        chain.setHeading({ level: option.level }).run();
      }
    },
    [editor, isEditing],
  );

  const setFontFamily = useCallback(
    (optionId) => {
      if (!isEditing || !editor) {
        return;
      }

      const option = getFontFamilyOption(optionId);
      const chain = editor.chain().focus();

      if (option) {
        chain.setFontFamily(option.value).run();
      } else {
        chain.unsetFontFamily().run();
      }
    },
    [editor, isEditing],
  );

  const setFontSize = useCallback(
    (size) => {
      if (!isEditing || !editor) {
        return;
      }

      const normalizedSize = Number.parseInt(size, 10);

      if (!Number.isFinite(normalizedSize)) {
        editor.chain().focus().unsetFontSize().run();
        return;
      }

      editor.chain().focus().setFontSize(toFontSizeValue(normalizedSize)).run();
    },
    [editor, isEditing],
  );

  const stepFontSize = useCallback(
    (step) => {
      if (!isEditing || !editor) {
        return;
      }

      const currentSize = parseFontSize(editor.getAttributes("textStyle").fontSize ?? DEFAULT_FONT_SIZE);
      setFontSize(clampFontSize(currentSize + step));
    },
    [editor, isEditing, setFontSize],
  );

  const undo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const redo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const printDocument = useCallback(() => {
    window.print();
  }, []);

  const setLink = useCallback(
    ({ href, text }) => {
      if (!isEditing || !editor) {
        return;
      }

      const nextHref = href.trim();
      const nextText = text.trim();

      if (!nextHref) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      if (nextText) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: nextText,
            marks: [{ type: "link", attrs: { href: nextHref } }],
          })
          .run();
        return;
      }

      editor.chain().focus().extendMarkRange("link").setLink({ href: nextHref }).run();
    },
    [editor, isEditing],
  );

  const insertImage = useCallback(
    ({ src, alt = "" }) => {
      if (!isEditing || !editor || !src?.trim()) {
        return;
      }

      editor.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run();
    },
    [editor, isEditing],
  );

  const setTextAlignment = useCallback(
    (alignment) => {
      if (!isEditing || !editor) {
        return;
      }

      editor.chain().focus().setTextAlign(alignment).run();
    },
    [editor, isEditing],
  );

  const decreaseIndent = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    const chain = editor.chain().focus();

    if (editor.isActive("listItem")) {
      chain.liftListItem("listItem").run();
    } else {
      chain.decreaseIndent().run();
    }
  }, [editor, isEditing]);

  const increaseIndent = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    const chain = editor.chain().focus();

    if (editor.isActive("listItem")) {
      chain.sinkListItem("listItem").run();
    } else {
      chain.increaseIndent().run();
    }
  }, [editor, isEditing]);

  const toggleBulletList = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    editor.chain().focus().toggleBulletList().run();
  }, [editor, isEditing]);

  const toggleOrderedList = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    editor.chain().focus().toggleOrderedList().run();
  }, [editor, isEditing]);

  const toggleTaskList = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    editor.chain().focus().toggleTaskList().run();
  }, [editor, isEditing]);

  const clearFormatting = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    editor.chain().focus().unsetAllMarks().unsetTextAlign().setParagraph().run();
  }, [editor, isEditing]);

  const capturePaintFormat = useCallback(() => {
    if (!isEditing || !editor) {
      return;
    }

    setPaintFormat({
      alignment: editor.getAttributes("paragraph").textAlign ?? editor.getAttributes("heading").textAlign ?? "left",
      bold: editor.isActive("bold"),
      color: editor.getAttributes("textStyle").color ?? null,
      fontFamily: editor.getAttributes("textStyle").fontFamily ?? null,
      fontSize: editor.getAttributes("textStyle").fontSize ?? null,
      highlight: editor.getAttributes("highlight").color ?? null,
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
    });
  }, [editor, isEditing]);

  const applyPaintFormat = useCallback(() => {
    if (!isEditing || !editor || !paintFormat) {
      capturePaintFormat();
      return;
    }

    let chain = editor.chain().focus().unsetAllMarks().setTextAlign(paintFormat.alignment);

    if (paintFormat.bold) {
      chain = chain.setMark("bold");
    }

    if (paintFormat.italic) {
      chain = chain.setMark("italic");
    }

    if (paintFormat.underline) {
      chain = chain.setMark("underline");
    }

    if (paintFormat.color) {
      chain = chain.setColor(paintFormat.color);
    }

    if (paintFormat.fontFamily) {
      chain = chain.setFontFamily(paintFormat.fontFamily);
    }

    if (paintFormat.fontSize) {
      chain = chain.setFontSize(paintFormat.fontSize);
    }

    if (paintFormat.highlight) {
      chain = chain.setHighlight({ color: paintFormat.highlight });
    }

    chain.run();
    setPaintFormat(null);
  }, [capturePaintFormat, editor, isEditing, paintFormat]);

  const formattingState = isEditing ? readFormattingState(editor) : readFormattingState(null);

  return {
    ...formattingState,
    applyPaintFormat,
    clearFormatting,
    decreaseFontSize: () => stepFontSize(-1),
    decreaseIndent,
    increaseFontSize: () => stepFontSize(1),
    increaseIndent,
    isPaintFormatActive: Boolean(paintFormat),
    printDocument,
    redo,
    setContentType,
    setFontFamily,
    setHighlightColor,
    setLink,
    setFontSize,
    insertImage,
    setTextColor,
    setTextAlignment,
    toggleBulletList,
    toggleOrderedList,
    toggleTaskList,
    toggleTextEffect: toggleTextEffectById,
    undo,
  };
}

export { useDocumentFormatting };
