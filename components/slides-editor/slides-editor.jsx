"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appHref } from "@/lib/href";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BadgePlus,
  Bold,
  ChevronLeft,
  Circle,
  Copy,
  Download,
  Grid2X2,
  Highlighter,
  Image as ImageIcon,
  Italic,
  LayoutTemplate,
  MessageSquareText,
  Minus,
  MonitorPlay,
  MousePointer2,
  PaintBucket,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RectangleHorizontal,
  Redo2,
  Save,
  Shapes,
  Sparkles,
  Square,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo2,
  UserPlus,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SlideFilmstripContextMenu } from "@/components/slides-editor/slide-filmstrip-context-menu";
import { IconButton, ToolbarDivider, ToolbarSelect, ToolbarToggle } from "@/components/document-editor/editor-controls";
import { ModeToolbarGroup } from "@/components/document-editor/editor-toolbar";
import { FormattingColorPicker } from "@/components/document-editor/formatting/formatting-color-picker";
import { HIGHLIGHT_COLOR_OPTIONS, TEXT_COLOR_OPTIONS } from "@/components/document-editor/formatting/color-options";
import { cn } from "@/lib/utils";
import { SaveStatus } from "@/components/editor/save-status";
import { ProfileDropdown } from "@/components/editor/profile-dropdown";
import { NotificationsDropdown } from "@/components/editor/notifications-dropdown";
import { StarButton } from "@/components/editor/star-button";
import { CommandSearch } from "@/components/editor/command-search";
import { HelpDropdown } from "@/components/editor/help-dropdown";
import { ShareButton, ViewOnlyBadge } from "@/components/share/share-button";
import { useOfficeFile } from "@/lib/persistence/use-office-file";
import { SLIDE_HEIGHT, SLIDE_WIDTH, transitionOptions, zoomOptions } from "@/components/slides-editor/constants";
import { themeOptions } from "@/components/slides-editor/data/theme-presets";
import { layouts } from "@/components/slides-editor/data/layout-presets";
import { createImageElement, createShapeElement, createSlide, createTextElement } from "@/components/slides-editor/factories";
import { useHistory } from "@/components/slides-editor/hooks/use-history";
import { FabricSlideCanvas } from "@/components/slides-editor/fabric/fabric-slide-canvas";
import { SlideThumbnail } from "@/components/slides-editor/components/slide-thumbnail";
import { SlidesMenuBar } from "@/components/slides-editor/components/slides-menu-bar";
import { SlidesSidebar } from "@/components/slides-editor/components/slides-sidebar";

const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || "";

function apiBase() {
  const isProd = process.env.NODE_ENV === "production";
  const basePath = isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "/office" : "";
  return `${basePath}/api/files`;
}

