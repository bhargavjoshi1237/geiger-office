"use client";

import JSZip from "jszip";
import { jsPDF } from "jspdf";

const EXPORT_OPTIONS = [
  { id: "docx", label: "Microsoft Word (.docx)" },
  { id: "pdf", label: "PDF Document (.pdf)" },
  { id: "odt", label: "OpenDocument Format (.odt)" },
  { id: "txt", label: "Plain Text (.txt)" },
  { id: "rtf", label: "Rich Text Format (.rtf)" },
  { id: "html", label: "Web Page (.html, zipped)" },
  { id: "epub", label: "EPUB Publication (.epub)" },
  { id: "md", label: "Markdown (.md)" },
];

function escapeXml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeRtf(value = "") {
  return value.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getDocumentName() {
  return "untitled-document";
}

function getDocumentParts(editor) {
  const html = editor?.getHTML() ?? "";
  const text = editor?.getText({ blockSeparator: "\n" }) ?? "";

  return { html, text };
}

function getParagraphTexts(text) {
  return text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
}

function htmlDocument(html) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Untitled document</title>
</head>
<body>
${html}
</body>
</html>`;
}

function markdownFromHtml(html, text) {
  if (!html) {
    return text;
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  return Array.from(container.childNodes)
    .map((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return node.textContent.trim();
      }

      const element = node;
      const tagName = element.tagName.toLowerCase();
      const content = element.textContent.trim();

      if (!content) {
        return "";
      }

      if (/h[1-6]/.test(tagName)) {
        return `${"#".repeat(Number(tagName[1]))} ${content}`;
      }

      if (tagName === "ul") {
        return Array.from(element.querySelectorAll("li")).map((item) => `- ${item.textContent.trim()}`).join("\n");
      }

      if (tagName === "ol") {
        return Array.from(element.querySelectorAll("li")).map((item, index) => `${index + 1}. ${item.textContent.trim()}`).join("\n");
      }

      return content;
    })
    .filter(Boolean)
    .join("\n\n");
}

async function exportDocx(text) {
  const zip = new JSZip();
  const paragraphs = getParagraphTexts(text);
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.map((paragraph) => `<w:p><w:r><w:t>${escapeXml(paragraph)}</w:t></w:r></w:p>`).join("")}
    <w:sectPr />
  </w:body>
</w:document>`;

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.folder("word").file("document.xml", documentXml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

async function exportOdt(text) {
  const zip = new JSZip();
  const paragraphs = getParagraphTexts(text);

  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
  zip.file("META-INF/manifest.xml", `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`);
  zip.file("content.xml", `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
  <office:body>
    <office:text>
      ${paragraphs.map((paragraph) => `<text:p>${escapeXml(paragraph)}</text:p>`).join("")}
    </office:text>
  </office:body>
</office:document-content>`);

  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.oasis.opendocument.text" });
}

async function exportHtmlZip(html) {
  const zip = new JSZip();

  zip.file("index.html", htmlDocument(html));

  return zip.generateAsync({ type: "blob", mimeType: "application/zip" });
}

async function exportEpub(html, text) {
  const zip = new JSZip();
  const title = getParagraphTexts(text)[0] || "Untitled document";

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
  zip.file("OEBPS/content.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">geiger-office-document</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>`);
  zip.file("OEBPS/nav.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>${escapeXml(title)}</title></head>
  <body><nav epub:type="toc"><ol><li><a href="content.xhtml">${escapeXml(title)}</a></li></ol></nav></body>
</html>`);
  zip.file("OEBPS/content.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head><title>${escapeXml(title)}</title></head>
  <body>${html}</body>
</html>`);

  return zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}

function exportPdf(text) {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const lines = pdf.splitTextToSize(text || " ", 468);
  let cursorY = 72;

  lines.forEach((line) => {
    if (cursorY > 720) {
      pdf.addPage();
      cursorY = 72;
    }

    pdf.text(line, 72, cursorY);
    cursorY += 16;
  });

  return pdf.output("blob");
}

async function exportDocument(editor, format) {
  const { html, text } = getDocumentParts(editor);
  const filename = getDocumentName();

  if (format === "docx") {
    downloadBlob(await exportDocx(text), `${filename}.docx`);
  } else if (format === "pdf") {
    downloadBlob(exportPdf(text), `${filename}.pdf`);
  } else if (format === "odt") {
    downloadBlob(await exportOdt(text), `${filename}.odt`);
  } else if (format === "txt") {
    downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${filename}.txt`);
  } else if (format === "rtf") {
    downloadBlob(new Blob([`{\\rtf1\\ansi\n${escapeRtf(text).replace(/\n/g, "\\par\n")}\n}`], { type: "application/rtf" }), `${filename}.rtf`);
  } else if (format === "html") {
    downloadBlob(await exportHtmlZip(html), `${filename}.zip`);
  } else if (format === "epub") {
    downloadBlob(await exportEpub(html, text), `${filename}.epub`);
  } else if (format === "md") {
    downloadBlob(new Blob([markdownFromHtml(html, text)], { type: "text/markdown;charset=utf-8" }), `${filename}.md`);
  }
}

export { EXPORT_OPTIONS, exportDocument };
