"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BadgePlus,
  Bell,
  Bold,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Circle,
  Copy,
  Download,
  Eye,
  Grid2X2,
  HelpCircle,
  Highlighter,
  Image as ImageIcon,
  Italic,
  LayoutTemplate,
  LineChart,
  Lock,
  MessageSquareText,
  Minus,
  MonitorPlay,
  MousePointer2,
  PaintBucket,
  Palette,
  PaintRoller,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Presentation,
  Redo2,
  Save,
  Search,
  Shapes,
  Sparkles,
  Square,
  Star,
  TextCursorInput,
  Trash2,
  Type,
  Underline,
  Undo2,
  UserCircle,
  Video,
  WandSparkles,
  ZoomIn,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { IconButton, ToolbarDivider, ToolbarSelect, ToolbarToggle } from "@/components/document-editor/editor-controls";
import { cn } from "@/lib/utils";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

const activeCollaborators = [
  { name: "Maya Patel", initials: "MP", color: "bg-[#365d4f] text-[#d7f4e8]" },
  { name: "Noah Kim", initials: "NK", color: "bg-[#564a72] text-[#ece4ff]" },
  { name: "Ava Chen", initials: "AC", color: "bg-[#6a493c] text-[#ffe5d8]" },
];

const themeOptions = [
  { id: "clean", label: "Clean", background: "#ffffff", accent: "#2563eb", text: "#111827", muted: "#6b7280" },
  { id: "ink", label: "Ink", background: "#111111", accent: "#f59e0b", text: "#ffffff", muted: "#d4d4d4" },
  { id: "mint", label: "Mint", background: "#f4fbf8", accent: "#0f766e", text: "#12332f", muted: "#55736e" },
  { id: "coral", label: "Coral", background: "#fff7f2", accent: "#e11d48", text: "#2f161b", muted: "#7a4e56" },
  { id: "steel", label: "Steel", background: "#f8fafc", accent: "#475569", text: "#0f172a", muted: "#64748b" },
];

const layouts = [
  { id: "title", label: "Title slide" },
  { id: "section", label: "Section header" },
  { id: "content", label: "Title and body" },
  { id: "two-column", label: "Two columns" },
  { id: "blank", label: "Blank" },
];

const colorOptions = ["#111827", "#ffffff", "#737373", "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"];
const zoomOptions = [50, 67, 75, 90, 100, 125, 150];
const transitionOptions = ["None", "Fade", "Slide", "Wipe", "Zoom"];

const slideMenus = [
  {
    label: "File",
    groups: [
      [
        { label: "New presentation", shortcut: "Ctrl+Alt+N" },
        { label: "Make a copy" },
      ],
      [
        { label: "Download", type: "download" },
        { label: "Share", hasSubmenu: true },
      ],
      [
        { label: "Rename" },
        { label: "Move" },
        { label: "Version history", hasSubmenu: true },
      ],
    ],
  },
  {
    label: "Edit",
    groups: [
      [
        { label: "Undo", action: "undo", shortcut: "Ctrl+Z" },
        { label: "Redo", action: "redo", shortcut: "Ctrl+Y" },
      ],
      [
        { label: "Duplicate", action: "duplicate" },
        { label: "Delete", action: "delete" },
      ],
    ],
  },
  {
    label: "View",
    groups: [
      [
        { label: "Present", action: "present" },
        { label: "Show speaker notes" },
        { label: "Grid view" },
      ],
    ],
  },
  {
    label: "Insert",
    groups: [
      [
        { label: "Text box", action: "text" },
        { label: "Image", action: "image" },
        { label: "Shape", action: "shape" },
      ],
    ],
  },
  {
    label: "Slide",
    groups: [
      [
        { label: "New slide", action: "new-slide", shortcut: "Ctrl+M" },
        { label: "Duplicate slide", action: "duplicate-slide" },
        { label: "Delete slide", action: "delete-slide" },
      ],
    ],
  },
  {
    label: "Arrange",
    groups: [
      [
        { label: "Bring forward", action: "forward" },
        { label: "Send backward", action: "backward" },
      ],
    ],
  },
  {
    label: "Tools",
    groups: [
      [
        { label: "Explore" },
        { label: "Linked objects" },
        { label: "Preferences" },
      ],
    ],
  },
  {
    label: "Help",
    groups: [
      [
        { label: "Slides help" },
        { label: "Keyboard shortcuts", shortcut: "Ctrl+/" },
      ],
    ],
  },
];

function createTextElement(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    type: "text",
    text: "Add text",
    x: 120,
    y: 120,
    w: 460,
    h: 96,
    fontSize: 42,
    fontFamily: "Arial",
    color: "#111827",
    fill: "transparent",
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    ...overrides,
  };
}

function createShapeElement(overrides = {}) {
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
    opacity: 1,
    ...overrides,
  };
}

