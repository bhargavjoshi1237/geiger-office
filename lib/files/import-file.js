"use client";

// Converts an uploaded file into the { type, name, content } shape the office
// file API expects. Heavy parsers (xlsx, mammoth, tiptap) are imported lazily so
// they only load when a user actually uploads something.

import { COLUMN_COUNT, ROW_COUNT, defaultCellWidth, defaultRowHeight } from "@/components/sheet-editor/constants";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

// Extension -> office file type. The accept string and validation both derive
// from this single source of truth.
const EXTENSION_TYPE = {
  csv: "spreadsheet",
  tsv: "spreadsheet",
  xlsx: "spreadsheet",
  xls: "spreadsheet",
  txt: "document",
  md: "document",
  markdown: "document",
  html: "document",
  htm: "document",
  docx: "document",
  pptx: "presentation",
};

export const UPLOAD_ACCEPT = Object.keys(EXTENSION_TYPE)
  .map((ext) => `.${ext}`)
  .join(",");

export const UPLOAD_HINT =
  "Spreadsheets (.csv, .xlsx, .xls), documents (.docx, .txt, .md, .html) and presentations (.pptx)";

function extensionOf(name) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

function baseName(name) {
  const dot = name.lastIndexOf(".");
  return (dot === -1 ? name : name.slice(0, dot)).trim() || "Untitled";
}

export function isSupportedUpload(file) {
  return Boolean(EXTENSION_TYPE[extensionOf(file.name)]);
}

// ── Spreadsheet ──────────────────────────────────────────────────────────────

function cellToString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

async function buildSpreadsheetContent(file) {
  const mod = await import("xlsx");
  const XLSX = mod.default ?? mod; // xlsx is CJS — normalize the interop shape
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheets = workbook.SheetNames.map((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    // raw: false → dates/numbers come through as their displayed text.
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, blankrows: false });

    const cells = {};
    rows.forEach((row, r) => {
      if (r >= ROW_COUNT) return; // grid is fixed at ROW_COUNT rows
      (row ?? []).forEach((value, c) => {
        if (c >= COLUMN_COUNT) return; // ...and COLUMN_COUNT columns
        const text = cellToString(value);
        if (text !== "") cells[`${r + 1}:${c + 1}`] = text;
      });
    });

    return {
      id: crypto.randomUUID(),
      name: sheetName || `Sheet${index + 1}`,
      cells,
      styles: {},
      notes: {},
      names: [],
    };
  });

  if (sheets.length === 0) {
    sheets.push({ id: crypto.randomUUID(), name: "Sheet1", cells: {}, styles: {}, notes: {}, names: [] });
  }

  return {
    sheets,
    columnWidths: Array.from({ length: COLUMN_COUNT }, () => defaultCellWidth),
    rowHeights: Array.from({ length: ROW_COUNT }, () => defaultRowHeight),
  };
}

// ── Document ─────────────────────────────────────────────────────────────────

function plainTextToDoc(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content = lines.map((line) =>
    line.length === 0
      ? { type: "paragraph" }
      : { type: "paragraph", content: [{ type: "text", text: line }] },
  );
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

async function htmlToDoc(html) {
  const [{ generateJSON }, { createDocumentExtensions }] = await Promise.all([
    import("@tiptap/react"),
    import("@/components/document-editor/document-extensions"),
  ]);
  return generateJSON(html, createDocumentExtensions());
}

async function buildDocumentContent(file, ext) {
  if (ext === "docx") {
    const mod = await import("mammoth");
    const mammoth = mod.default ?? mod; // mammoth is CJS — normalize the interop shape
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    return htmlToDoc(html || "");
  }
  if (ext === "html" || ext === "htm") {
    return htmlToDoc(await file.text());
  }
  // txt / md / markdown → keep the raw text as paragraphs.
  return plainTextToDoc(await file.text());
}

// ── Entry point ──────────────────────────────────────────────────────────────

/**
 * Parse an uploaded File into { type, name, content } ready to POST to the file
 * API. Throws an Error with a user-facing message on unsupported types, files
 * that are too large, or parse failures.
 */
export async function buildOfficeFileFromUpload(file) {
  const ext = extensionOf(file.name);
  const type = EXTENSION_TYPE[ext];

  if (!type) {
    throw new Error("Unsupported file type. Upload a spreadsheet (.csv, .xlsx, .xls), document (.docx, .txt, .md, .html) or presentation (.pptx).");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`That file is too large. The maximum upload size is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`);
  }

  let content;
  try {
    if (type === "spreadsheet") {
      content = await buildSpreadsheetContent(file);
    } else if (type === "presentation") {
      const { buildPresentationContent } = await import("@/lib/files/parse-pptx");
      content = await buildPresentationContent(file);
    } else {
      content = await buildDocumentContent(file, ext);
    }
  } catch (err) {
    throw new Error(`Couldn't read "${file.name}". The file may be corrupted or in an unexpected format.`);
  }

  return { type, name: baseName(file.name), content };
}
