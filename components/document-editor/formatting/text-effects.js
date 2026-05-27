import { Bold, Italic, Underline } from "lucide-react";

const TEXT_EFFECTS = [
  {
    id: "bold",
    label: "Bold",
    mark: "bold",
    command: "toggleBold",
    Icon: Bold,
  },
  {
    id: "italic",
    label: "Italic",
    mark: "italic",
    command: "toggleItalic",
    Icon: Italic,
  },
  {
    id: "underline",
    label: "Underline",
    mark: "underline",
    command: "toggleUnderline",
    Icon: Underline,
  },
];

function getTextEffect(effectId) {
  return TEXT_EFFECTS.find((effect) => effect.id === effectId);
}

export { TEXT_EFFECTS, getTextEffect };