function SlidesEditor({ fileId }) {
  const router = useRouter();
  const { file, initialContent, isLoading, status, role, starred, toggleStar, saveContent, rename } = useOfficeFile(fileId);
  const initialSlides = useMemo(() => [createSlide("blank", themeOptions[0])], []);
  const { canRedo, canUndo, commit, present: slides, redo, reset, undo } = useHistory(initialSlides);
  const [activeSlideId, setActiveSlideId] = useState(initialSlides[0].id);
  const [selectedElementId, setSelectedElementId] = useState(initialSlides[0].elements[0]?.id ?? null);
  const [presentationName, setPresentationName] = useState("Untitled presentation");
  const [zoom, setZoom] = useState(90);
  const [mode, setMode] = useState("edit");
  const [isPresenting, setIsPresenting] = useState(false);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState(true);
  const [draggingSlideId, setDraggingSlideId] = useState(null);
  const [sidebarTool, setSidebarTool] = useState(null);
  const [gridOpen, setGridOpen] = useState(false);
  const imageInputRef = useRef(null);
  const hydratedRef = useRef(false);
  const lastSavedJsonRef = useRef(null);
  const elementClipboardRef = useRef(null);
  const slideClipboardRef = useRef(null);

  useEffect(() => {
    if (isLoading || hydratedRef.current) return;
    const saved = initialContent;
    if (saved && Array.isArray(saved.slides) && saved.slides.length > 0) {
      reset(saved.slides);
      setActiveSlideId(saved.slides[0].id);
      setSelectedElementId(saved.slides[0].elements[0]?.id ?? null);
      lastSavedJsonRef.current = JSON.stringify({ slides: saved.slides });
    } else {
      lastSavedJsonRef.current = null;
    }
    if (file?.name) setPresentationName(file.name);
    hydratedRef.current = true;
  }, [isLoading, initialContent, file, reset]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const json = JSON.stringify({ slides });
    if (json === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = json;
    saveContent({ slides });
  }, [slides, saveContent]);

  const handleRename = (nextName) => {
    setPresentationName(nextName);
    rename(nextName);
  };

  const renamePrompt = () => {
    const next = window.prompt("Rename presentation", presentationName);
    if (next?.trim()) handleRename(next.trim());
  };

  const makeCopy = async () => {
    try {
      const res = await fetch(apiBase(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "presentation", name: `${presentationName} (copy)`, content: { slides } }),
      });
      if (!res.ok) return;
      const created = await res.json();
      router.push(`/slide/${created.id}`);
    } catch {
      /* best-effort; stay on the current file */
    }
  };

  const newPresentation = async () => {
    try {
      const res = await fetch(apiBase(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "presentation" }),
      });
      if (!res.ok) return;
      const created = await res.json();
      router.push(`/slide/${created.id}`);
    } catch {
      /* best-effort */
    }
  };

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

  const deleteSlide = (slideId = activeSlide.id) => {
    if (slides.length === 1) return;
    const currentIndex = slides.findIndex((slide) => slide.id === slideId);
    if (currentIndex === -1) return;
    const fallback = slides[currentIndex - 1] ?? slides[currentIndex + 1];
    commit((current) => current.filter((slide) => slide.id !== slideId));
    setActiveSlideId(fallback.id);
    setSelectedElementId(fallback.elements[0]?.id);
  };

  const reorderSlide = (fromId, toId) => {
    if (!fromId || fromId === toId) return;
    commit((current) => {
      const fromIndex = current.findIndex((slide) => slide.id === fromId);
      const toIndex = current.findIndex((slide) => slide.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Move a slide within the filmstrip. direction: "top" | "up" | "down" | "bottom".
  const moveSlide = (slideId, direction) => {
    commit((current) => {
      const from = current.findIndex((item) => item.id === slideId);
      if (from === -1) return current;
      const to =
        direction === "top" ? 0
        : direction === "bottom" ? current.length - 1
        : direction === "up" ? Math.max(0, from - 1)
        : Math.min(current.length - 1, from + 1);
      if (to === from) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const toggleSkipSlide = (slideId) => {
    updateSlide(slideId, (slide) => ({ ...slide, skipped: !slide.skipped }));
  };

  const copySlide = (slideId) => {
    const source = slides.find((item) => item.id === slideId);
    if (source) slideClipboardRef.current = source;
  };

  const pasteSlide = () => {
    const source = slideClipboardRef.current;
    if (!source) return;
    const clone = {
      ...source,
      id: crypto.randomUUID(),
      elements: source.elements.map((element) => ({ ...element, id: crypto.randomUUID() })),
    };
    commit((current) => {
      const index = current.findIndex((item) => item.id === activeSlideId);
      const next = [...current];
      next.splice(index + 1, 0, clone);
      return next;
    });
    setActiveSlideId(clone.id);
    setSelectedElementId(clone.elements[0]?.id);
  };

  const cutSlide = (slideId) => {
    copySlide(slideId);
    deleteSlide(slideId);
  };

  const changeSlideBackground = (slideId = activeSlide.id) => {
    const current = slides.find((slide) => slide.id === slideId)?.background ?? "#ffffff";
    const next = window.prompt("Slide background color (hex)", current);
    if (!next?.trim()) return;
    updateSlide(slideId, { background: next.trim() });
  };

  const addTextBox = () => {
    const element = createTextElement({ text: "New text", x: 150, y: 150, fontSize: 14, color: activeTheme.text });
    updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: [...slide.elements, element] }));
    setSelectedElementId(element.id);
  };

  const addShape = (shape = "rect") => {
    const dimensions = shape === "square" ? { w: 240, h: 240 } : shape === "line" ? { w: 360, h: 8 } : shape === "triangle" ? { w: 260, h: 220 } : {};
    const element = createShapeElement({ shape, fill: activeTheme.accent, color: activeTheme.accent, ...dimensions });
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

  // Delete / Backspace removes the selected element. Skipped while typing in a field
  // (Fabric edits text through a hidden textarea) or while presenting. No dependency
  // array so the listener always closes over the current selection and handlers.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const tag = (event.target?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || event.target?.isContentEditable) return;
      if (isPresenting || mode !== "edit" || !selectedElement) return;
      event.preventDefault();
      removeSelectedElement();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

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

  const setSelectedElementDepth = (placement) => {
    if (!selectedElement) return;
    updateSlide(activeSlide.id, (slide) => {
      const others = slide.elements.filter((element) => element.id !== selectedElement.id);
      const elements = placement === "front" ? [...others, selectedElement] : [selectedElement, ...others];
      return { ...slide, elements };
    });
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) return;
    const clone = { ...selectedElement, id: crypto.randomUUID(), x: selectedElement.x + 24, y: selectedElement.y + 24 };
    updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: [...slide.elements, clone] }));
    setSelectedElementId(clone.id);
  };

  const copySelectedElement = () => {
    if (selectedElement) elementClipboardRef.current = selectedElement;
  };

  const cutSelectedElement = () => {
    if (!selectedElement) return;
    elementClipboardRef.current = selectedElement;
    removeSelectedElement();
  };

  const pasteElement = () => {
    const copied = elementClipboardRef.current;
    if (!copied) return;
    const clone = { ...copied, id: crypto.randomUUID(), x: copied.x + 24, y: copied.y + 24 };
    updateSlide(activeSlide.id, (slide) => ({ ...slide, elements: [...slide.elements, clone] }));
    setSelectedElementId(clone.id);
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
      "make-copy": makeCopy,
      "new-presentation": newPresentation,
      "new-slide": () => addSlide(activeSlide.layout),
      "present": () => setIsPresenting(true),
      "print": () => window.print(),
      "redo": redo,
      "rename": renamePrompt,
      "shape": () => addShape("rect"),
      "text": addTextBox,
      "toggle-grid": () => setGridOpen(true),
      "toggle-notes": () => setSidebarTool((tool) => (tool === "notes" ? null : "notes")),
      "undo": undo,
    };

    actions[action]?.();
  };

  return (
    <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-[#161616] text-white">
      <header className="shrink-0 border-b border-[#333333] bg-[#202020] shadow-sm shadow-black/20">
        <div className="mt-2 flex h-14 items-center gap-3 px-4">
          <div className="mr-auto flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href={appHref("/home")}
                  aria-label="Go to home"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[#2a2a2a]"
                >
                  <Image src={`${assetPrefix}/logo1.svg`} alt="Home" width={20} height={20} />
                </Link>
                <div className="grid min-w-0 max-w-[52vw] items-center">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none invisible col-start-1 row-start-1 whitespace-pre rounded-md border border-transparent px-1 text-sm font-semibold leading-7"
                  >
                    {presentationName || "Untitled presentation"}
                  </span>
                  <input
                    value={presentationName}
                    onChange={(event) => handleRename(event.target.value)}
                    aria-label="Presentation name"
                    spellCheck={false}
                    className="col-start-1 row-start-1 w-full rounded-md border border-transparent bg-transparent px-1 text-sm font-semibold leading-7 text-white outline-none transition-colors hover:border-[#3a3a3a] focus:border-[#474747] focus:bg-[#161616]"
                  />
                </div>
                <StarButton
                  starred={starred}
                  onToggle={toggleStar}
                  label="Star presentation"
                  className="h-7 w-7"
                />
                <SaveStatus status={status} className="ml-1" />
                <ViewOnlyBadge role={role} className="ml-1" />
              </div>
              <SlidesMenuBar onAction={handleMenuAction} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <CommandSearch placeholder="Search slides..." triggerClassName="hidden lg:flex" />
            <IconButton type="button" variant="outline" onClick={() => setIsPresenting(true)} className="hidden h-9 rounded-md bg-[#202020] px-5 text-[#e5e5e5]  sm:inline-flex">
              <MonitorPlay className="h-4 w-4" />
            </IconButton>
            <IconButton label="Gemini" className="hidden sm:inline-flex">
              <Sparkles className="h-5 w-5" />
            </IconButton>
            <HelpDropdown appName="Office Slides" triggerClassName="hidden sm:flex" />
            <NotificationsDropdown triggerClassName="h-9 w-9 rounded-md hover:bg-[#242424]" />
            <ProfileDropdown triggerClassName="h-9 w-9 border-[#333333] bg-[#202020] hover:bg-[#242424]" />
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
                <RectangleHorizontal className="h-4 w-4" />
                Rectangle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addShape("square")}>
                <Square className="h-4 w-4" />
                Square
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addShape("ellipse")}>
                <Circle className="h-4 w-4" />
                Ellipse
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addShape("triangle")}>
                <Triangle className="h-4 w-4" />
                Triangle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => addShape("line")}>
                <Minus className="h-4 w-4" />
                Line
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <FormattingColorPicker
            activeColor={activeSlide.background}
            icon={PaintBucket}
            label="Slide background"
            options={TEXT_COLOR_OPTIONS}
            onSelectColor={(background) => updateSlide(activeSlide.id, { background: background ?? "#ffffff" })}
          />
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
              <FormattingColorPicker
                activeColor={selectedElement.color}
                icon={Palette}
                label="Text color"
                options={TEXT_COLOR_OPTIONS}
                onSelectColor={(color) => updateElement(selectedElement.id, { color: color ?? "#111827" })}
              />
              <FormattingColorPicker
                activeColor={selectedElement.fill === "transparent" ? null : selectedElement.fill}
                icon={Highlighter}
                label="Text fill"
                options={HIGHLIGHT_COLOR_OPTIONS}
                onSelectColor={(fill) => updateElement(selectedElement.id, { fill: fill ?? "transparent" })}
              />
              <IconButton label="Delete text box" onClick={removeSelectedElement}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </>
          ) : null}
          {selectedElement?.type === "shape" || selectedElement?.type === "image" ? (
            <>
              {selectedElement.type === "shape" ? (
                <FormattingColorPicker
                  activeColor={selectedElement.fill}
                  icon={PaintBucket}
                  label="Shape fill"
                  options={TEXT_COLOR_OPTIONS}
                  onSelectColor={(fill) => updateElement(selectedElement.id, { fill: fill ?? activeTheme.accent, color: fill ?? activeTheme.accent })}
                />
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
          <div className="ml-auto flex shrink-0 items-center gap-2">
              <ShareButton
              fileId={fileId}
              fileType="presentation"
              name={presentationName}
              render={(openShare) => (
                <IconButton label="Share" onClick={openShare}>
                  <UserPlus className="h-4 w-4" />
                </IconButton>
              )}
            />
            <ModeToolbarGroup mode={mode} onModeChange={setMode} />
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
                  <IconButton label="Delete slide" className="h-7 w-7" disabled={slides.length === 1} onClick={() => deleteSlide()}>
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
                <SlideFilmstripContextMenu
                  key={slide.id}
                  canDelete={slides.length > 1}
                  isFirst={index === 0}
                  isSkipped={Boolean(slide.skipped)}
                  layouts={layouts}
                  onOpenForContext={() => {
                    setActiveSlideId(slide.id);
                    setSelectedElementId(slide.elements[0]?.id);
                  }}
                  onCut={() => cutSlide(slide.id)}
                  onCopy={() => copySlide(slide.id)}
                  onPaste={pasteSlide}
                  onDelete={() => deleteSlide(slide.id)}
                  onNewSlide={() => addSlide(slide.layout)}
                  onCreateSlide={(layoutId) => addSlide(layoutId)}
                  onTemplates={() => addSlide(slide.layout)}
                  onDuplicate={duplicateSlide}
                  onSkip={() => toggleSkipSlide(slide.id)}
                  onChangeBackground={() => changeSlideBackground(slide.id)}
                  onApplyLayout={applyLayout}
                  onChangeTheme={() => applyTheme(activeTheme)}
                  onTransition={() => {
                    setActiveSlideId(slide.id);
                    setSidebarTool("transitions");
                  }}
                  onMoveToBeginning={() => moveSlide(slide.id, "top")}
                  onComment={() => {
                    setActiveSlideId(slide.id);
                    setSidebarTool("notes");
                  }}
                >
                  <SlideThumbnail
                    active={slide.id === activeSlide.id}
                    dragging={draggingSlideId === slide.id}
                    index={index}
                    slide={slide}
                    onClick={() => {
                      setActiveSlideId(slide.id);
                      setSelectedElementId(slide.elements[0]?.id);
                    }}
                    onDragStart={() => setDraggingSlideId(slide.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      reorderSlide(draggingSlideId, slide.id);
                      setDraggingSlideId(null);
                    }}
                    onDragEnd={() => setDraggingSlideId(null)}
                  />
                </SlideFilmstripContextMenu>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 overflow-y-auto scrollbar-subtle">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  title={`Slide ${index + 1}`}
                  onClick={() => {
                    setActiveSlideId(slide.id);
                    setSelectedElementId(slide.elements[0]?.id);
                  }}
                  className="flex w-full flex-col items-center gap-0.5"
                >
                  <span className={cn("text-[10px]", slide.id === activeSlide.id ? "text-white" : "text-[#737373]")}>{index + 1}</span>
                  <span
                    className={cn(
                      "h-[24px] w-10 shrink-0 overflow-hidden rounded-sm border",
                      slide.id === activeSlide.id ? "border-white ring-1 ring-white" : "border-[#333333]",
                    )}
                    style={{ background: slide.background }}
                  />
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#161616]">
          <div className="relative min-h-0 flex-1 overflow-auto bg-[#161616] scrollbar-subtle">
            <div className="flex min-h-[760px] min-w-[1180px] flex-col items-center px-10 pb-24 pt-9">
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="relative">
                    <FabricSlideCanvas
                      mode={mode}
                      scale={scale}
                      selectedElementId={selectedElementId}
                      slide={activeSlide}
                      onChangeElement={updateElement}
                      onSelectElement={setSelectedElementId}
                    />
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52">
                  <ContextMenuItem disabled={!selectedElement} onSelect={cutSelectedElement}>
                    Cut
                    <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem disabled={!selectedElement} onSelect={copySelectedElement}>
                    Copy
                    <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem disabled={!elementClipboardRef.current} onSelect={pasteElement}>
                    Paste
                    <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem disabled={!selectedElement} onSelect={duplicateSelectedElement}>
                    Duplicate
                    <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem disabled={!selectedElement} onSelect={() => setSelectedElementDepth("front")}>
                    Bring to front
                  </ContextMenuItem>
                  <ContextMenuItem disabled={!selectedElement} onSelect={() => moveSelectedElement("forward")}>
                    Bring forward
                  </ContextMenuItem>
                  <ContextMenuItem disabled={!selectedElement} onSelect={() => moveSelectedElement("backward")}>
                    Send backward
                  </ContextMenuItem>
                  <ContextMenuItem disabled={!selectedElement} onSelect={() => setSelectedElementDepth("back")}>
                    Send to back
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="destructive" disabled={!selectedElement} onSelect={removeSelectedElement}>
                    Delete
                    <ContextMenuShortcut>Del</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

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
            <IconButton label="Grid view" className="h-7 w-7" onClick={() => setGridOpen(true)}>
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

        <SlidesSidebar
          activeSlide={activeSlide}
          openTool={sidebarTool}
          onOpenToolChange={setSidebarTool}
          onAddSlide={addSlide}
          onApplyTheme={applyTheme}
          onSetTransition={(transition) => updateSlide(activeSlide.id, { transition })}
          onSetNotes={(notes) => updateSlide(activeSlide.id, { notes })}
        />
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

      <Dialog open={gridOpen} onOpenChange={setGridOpen}>
        <DialogContent className="w-[min(900px,calc(100vw-32px))]">
          <DialogHeader>
            <DialogTitle>All slides ({slides.length})</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[70vh] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4">
            {slides.map((slide, index) => (
              <SlideThumbnail
                key={slide.id}
                active={slide.id === activeSlideId}
                index={index}
                slide={slide}
                onClick={() => {
                  setActiveSlideId(slide.id);
                  setSelectedElementId(slide.elements[0]?.id ?? null);
                  setGridOpen(false);
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { SlidesEditor };
