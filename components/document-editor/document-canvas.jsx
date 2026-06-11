"use client";

import { useState } from "react";
import { EditorContent } from "@tiptap/react";
import { HorizontalRuler, VerticalRuler } from "@/components/document-editor/rulers";
import { SuggestionBar } from "@/components/document-editor/suggestion-bar";
import { useIsMobile } from "@/lib/hooks/use-media-query";

function DocumentCanvas({ editor, zoom }) {
  const [margins, setMargins] = useState({ left: 96, right: 96 });
  const isMobile = useIsMobile();
  const zoomScale = zoom / 100;

  // On phones the page is only ~100vw wide, so the desktop 96px page margins
  // would leave almost no room for text. Tighten them and drop the rulers.
  const effectiveMargins = isMobile ? { left: 24, right: 24 } : margins;

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-subtle">
      {!isMobile ? <HorizontalRuler margins={margins} onMarginsChange={setMargins} /> : null}
      <div className="relative min-h-0 flex-1 overflow-auto bg-surface-subtle scrollbar-subtle">
        {!isMobile ? <VerticalRuler /> : null}
        <div
          className="relative mx-auto mt-4 pb-32 pt-2 md:mt-12 md:pt-4"
          style={{
            minHeight: `${1120 * zoomScale}px`,
            width: `min(${818 * zoomScale}px, calc((100vw - 32px) * ${zoomScale}))`,
          }}
        >
          <div
            className="document-print-page relative h-[1056px] w-[min(818px,calc(100vw-32px))] origin-top border border-border-strong bg-[#303030] shadow-2xl shadow-black/35 lg:w-[818px]"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center" }}
          >
            <EditorContent
              editor={editor}
              className="absolute top-[64px] min-h-[760px] cursor-text text-base leading-6 text-white outline-none md:top-[96px]"
              style={{ left: `${effectiveMargins.left}px`, right: `${effectiveMargins.right}px` }}
            />
          </div>
        </div>
      </div>
      <SuggestionBar />
    </main>
  );
}

export { DocumentCanvas };
