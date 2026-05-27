"use client";

import { Extension } from "@tiptap/core";

const INDENTABLE_NODE_TYPES = ["paragraph", "heading"];
const INDENT_SIZE_REM = 1.5;
const MIN_INDENT = 0;
const MAX_INDENT = 8;

function clampIndent(indent) {
  return Math.min(MAX_INDENT, Math.max(MIN_INDENT, indent));
}

function getCurrentIndentNode(state) {
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);

    if (INDENTABLE_NODE_TYPES.includes(node.type.name)) {
      return node;
    }
  }

  return null;
}

const Indent = Extension.create({
  name: "indent",

  addGlobalAttributes() {
    return [
      {
        types: INDENTABLE_NODE_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => Number.parseInt(element.getAttribute("data-indent") ?? "0", 10) || 0,
            renderHTML: (attributes) => {
              const indent = clampIndent(attributes.indent ?? 0);

              if (indent === 0) {
                return {};
              }

              return {
                "data-indent": indent,
                style: `margin-left: ${indent * INDENT_SIZE_REM}rem`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      decreaseIndent:
        () =>
        ({ state, commands }) => {
          const node = getCurrentIndentNode(state);

          if (!node) {
            return false;
          }

          return commands.updateAttributes(node.type.name, {
            indent: clampIndent((node.attrs.indent ?? 0) - 1),
          });
        },
      increaseIndent:
        () =>
        ({ state, commands }) => {
          const node = getCurrentIndentNode(state);

          if (!node) {
            return false;
          }

          return commands.updateAttributes(node.type.name, {
            indent: clampIndent((node.attrs.indent ?? 0) + 1),
          });
        },
    };
  },
});

export { Indent };
