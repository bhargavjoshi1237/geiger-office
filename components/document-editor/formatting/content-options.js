const CONTENT_OPTIONS = [
  { id: "paragraph", label: "Normal text", type: "paragraph" },
  { id: "heading-1", label: "Heading 1", type: "heading", level: 1 },
  { id: "heading-2", label: "Heading 2", type: "heading", level: 2 },
  { id: "heading-3", label: "Heading 3", type: "heading", level: 3 },
  { id: "heading-4", label: "Heading 4", type: "heading", level: 4 },
  { id: "heading-5", label: "Heading 5", type: "heading", level: 5 },
  { id: "heading-6", label: "Heading 6", type: "heading", level: 6 },
];

function getContentOption(optionId) {
  return CONTENT_OPTIONS.find((option) => option.id === optionId);
}

export { CONTENT_OPTIONS, getContentOption };
