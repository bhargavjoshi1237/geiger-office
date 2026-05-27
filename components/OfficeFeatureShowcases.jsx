"use client";

import Link from "next/link";
import { ArrowRight, FileText, Presentation, Sheet } from "lucide-react";
import { DocumentEditor } from "@/components/document-editor/document-editor";
import { SheetEditor } from "@/components/sheet-editor/sheet-editor";
import { SlidesEditor } from "@/components/slides-editor/slides-editor";

const featureShowcases = [
  {
    title: "Write with the full document editor.",
    description:
      "Draft pages, format text, manage document tabs, and use the same controls available in Geiger Office documents.",
    ctaLabel: "Open Docs",
    href: "/document/welcome",
    icon: FileText,
    Editor: DocumentEditor,
  },
  {
    title: "Work directly in live spreadsheets.",
    description:
      "Select cells, edit formulas, manage sheets, review summary data, and explore workbook controls from the landing page.",
    ctaLabel: "Open Sheets",
    href: "/sheet/welcome",
    icon: Sheet,
    Editor: SheetEditor,
  },
  {
    title: "Shape decks in the slide editor.",
    description:
      "Use the presentation canvas, slide strip, layout controls, themes, notes, and editable objects without leaving the product page.",
    ctaLabel: "Open Slides",
    href: "/slide/welcome",
    icon: Presentation,
    Editor: SlidesEditor,
  },
];

export default function OfficeFeatureShowcases() {
  return (
    <section className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 md:mt-16">
      {featureShowcases.map(({ title, description, ctaLabel, href, icon: Icon, Editor }, index) => {
        const reverse = index % 2 === 1;

        return (
        <article
          key={title}
          className="grid overflow-hidden rounded-2xl border border-zinc-800 bg-[#191919] md:grid-cols-[minmax(280px,0.36fr)_minmax(0,0.64fr)]"
        >
          <div className={`flex min-w-0 flex-col items-start justify-center p-5 sm:p-7 ${reverse ? "md:order-2" : ""}`}>
            <Icon className="mb-4 h-5 w-5 text-zinc-300" />
            <h2 className="text-2xl font-semibold leading-tight text-white">{title}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">{description}</p>
            <Link
              href={href}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-zinc-100 px-5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={`min-h-[360px] min-w-0 border-t border-zinc-800 bg-[#161616] p-2 sm:p-3 md:border-t-0 ${
              reverse ? "md:order-1 md:border-r" : "md:border-l"
            }`}
          >
            <div className="h-[360px] overflow-hidden rounded-xl border border-zinc-800 bg-[#161616] shadow-2xl md:h-[430px] [&>div]:!h-full">
              <Editor />
            </div>
          </div>
        </article>
        );
      })}
    </section>
  );
}