function createImageElement(src, overrides = {}) {
  return {
    id: crypto.randomUUID(),
    type: "image",
    src,
    alt: "Inserted image",
    x: 740,
    y: 170,
    w: 360,
    h: 250,
    ...overrides,
  };
}

function createSlide(layout = "title", theme = themeOptions[0]) {
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

  if (layout === "title") {
    base.title = "Project update";
    base.elements = [
      createTextElement({ text: "Project update", x: 112, y: 170, w: 1056, h: 120, fontSize: 72, bold: true, color: theme.text, align: "center" }),
      createTextElement({ text: "Add subtitle", x: 220, y: 330, w: 840, h: 72, fontSize: 34, color: theme.muted, align: "center" }),
    ];
  }

  if (layout === "section") {
    base.title = "Section";
    base.elements = [
      createShapeElement({ x: 0, y: 0, w: 1280, h: 720, fill: theme.accent, color: theme.accent }),
      createTextElement({ text: "Section title", x: 130, y: 252, w: 860, h: 108, fontSize: 68, bold: true, color: "#ffffff" }),
      createTextElement({ text: "A focused point for the next part", x: 134, y: 370, w: 760, h: 58, fontSize: 30, color: "#ffffff" }),
    ];
  }

  if (layout === "content") {
    base.title = "Slide title";
    base.elements = [
      createTextElement({ text: "Slide title", x: 84, y: 58, w: 900, h: 72, fontSize: 48, bold: true, color: theme.text }),
      createTextElement({ text: "Add key point\nAdd supporting detail\nAdd next step", x: 112, y: 178, w: 760, h: 300, fontSize: 32, color: theme.text }),
      createShapeElement({ x: 930, y: 178, w: 230, h: 300, fill: theme.accent, color: theme.accent }),
    ];
  }

  if (layout === "two-column") {
    base.title = "Comparison";
    base.elements = [
      createTextElement({ text: "Comparison", x: 84, y: 58, w: 900, h: 72, fontSize: 48, bold: true, color: theme.text }),
      createTextElement({ text: "Option A", x: 120, y: 190, w: 420, h: 76, fontSize: 38, bold: true, color: theme.text }),
      createTextElement({ text: "Add details", x: 120, y: 286, w: 420, h: 180, fontSize: 28, color: theme.muted }),
      createTextElement({ text: "Option B", x: 730, y: 190, w: 420, h: 76, fontSize: 38, bold: true, color: theme.text }),
      createTextElement({ text: "Add details", x: 730, y: 286, w: 420, h: 180, fontSize: 28, color: theme.muted }),
    ];
  }

  return base;
}

function useHistory(initialSlides) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialSlides);
  const [future, setFuture] = useState([]);

  const commit = (updater) => {
    setPresent((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (next === current) return current;
      setPast((items) => [...items.slice(-40), current]);
      setFuture([]);
      return next;
    });
  };

  const undo = () => {
    setPast((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setFuture((futureItems) => [present, ...futureItems]);
      setPresent(previous);
      return items.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      setPast((pastItems) => [...pastItems, present]);
      setPresent(next);
      return items.slice(1);
    });
  };

  return { canRedo: future.length > 0, canUndo: past.length > 0, commit, present, redo, undo };
}

