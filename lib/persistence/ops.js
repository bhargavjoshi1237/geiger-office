export const OP_TYPES = {
  DOC_UPDATED: "doc.content.updated",
  SHEET_CELL_UPDATED: "sheet.cell.updated",
  SHEET_STRUCTURE_UPDATED: "sheet.structure.updated",
  SLIDE_ELEMENT_UPDATED: "slides.element.updated",
  SLIDE_STRUCTURE_UPDATED: "slides.structure.updated",
};

export function coalesce(currentContent) {
  return currentContent;
}
