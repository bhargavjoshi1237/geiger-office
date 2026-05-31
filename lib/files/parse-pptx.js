"use client";

// Best-effort .pptx importer. A .pptx is a ZIP of XML parts; we read each slide
// part, pull out text shapes with their position/size (EMU → canvas units), font
// size, weight and alignment, and rebuild them as the slide editor's text
// elements. Images, charts, tables and exact theming are not imported — text and
// layout are preserved, which covers the common case.

import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/slides-editor/constants";
import { themeOptions } from "@/components/slides-editor/data/theme-presets";
import { createTextElement } from "@/components/slides-editor/factories";

const EMU_PER_POINT = 12700; // 1pt = 12700 EMU
const DEFAULT_SLIDE_EMU_W = 9144000; // 10in (4:3) fallback
const DEFAULT_SLIDE_EMU_H = 6858000; // 7.5in fallback

const parser = typeof DOMParser !== "undefined" ? new DOMParser() : null;

function parseXml(text) {
  return parser.parseFromString(text, "application/xml");
}

function firstTag(el, tag) {
  return el?.getElementsByTagName(tag)?.[0] ?? null;
}

const ALIGN_MAP = { l: "left", ctr: "center", r: "right", just: "left" };

// Pull readable text out of a <p:txBody>, paragraph by paragraph.
function readTextBody(txBody) {
  const paragraphs = Array.from(txBody.getElementsByTagName("a:p"));
  const lines = paragraphs.map((p) =>
    Array.from(p.getElementsByTagName("a:t"))
      .map((t) => t.textContent ?? "")
      .join(""),
  );
  return lines.join("\n").replace(/\n+$/g, "");
}

// Read run-level formatting from the first run that carries it.
function readRunProps(txBody) {
  const rPr = firstTag(txBody, "a:rPr");
  const pPr = firstTag(txBody, "a:pPr");
  const sz = rPr?.getAttribute("sz"); // hundredths of a point
  const fill = firstTag(rPr ?? txBody, "a:srgbClr");
  return {
    pt: sz ? Number(sz) / 100 : null,
    bold: rPr?.getAttribute("b") === "1",
    italic: rPr?.getAttribute("i") === "1",
    underline: rPr?.getAttribute("u") ? rPr.getAttribute("u") !== "none" : false,
    color: fill ? `#${fill.getAttribute("val")}` : null,
    align: ALIGN_MAP[pPr?.getAttribute("algn")] ?? "left",
  };
}

function shapeToElement(sp, { scaleX, scaleY, theme }, fallbackIndex) {
  const txBody = firstTag(sp, "p:txBody");
  if (!txBody) return null;
  const text = readTextBody(txBody);
  if (!text.trim()) return null;

  const ph = firstTag(sp, "p:ph");
  const phType = ph?.getAttribute("type") ?? null;
  const isTitle = phType === "title" || phType === "ctrTitle";

  const off = firstTag(sp, "a:off");
  const ext = firstTag(sp, "a:ext");
  const hasFrame = off && ext;

  const x = hasFrame ? Number(off.getAttribute("x")) * scaleX : 96;
  const y = hasFrame ? Number(off.getAttribute("y")) * scaleY : 80 + fallbackIndex * 120;
  const w = hasFrame ? Number(ext.getAttribute("cx")) * scaleX : SLIDE_WIDTH - 192;
  const h = hasFrame ? Number(ext.getAttribute("cy")) * scaleY : 110;

  const props = readRunProps(txBody);
  const pt = props.pt ?? (isTitle ? 40 : 18);
  const fontSize = Math.max(8, Math.round(pt * EMU_PER_POINT * scaleX));

  return createTextElement({
    text,
    x: Math.round(x),
    y: Math.round(y),
    w: Math.max(40, Math.round(w)),
    h: Math.max(24, Math.round(h)),
    fontSize,
    bold: props.bold || isTitle,
    italic: props.italic,
    underline: props.underline,
    align: props.align,
    color: props.color ?? theme.text,
  });
}

// Resolve slide parts in presentation order using the relationship map; fall
// back to a numeric sort of slideN.xml when anything is missing.
function orderedSlidePaths(zip, presentationXml, relsXml) {
  const numericFallback = () =>
    Object.keys(zip.files)
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
      .sort((a, b) => {
        const n = (s) => Number(s.match(/slide(\d+)\.xml$/)[1]);
        return n(a) - n(b);
      });

  if (!presentationXml || !relsXml) return numericFallback();

  try {
    const relMap = {};
    Array.from(relsXml.getElementsByTagName("Relationship")).forEach((rel) => {
      relMap[rel.getAttribute("Id")] = rel.getAttribute("Target");
    });
    const ids = Array.from(presentationXml.getElementsByTagName("p:sldId"));
    const paths = ids
      .map((sld) => relMap[sld.getAttribute("r:id")])
      .filter(Boolean)
      .map((target) => `ppt/${target.replace(/^\/?ppt\//, "").replace(/^\.\.\//, "")}`);
    const valid = paths.filter((p) => zip.files[p]);
    return valid.length ? valid : numericFallback();
  } catch {
    return numericFallback();
  }
}

export async function buildPresentationContent(file) {
  if (!parser) throw new Error("PowerPoint import is only available in the browser.");

  const mod = await import("jszip");
  const JSZip = mod.default ?? mod;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const presentationFile = zip.files["ppt/presentation.xml"];
  const relsFile = zip.files["ppt/_rels/presentation.xml.rels"];
  const presentationXml = presentationFile ? parseXml(await presentationFile.async("string")) : null;
  const relsXml = relsFile ? parseXml(await relsFile.async("string")) : null;

  // Slide dimensions (EMU) → canvas scale factors.
  const sldSz = presentationXml ? firstTag(presentationXml, "p:sldSz") : null;
  const emuW = Number(sldSz?.getAttribute("cx")) || DEFAULT_SLIDE_EMU_W;
  const emuH = Number(sldSz?.getAttribute("cy")) || DEFAULT_SLIDE_EMU_H;
  const scaleX = SLIDE_WIDTH / emuW;
  const scaleY = SLIDE_HEIGHT / emuH;

  const theme = themeOptions[0]; // clean / white
  const paths = orderedSlidePaths(zip, presentationXml, relsXml);
  if (paths.length === 0) throw new Error("No slides found in this presentation.");

  const slides = [];
  for (const path of paths) {
    const xml = parseXml(await zip.files[path].async("string"));
    const shapes = Array.from(xml.getElementsByTagName("p:sp"));
    const elements = shapes
      .map((sp, index) => shapeToElement(sp, { scaleX, scaleY, theme }, index))
      .filter(Boolean);

    const titleEl = elements.find((el) => el.bold) ?? elements[0];
    slides.push({
      id: crypto.randomUUID(),
      title: (titleEl?.text ?? `Slide ${slides.length + 1}`).split("\n")[0].slice(0, 80) || `Slide ${slides.length + 1}`,
      layout: "content",
      themeId: theme.id,
      background: theme.background,
      notes: "",
      transition: "None",
      elements,
    });
  }

  return { slides };
}