function SlideThumbnail({ active, index, slide, onClick }) {
  const scale = 156 / SLIDE_WIDTH;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-2 rounded-md p-1 text-left transition-colors hover:bg-[#242424]",
        active && "bg-[#242424]",
      )}
    >
      <span className="w-5 pt-1 text-right text-xs text-[#a3a3a3]">{index + 1}</span>
      <span
        className={cn(
          "relative h-[88px] w-[156px] shrink-0 overflow-hidden rounded-sm border bg-white shadow-sm",
          active ? "border-white" : "border-[#333333]",
        )}
        style={{ background: slide.background }}
      >
        <span style={{ transform: `scale(${scale})`, transformOrigin: "top left" }} className="absolute left-0 top-0 h-[720px] w-[1280px]">
          {slide.elements.map((element) => (
            <span
              key={element.id}
              className={cn("absolute block overflow-hidden", element.type === "shape" && element.shape === "ellipse" && "rounded-full")}
              style={{
                left: element.x,
                top: element.y,
                width: element.w,
                height: element.h,
                background: element.type === "shape" ? element.fill : "transparent",
                color: element.color,
                fontSize: element.fontSize,
                fontWeight: element.bold ? 700 : 400,
                textAlign: element.align,
                borderRadius: element.type === "shape" && element.shape === "rect" ? 18 : undefined,
              }}
            >
              {element.type === "text" ? element.text : null}
              {element.type === "image" ? <Image src={element.src} alt="" fill unoptimized sizes="156px" className="object-cover" /> : null}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

function SlideElement({ element, selected, scale, onChange, onPointerDown, onSelect }) {
  const commonStyle = {
    left: element.x,
    top: element.y,
    width: element.w,
    height: element.h,
  };

  if (element.type === "shape") {
    return (
      <button
        type="button"
        aria-label="Shape element"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(element.id);
        }}
        onPointerDown={(event) => onPointerDown(event, element.id)}
        className={cn("absolute transition-shadow", selected && "ring-2 ring-[#60a5fa]")}
        style={{
          ...commonStyle,
          background: element.fill,
          borderRadius: element.shape === "ellipse" ? "9999px" : 22,
          opacity: element.opacity,
        }}
      >
        {selected ? <span className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-[#2563eb]" /> : null}
      </button>
    );
  }

  if (element.type === "image") {
    return (
      <button
        type="button"
        aria-label="Image element"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(element.id);
        }}
        onPointerDown={(event) => onPointerDown(event, element.id)}
        className={cn("absolute overflow-hidden rounded-sm bg-[#e5e5e5] transition-shadow", selected && "ring-2 ring-[#60a5fa]")}
        style={commonStyle}
      >
        <Image src={element.src} alt={element.alt} fill unoptimized sizes="360px" className="object-cover" />
        {selected ? <span className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-[#2563eb]" style={{ transform: `scale(${1 / scale})` }} /> : null}
      </button>
    );
  }

  return (
    <div
      role="textbox"
      tabIndex={0}
      suppressContentEditableWarning
      contentEditable
      onClick={(event) => {
        event.stopPropagation();
        onSelect(element.id);
      }}
      onPointerDown={(event) => onPointerDown(event, element.id)}
      onInput={(event) => onChange(element.id, { text: event.currentTarget.innerText })}
      className={cn(
        "absolute whitespace-pre-wrap rounded-sm px-2 py-1 outline-none transition-shadow focus:ring-2 focus:ring-[#60a5fa]",
        selected && "ring-2 ring-[#60a5fa]",
      )}
      style={{
        ...commonStyle,
        color: element.color,
        background: element.fill,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontStyle: element.italic ? "italic" : "normal",
        fontWeight: element.bold ? 700 : 400,
        lineHeight: 1.12,
        textAlign: element.align,
        textDecoration: element.underline ? "underline" : "none",
      }}
    >
      {element.text}
      {selected ? <span className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-white bg-[#2563eb]" style={{ transform: `scale(${1 / scale})` }} /> : null}
    </div>
  );
}

function ColorMenu({ activeColor, icon: Icon, label, onSelect }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={label}>
          <Icon className="h-4 w-4" />
          <span className="absolute bottom-1 h-0.5 w-4 rounded-full" style={{ background: activeColor }} />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 p-2" align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <div className="grid grid-cols-6 gap-1.5 p-1">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => onSelect(color)}
              className={cn("h-7 rounded border border-[#333333] ring-offset-2 ring-offset-[#202020]", activeColor === color && "ring-2 ring-white")}
              style={{ background: color }}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BackgroundMenu({ activeColor, onSelect }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarSelect className="w-32">Background</ToolbarSelect>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2" align="start">
        <DropdownMenuLabel>Slide background</DropdownMenuLabel>
        <div className="grid grid-cols-6 gap-1.5 p-1">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Set background ${color}`}
              onClick={() => onSelect(color)}
              className={cn("h-7 rounded border border-[#333333] ring-offset-2 ring-offset-[#202020]", activeColor === color && "ring-2 ring-white")}
              style={{ background: color }}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SlidesMenuBar({ onAction }) {
  return (
    <nav className="hidden items-center gap-1 text-sm text-white md:flex" aria-label="Slides menu">
      {slideMenus.map((menu) => (
        <DropdownMenu key={menu.label}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 rounded px-2 py-2 text-sm font-normal text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-white focus-visible:ring-[#474747] data-[state=open]:bg-[#2a2a2a] data-[state=open]:text-white"
            >
              {menu.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {menu.groups.map((group, groupIndex) => (
              <div key={`${menu.label}-${groupIndex}`}>
                {groupIndex > 0 && <DropdownMenuSeparator />}
                {group.map((item) => {
                  if (item.type === "download") {
                    return (
                      <DropdownMenuSub key={item.label}>
                        <DropdownMenuSubTrigger>
                          <span>{item.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="min-w-52">
                          <DropdownMenuItem onSelect={() => onAction("export-pptx")}>
                            PowerPoint (.pptx)
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  if (item.hasSubmenu) {
                    return (
                      <DropdownMenuSub key={item.label}>
                        <DropdownMenuSubTrigger>
                          <span>{item.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem disabled>Coming soon</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  }

                  return (
                    <DropdownMenuItem key={item.label} onSelect={() => item.action && onAction(item.action)}>
                      <span>{item.label}</span>
                      {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
}

function SlidesEditor() {
  const initialSlides = useMemo(() => [createSlide("title", themeOptions[0]), createSlide("content", themeOptions[2]), createSlide("two-column", themeOptions[4])], []);
  const { canRedo, canUndo, commit, present: slides, redo, undo } = useHistory(initialSlides);
  const [activeSlideId, setActiveSlideId] = useState(initialSlides[0].id);
  const [selectedElementId, setSelectedElementId] = useState(initialSlides[0].elements[0].id);
  const [zoom, setZoom] = useState(90);
  const [mode, setMode] = useState("edit");
  const [isPresenting, setIsPresenting] = useState(false);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState(true);
  const dragRef = useRef(null);
  const imageInputRef = useRef(null);

  const activeSlide = slides.find((slide) => slide.id === activeSlideId) ?? slides[0];
  const selectedElement = activeSlide?.elements.find((element) => element.id === selectedElementId);
  const activeTheme = themeOptions.find((theme) => theme.id === activeSlide?.themeId) ?? themeOptions[0];
  const scale = zoom / 100;

  const updateSlide = (slideId, updater) => {
    commit((current) =>
      current.map((slide) => {
        if (slide.id !== slideId) return slide;
        return typeof updater === "function" ? updater(slide) : { ...slide, ...updater };
      }),
    );
  };

  const updateElement = (elementId, patch) => {
    updateSlide(activeSlide.id, (slide) => ({
      ...slide,
      elements: slide.elements.map((element) => (element.id === elementId ? { ...element, ...patch } : element)),
    }));
  };

  const addSlide = (layout = "title") => {
    const nextSlide = createSlide(layout, activeTheme);
    commit((current) => {
      const activeIndex = current.findIndex((slide) => slide.id === activeSlide.id);
      return [...current.slice(0, activeIndex + 1), nextSlide, ...current.slice(activeIndex + 1)];
    });
    setActiveSlideId(nextSlide.id);
    setSelectedElementId(nextSlide.elements[0]?.id);
  };

  const duplicateSlide = () => {
    const clone = {
      ...activeSlide,
      id: crypto.randomUUID(),
      title: `${activeSlide.title} copy`,
      elements: activeSlide.elements.map((element) => ({ ...element, id: crypto.randomUUID() })),
    };
    commit((current) => {
      const activeIndex = current.findIndex((slide) => slide.id === activeSlide.id);
      return [...current.slice(0, activeIndex + 1), clone, ...current.slice(activeIndex + 1)];
    });
    setActiveSlideId(clone.id);
    setSelectedElementId(clone.elements[0]?.id);
  };

  const deleteSlide = () => {
    if (slides.length === 1) return;
    const currentIndex = slides.findIndex((slide) => slide.id === activeSlide.id);
    const fallback = slides[currentIndex - 1] ?? slides[currentIndex + 1];
    commit((current) => current.filter((slide) => slide.id !== activeSlide.id));
    setActiveSlideId(fallback.id);
    setSelectedElementId(fallback.elements[0]?.id);
  };

  const addTextBox = () => {
    const element = createTextElement({ text: "New text", x: 150, y: 150, fontSize: 36, color: activeTheme.text });
    updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: [...slide.elements, element] }));
    setSelectedElementId(element.id);
  };

  const addShape = (shape = "rect") => {
    const element = createShapeElement({ shape, fill: activeTheme.accent, color: activeTheme.accent });
    updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: [...slide.elements, element] }));
    setSelectedElementId(element.id);
  };

  const addImageFromFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const element = createImageElement(String(reader.result));
      updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: [...slide.elements, element] }));
      setSelectedElementId(element.id);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedElement = () => {
    if (!selectedElement) return;
    updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: slide.elements.filter((element) => element.id !== selectedElement.id) }));
    setSelectedElementId(undefined);
  };

  const moveSelectedElement = (direction) => {
    if (!selectedElement) return;
    updateSlide(activeSlide.id, (slide) => {
      const index = slide.elements.findIndex((element) => element.id === selectedElement.id);
      const nextIndex = direction === "forward" ? Math.min(slide.elements.length - 1, index + 1) : Math.max(0, index - 1);
      if (index === nextIndex) return slide;
      const elements = [...slide.elements];
      const [element] = elements.splice(index, 1);
      elements.splice(nextIndex, 0, element);
      return { ...slide, elements };
    });
  };

  const applyLayout = (layout) => {
    const next = createSlide(layout, activeTheme);
    updateSlide(activeSlide.id, {
      layout,
      title: next.title,
      elements: next.elements,
    });
    setSelectedElementId(next.elements[0]?.id);
  };

  const applyTheme = (theme) => {
    updateSlide(activeSlide.id, (slide) => ({
      ...slide,
      themeId: theme.id,
      background: theme.background,
      elements: slide.elements.map((element) => {
        if (element.type === "shape") return { ...element, fill: element.fill === activeTheme.accent ? theme.accent : element.fill };
        return {
          ...element,
          color: element.color === activeTheme.text ? theme.text : element.color === activeTheme.muted ? theme.muted : element.color,
        };
      }),
    }));
  };

  const beginDrag = (event, elementId) => {
    if (mode !== "edit") return;
    event.stopPropagation();
    setSelectedElementId(elementId);
    const element = activeSlide.elements.find((item) => item.id === elementId);
    dragRef.current = {
      elementId,
      startX: event.clientX,
      startY: event.clientY,
      x: element.x,
      y: element.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;
    updateElement(drag.elementId, {
      x: Math.max(0, Math.min(SLIDE_WIDTH - 40, Math.round(drag.x + dx))),
      y: Math.max(0, Math.min(SLIDE_HEIGHT - 40, Math.round(drag.y + dy))),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const exportPptx = async () => {
    const pptxgen = (await import("pptxgenjs")).default;
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE";

    slides.forEach((slideData) => {
      const slide = pptx.addSlide();
      slide.background = { color: slideData.background.replace("#", "") };
      slideData.elements.forEach((element) => {
        const x = (element.x / SLIDE_WIDTH) * 13.333;
        const y = (element.y / SLIDE_HEIGHT) * 7.5;
        const w = (element.w / SLIDE_WIDTH) * 13.333;
        const h = (element.h / SLIDE_HEIGHT) * 7.5;
        if (element.type === "image") {
          slide.addImage({ data: element.src, x, y, w, h });
        } else if (element.type === "shape") {
          slide.addShape(element.shape === "ellipse" ? pptx.ShapeType.ellipse : pptx.ShapeType.roundRect, {
            x,
            y,
            w,
            h,
            fill: { color: element.fill.replace("#", "") },
            line: { color: element.color.replace("#", ""), transparency: 100 },
          });
        } else {
          slide.addText(element.text, {
            x,
            y,
            w,
            h,
            fontFace: element.fontFamily,
            fontSize: Math.max(8, Math.round(element.fontSize * 0.42)),
            bold: element.bold,
            italic: element.italic,
            underline: element.underline,
            color: element.color.replace("#", ""),
            align: element.align,
            valign: "mid",
          });
        }
      });
      if (slideData.notes) slide.addNotes(slideData.notes);
    });

    await pptx.writeFile({ fileName: "geiger-presentation.pptx" });
  };

  const handleMenuAction = (action) => {
    const actions = {
      "backward": () => moveSelectedElement("backward"),
      "delete": removeSelectedElement,
      "delete-slide": deleteSlide,
      "duplicate": duplicateSlide,
      "duplicate-slide": duplicateSlide,
      "export-pptx": exportPptx,
      "forward": () => moveSelectedElement("forward"),
      "image": () => imageInputRef.current?.click(),
      "new-slide": () => addSlide(activeSlide.layout),
      "present": () => setIsPresenting(true),
      "redo": redo,
      "shape": () => addShape("rect"),
      "text": addTextBox,
      "undo": undo,
    };

    actions[action]?.();
  };

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <header className="shrink-0 border-b border-[#333333] bg-[#202020] shadow-sm shadow-black/20">
        <div className="mt-2 flex h-14 items-center gap-3 px-4">
          <div className="mr-auto flex min-w-0 items-start gap-3">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2a2a2a] p-1.5">
              <Image src="/logo1.svg" alt="Geiger Office" width={28} height={28} className="h-7 w-7 object-contain" priority />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-sm font-semibold leading-7 text-white">Untitled presentation</h1>
                <IconButton label="Star presentation" className="h-7 w-7">
                  <Star className="h-4 w-4" />
                </IconButton>
                <Presentation className="h-4 w-4 text-amber-300" />
              </div>
              <SlidesMenuBar onAction={handleMenuAction} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden -space-x-2 sm:flex" aria-label="People editing this presentation">
              {activeCollaborators.map((collaborator) => (
                <Avatar key={collaborator.name} className="h-8 w-8 border-2 border-[#202020] shadow-sm shadow-black/20" title={`${collaborator.name} is editing`}>
                  <AvatarFallback className={`text-[10px] font-semibold ${collaborator.color}`}>
                    {collaborator.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <button
              type="button"
              className="group relative hidden h-8 w-[220px] items-center justify-start rounded-md border border-[#333333] bg-[#242424] px-2.5 text-sm text-[#a3a3a3] shadow-sm transition-colors hover:border-[#474747] hover:bg-[#2a2a2a] hover:text-white lg:flex"
            >
              <Search className="mr-2 h-4 w-4 text-[#a3a3a3] transition-colors group-hover:text-white" />
              <span className="text-[#a3a3a3] transition-colors group-hover:text-white">Search slides...</span>
              <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                <KbdGroup>
                  <Kbd className="border border-[#333333] bg-[#202020] text-[#a3a3a3] transition-colors group-hover:bg-[#2a2a2a] group-hover:text-white">
                    Ctrl
                  </Kbd>
                  <Kbd className="border border-[#333333] bg-[#202020] text-[#a3a3a3] transition-colors group-hover:bg-[#2a2a2a] group-hover:text-white">
                    K
                  </Kbd>
                </KbdGroup>
              </div>
            </button>
            <IconButton label="Comments" className="hidden sm:inline-flex">
              <MessageSquareText className="h-5 w-5" />
            </IconButton>
            <IconButton label="Video call" className="hidden sm:inline-flex">
              <Video className="h-5 w-5" />
            </IconButton>
            <Button type="button" variant="outline" onClick={() => setIsPresenting(true)} className="hidden h-9 rounded-md border-[#333333] bg-[#202020] px-5 text-[#e5e5e5] hover:border-[#474747] hover:bg-[#2a2a2a] sm:inline-flex">
              <MonitorPlay className="h-4 w-4" />
              Slideshow
            </Button>
            <Button type="button" className="h-9 rounded-md px-4">
              <Lock className="h-4 w-4" />
              Share
              <ChevronDown className="h-4 w-4" />
            </Button>
            <IconButton label="Gemini" className="hidden sm:inline-flex">
              <Sparkles className="h-5 w-5" />
            </IconButton>
            <IconButton label="Help" className="hidden sm:inline-flex">
              <HelpCircle className="h-5 w-5" />
            </IconButton>
            <IconButton label="Notifications">
              <Bell className="h-5 w-5" />
            </IconButton>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-full border-[#333333] bg-[#202020] text-[#a3a3a3] hover:border-[#474747] hover:bg-[#242424] hover:text-white">
              <UserCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mx-3 mb-2 mt-1 flex h-11 items-center gap-1 overflow-x-auto rounded-md px-3 scrollbar-subtle">
          <IconButton label="New slide" onClick={() => addSlide(activeSlide.layout)}>
            <Plus className="h-4 w-4" />
          </IconButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarSelect className="w-28">New layout</ToolbarSelect>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {layouts.map((layout) => (
                <DropdownMenuItem key={layout.id} onSelect={() => addSlide(layout.id)}>
                  <LayoutTemplate className="h-4 w-4" />
                  {layout.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarDivider />
          <IconButton label="Undo" disabled={!canUndo} onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Redo" disabled={!canRedo} onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Save">
            <Save className="h-4 w-4" />
          </IconButton>
          <IconButton label="Export presentation" onClick={exportPptx}>
            <Download className="h-4 w-4" />
          </IconButton>
          <ToolbarDivider />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarSelect className="w-20">{zoom}%</ToolbarSelect>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-24" align="start">
              {zoomOptions.map((option) => (
                <DropdownMenuItem key={option} onSelect={() => setZoom(option)} className={zoom === option ? "bg-[#2a2a2a] text-white" : undefined}>
                  <ZoomIn className="h-4 w-4" />
                  {option}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarDivider />
          <IconButton label="Select" className="bg-[#2a2a2a] text-white">
            <MousePointer2 className="h-4 w-4" />
          </IconButton>
          <IconButton label="Text box" onClick={addTextBox}>
            <Type className="h-4 w-4" />
          </IconButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label="Shape">
                <Shapes className="h-4 w-4" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => addShape("rect")}>
                <Square className="h-4 w-4" />
                Rectangle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addShape("ellipse")}>
                <Circle className="h-4 w-4" />
                Ellipse
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <IconButton label="Line">
            <LineChart className="h-4 w-4" />
          </IconButton>
          <IconButton label="Insert image" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
          </IconButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              addImageFromFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <ToolbarDivider />
          <BackgroundMenu activeColor={activeSlide.background} onSelect={(background) => updateSlide(activeSlide.id, { background })} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarSelect className="w-24">Layout</ToolbarSelect>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {layouts.map((layout) => (
                <DropdownMenuItem key={layout.id} onSelect={() => applyLayout(layout.id)} className={activeSlide.layout === layout.id ? "bg-[#2a2a2a] text-white" : undefined}>
                  <LayoutTemplate className="h-4 w-4" />
                  {layout.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarSelect className="w-24">Theme</ToolbarSelect>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {themeOptions.map((theme) => (
                <DropdownMenuItem key={theme.id} onSelect={() => applyTheme(theme)} className={activeSlide.themeId === theme.id ? "bg-[#2a2a2a] text-white" : undefined}>
                  <span className="grid h-5 w-8 grid-cols-2 overflow-hidden rounded border border-[#333333]">
                    <span style={{ background: theme.background }} />
                    <span style={{ background: theme.accent }} />
                  </span>
                  {theme.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarSelect className="w-28">{activeSlide.transition}</ToolbarSelect>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {transitionOptions.map((transition) => (
                <DropdownMenuItem key={transition} onSelect={() => updateSlide(activeSlide.id, { transition })}>
                  {transition}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarDivider />
          {selectedElement?.type === "text" ? (
            <>
              <ToolbarToggle label="Bold" pressed={selectedElement.bold} onPressedChange={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })}>
                <Bold className="h-4 w-4" />
              </ToolbarToggle>
              <ToolbarToggle label="Italic" pressed={selectedElement.italic} onPressedChange={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}>
                <Italic className="h-4 w-4" />
              </ToolbarToggle>
              <ToolbarToggle label="Underline" pressed={selectedElement.underline} onPressedChange={() => updateElement(selectedElement.id, { underline: !selectedElement.underline })}>
                <Underline className="h-4 w-4" />
              </ToolbarToggle>
              <IconButton label="Decrease font size" onClick={() => updateElement(selectedElement.id, { fontSize: Math.max(12, selectedElement.fontSize - 2) })}>
                <Minus className="h-4 w-4" />
              </IconButton>
              <Input
                aria-label="Font size"
                value={selectedElement.fontSize}
                onChange={(event) => updateElement(selectedElement.id, { fontSize: Number(event.target.value) || selectedElement.fontSize })}
                className="h-8 w-12 px-1 text-center"
              />
              <IconButton label="Increase font size" onClick={() => updateElement(selectedElement.id, { fontSize: Math.min(110, selectedElement.fontSize + 2) })}>
                <Plus className="h-4 w-4" />
              </IconButton>
              <IconButton label="Align left" onClick={() => updateElement(selectedElement.id, { align: "left" })}>
                <AlignLeft className="h-4 w-4" />
              </IconButton>
              <IconButton label="Align center" onClick={() => updateElement(selectedElement.id, { align: "center" })}>
                <AlignCenter className="h-4 w-4" />
              </IconButton>
              <IconButton label="Align right" onClick={() => updateElement(selectedElement.id, { align: "right" })}>
                <AlignRight className="h-4 w-4" />
              </IconButton>
              <ColorMenu activeColor={selectedElement.color} icon={Palette} label="Text color" onSelect={(color) => updateElement(selectedElement.id, { color })} />
              <ColorMenu activeColor={selectedElement.fill} icon={Highlighter} label="Text fill" onSelect={(fill) => updateElement(selectedElement.id, { fill })} />
              <IconButton label="Delete text box" onClick={removeSelectedElement}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </>
          ) : null}
          {selectedElement?.type === "shape" || selectedElement?.type === "image" ? (
            <>
              {selectedElement.type === "shape" ? (
                <ColorMenu activeColor={selectedElement.fill} icon={PaintBucket} label="Shape fill" onSelect={(fill) => updateElement(selectedElement.id, { fill, color: fill })} />
              ) : null}
              <IconButton label="Bring forward" onClick={() => moveSelectedElement("forward")}>
                <PanelLeftOpen className="h-4 w-4 rotate-90" />
              </IconButton>
              <IconButton label="Send backward" onClick={() => moveSelectedElement("backward")}>
                <PanelLeftClose className="h-4 w-4 rotate-90" />
              </IconButton>
              <IconButton label="Delete element" onClick={removeSelectedElement}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </>
          ) : null}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode(mode === "edit" ? "view" : "edit")} className="h-8 rounded-md px-2 text-[#d4d4d4] hover:bg-[#2a2a2a]">
              {mode === "edit" ? <TextCursorInput className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {mode === "edit" ? "Editing" : "Viewing"}
            </Button>
            <IconButton label="Collapse toolbar">
              <ChevronUp className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className={cn("hidden shrink-0 border-r border-[#2a2a2a] bg-[#202020] transition-[width] lg:block", isFilmstripOpen ? "w-[232px] px-4 py-5" : "w-14 px-2 py-5")}>
          <div className="mb-4 flex items-center justify-between">
            {isFilmstripOpen ? <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#a3a3a3]">Slides</span> : null}
            <div className={cn("flex items-center gap-1", !isFilmstripOpen && "w-full justify-center")}>
              {isFilmstripOpen ? (
                <>
                  <IconButton label="Duplicate slide" className="h-7 w-7" onClick={duplicateSlide}>
                    <Copy className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Delete slide" className="h-7 w-7" disabled={slides.length === 1} onClick={deleteSlide}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </>
              ) : null}
              <IconButton label={isFilmstripOpen ? "Collapse filmstrip" : "Expand filmstrip"} className="h-7 w-7" onClick={() => setIsFilmstripOpen(!isFilmstripOpen)}>
                {isFilmstripOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </IconButton>
            </div>
          </div>
          {isFilmstripOpen ? (
            <div className="space-y-2 overflow-y-auto pr-1 scrollbar-subtle">
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={slide.id}
                  active={slide.id === activeSlide.id}
                  index={index}
                  slide={slide}
                  onClick={() => {
                    setActiveSlideId(slide.id);
                    setSelectedElementId(slide.elements[0]?.id);
                  }}
                />
              ))}
            </div>
          ) : null}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#161616]">
          <div className="relative min-h-0 flex-1 overflow-auto bg-[#161616] scrollbar-subtle">
            <div className="flex min-h-[760px] min-w-[1180px] flex-col items-center px-10 pb-24 pt-9">
              <div className="relative">
                <div
                  className="relative origin-top overflow-hidden border border-[#333333] shadow-2xl shadow-black/35"
                  onClick={() => setSelectedElementId(undefined)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  style={{
                    width: SLIDE_WIDTH,
                    height: SLIDE_HEIGHT,
                    transform: `scale(${scale})`,
                    marginBottom: -(SLIDE_HEIGHT * (1 - scale)),
                    background: activeSlide.background,
                  }}
                >
                  <div className="pointer-events-none absolute inset-10 border border-black/5" />
                  {activeSlide.elements.map((element) => (
                    <SlideElement
                      key={element.id}
                      element={element}
                      scale={scale}
                      selected={element.id === selectedElementId}
                      onChange={updateElement}
                      onPointerDown={beginDrag}
                      onSelect={setSelectedElementId}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => addSlide(activeSlide.layout)} className="h-10 rounded-full bg-[#202020] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#2a2a2a]">
                  <BadgePlus className="h-4 w-4" />
                  Create a slide
                </Button>
                <Separator className="h-0.5 w-12 bg-[#737373]" />
              </div>
            </div>
          </div>
          <footer className="flex h-11 shrink-0 items-center gap-4 border-t border-[#2a2a2a] bg-[#1a1a1a] px-6 text-sm">
            <IconButton label="Grid view" className="h-7 w-7">
              <Grid2X2 className="h-4 w-4" />
            </IconButton>
            <IconButton label={isFilmstripOpen ? "Collapse filmstrip" : "Expand filmstrip"} className="h-7 w-7" onClick={() => setIsFilmstripOpen(!isFilmstripOpen)}>
              <ChevronLeft className={cn("h-4 w-4", !isFilmstripOpen && "rotate-180")} />
            </IconButton>
            <Textarea
              aria-label="Speaker notes"
              placeholder="Click to add speaker notes"
              value={activeSlide.notes}
              onChange={(event) => updateSlide(activeSlide.id, { notes: event.target.value })}
              className="h-9 min-h-9 flex-1 resize-none border-0 bg-[#202020] px-4 py-2 text-white placeholder:text-[#737373] focus:border-0"
            />
          </footer>
        </main>

        <aside className="hidden w-[76px] shrink-0 flex-col items-center gap-3 bg-[#161616] py-64 xl:flex">
          {[
            [{ icon: WandSparkles, label: "AI assist" }],
            [
              { icon: LayoutTemplate, label: "Layouts" },
              { icon: PaintRoller, label: "Themes" },
              { icon: ImageIcon, label: "Media" },
            ],
          ].map((group, index) => (
            <div key={index} className="flex flex-col items-center gap-4 rounded-md bg-[#202020] px-3 py-4">
              {group.map(({ icon: Icon, label }) => (
                <IconButton key={label} label={label} className="h-8 w-8 rounded-md">
                  <Icon className={cn("h-4 w-4", label === "AI assist" && "text-amber-300")} />
                </IconButton>
              ))}
            </div>
          ))}
        </aside>
      </div>

      {isPresenting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black p-8" onClick={() => setIsPresenting(false)}>
          <div className="relative aspect-video w-[min(92vw,1280px)] overflow-hidden bg-white" style={{ background: activeSlide.background }}>
            {activeSlide.elements.map((element) => (
              <div
                key={element.id}
                className={cn("absolute overflow-hidden whitespace-pre-wrap", element.type === "shape" && element.shape === "ellipse" && "rounded-full")}
                style={{
                  left: `${(element.x / SLIDE_WIDTH) * 100}%`,
                  top: `${(element.y / SLIDE_HEIGHT) * 100}%`,
                  width: `${(element.w / SLIDE_WIDTH) * 100}%`,
                  height: `${(element.h / SLIDE_HEIGHT) * 100}%`,
                  background: element.type === "shape" ? element.fill : element.fill,
                  color: element.color,
                  fontSize: `${(element.fontSize / SLIDE_HEIGHT) * 100}vh`,
                  fontWeight: element.bold ? 700 : 400,
                  textAlign: element.align,
                  borderRadius: element.type === "shape" && element.shape === "rect" ? 22 : undefined,
                }}
              >
                {element.type === "text" ? element.text : null}
                {element.type === "image" ? <Image src={element.src} alt={element.alt} fill unoptimized sizes="92vw" className="object-cover" /> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { SlidesEditor };
