// Factories for slide elements and slides (with per-layout starter content).

import { themeOptions } from "@/components/slides-editor/data/theme-presets";

export function createTextElement(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    type: "text",
    text: "Add text",
    x: 120,
    y: 120,
    w: 460,
    h: 96,
    fontSize: 14,
    fontFamily: "Arial",
    color: "#111827",
    fill: "transparent",
    angle: 0,
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    ...overrides,
  };
}

export function createShapeElement(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    type: "shape",
    shape: "rect",
    x: 760,
    y: 188,
    w: 300,
    h: 190,
    fill: "#2563eb",
    color: "#2563eb",
    angle: 0,
    opacity: 1,
    ...overrides,
  };
}

export function createImageElement(src, overrides = {}) {
  return {
    id: crypto.randomUUID(),
    type: "image",
    src,
    alt: "Inserted image",
    x: 740,
    y: 170,
    w: 360,
    h: 250,
    angle: 0,
    ...overrides,
  };
}

export function createSlide(layout = "title", theme = themeOptions[0]) {
  const base = {
    id: crypto.randomUUID(),
    title: "Untitled slide",
    layout,
    themeId: theme.id,
    background: theme.background,
    notes: "",
    transition: "Fade",
    elements: [],
  };

  // Light neutral used for image/media placeholders so they read on any theme.
  const placeholderFill = "#e8eaed";

  if (layout === "title") {
    base.title = "Title slide";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 112, y: 250, w: 1056, h: 130, fontSize: 72, bold: true, color: theme.text, align: "center" }),
      createTextElement({ text: "Click to add subtitle", x: 220, y: 400, w: 840, h: 72, fontSize: 34, color: theme.muted, align: "center" }),
    ];
  }

  if (layout === "section") {
    base.title = "Section header";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 112, y: 300, w: 1056, h: 120, fontSize: 60, bold: true, color: theme.text, align: "center" }),
    ];
  }

  if (layout === "content") {
    base.title = "Title and body";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 84, y: 58, w: 1112, h: 72, fontSize: 48, bold: true, color: theme.text }),
      createTextElement({ text: "Click to add text", x: 112, y: 178, w: 1056, h: 430, fontSize: 32, color: theme.text }),
    ];
  }

  if (layout === "two-column") {
    base.title = "Title and two columns";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 84, y: 58, w: 1112, h: 72, fontSize: 48, bold: true, color: theme.text }),
      createTextElement({ text: "Click to add text", x: 120, y: 190, w: 480, h: 420, fontSize: 28, color: theme.text }),
      createTextElement({ text: "Click to add text", x: 680, y: 190, w: 480, h: 420, fontSize: 28, color: theme.text }),
    ];
  }

  if (layout === "title-only") {
    base.title = "Title only";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 84, y: 58, w: 1112, h: 72, fontSize: 48, bold: true, color: theme.text }),
    ];
  }

  if (layout === "one-column") {
    base.title = "One column text";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 84, y: 58, w: 1112, h: 72, fontSize: 44, bold: true, color: theme.text }),
      createTextElement({ text: "Click to add text", x: 112, y: 172, w: 1056, h: 440, fontSize: 30, color: theme.text }),
    ];
  }

  if (layout === "main-point") {
    base.title = "Main point";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 112, y: 270, w: 1056, h: 200, fontSize: 80, bold: true, color: theme.text }),
    ];
  }

  if (layout === "section-description") {
    base.title = "Section title and description";
    base.elements = [
      createTextElement({ text: "Click to add title", x: 84, y: 230, w: 540, h: 110, fontSize: 48, bold: true, color: theme.text }),
      createTextElement({ text: "Click to add text", x: 84, y: 350, w: 540, h: 260, fontSize: 26, color: theme.muted }),
      createShapeElement({ x: 700, y: 150, w: 496, h: 420, fill: placeholderFill, color: placeholderFill }),
    ];
  }

  if (layout === "caption") {
    base.title = "Caption";
    base.elements = [
      createShapeElement({ x: 84, y: 70, w: 1112, h: 470, fill: placeholderFill, color: placeholderFill }),
      createTextElement({ text: "Click to add text", x: 84, y: 566, w: 1112, h: 80, fontSize: 24, color: theme.muted }),
    ];
  }

  if (layout === "big-number") {
    base.title = "Big number";
    base.elements = [
      createTextElement({ text: "xx%", x: 140, y: 220, w: 1000, h: 220, fontSize: 110, bold: true, color: theme.text, align: "center" }),
      createTextElement({ text: "Click to add text", x: 240, y: 460, w: 800, h: 64, fontSize: 30, color: theme.muted, align: "center" }),
    ];
  }

  return base;
}
