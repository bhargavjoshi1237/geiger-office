function collectDocumentHeadings(editor) {
  const headings = [];

  editor?.state.doc.descendants((node, position) => {
    if (node.type.name !== "heading") {
      return;
    }

    headings.push({
      id: `heading-${position}`,
      level: node.attrs.level,
      text: node.textContent.trim() || `Untitled heading ${headings.length + 1}`,
    });
  });

  return headings;
}

export { collectDocumentHeadings };
