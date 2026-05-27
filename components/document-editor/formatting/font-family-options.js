const DEFAULT_FONT_FAMILY = "Arial";

const FONT_FAMILY_OPTIONS = [
  { id: "arial", label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { id: "inter", label: "Inter", value: "Inter, Arial, sans-serif" },
  { id: "georgia", label: "Georgia", value: "Georgia, serif" },
  { id: "times", label: "Times New Roman", value: "\"Times New Roman\", Times, serif" },
  { id: "garamond", label: "Garamond", value: "Garamond, Georgia, serif" },
  { id: "verdana", label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet MS", value: "\"Trebuchet MS\", Arial, sans-serif" },
  { id: "courier", label: "Courier New", value: "\"Courier New\", Courier, monospace" },
  { id: "consolas", label: "Consolas", value: "Consolas, \"Courier New\", monospace" },
  { id: "system", label: "System UI", value: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" },
];

function getFontFamilyOptionByValue(value) {
  return FONT_FAMILY_OPTIONS.find((option) => option.value === value);
}

function getFontFamilyOption(optionId) {
  return FONT_FAMILY_OPTIONS.find((option) => option.id === optionId);
}

export { DEFAULT_FONT_FAMILY, FONT_FAMILY_OPTIONS, getFontFamilyOption, getFontFamilyOptionByValue };
