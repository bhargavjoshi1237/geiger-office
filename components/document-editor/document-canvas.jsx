"use client";

import { useState } from "react";
import { EditorContent } from "@tiptap/react";
import { HorizontalRuler, VerticalRuler } from "@/components/document-editor/rulers";
import { SuggestionBar } from "@/components/document-editor/suggestion-bar";

function DocumentCanvas({ editor, zoom }) {
  const [margins, setMargins] = useState({ left: 96, right: 96 });
  const zoomScale = zoom / 100;

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#1a1a1a]">
      <HorizontalRuler margins={margins} onMarginsChange={setMargins} />
      <div className="relative min-h-0 flex-1 overflow-auto bg-[#1a1a1a] scrollbar-subtle">
        <VerticalRuler />
        <div
          className="relative mx-auto mt-12 pb-32 pt-4"
          style={{
            minHeight: `${1120 * zoomScale}px`,
            width: `min(${818 * zoomScale}px, calc((100vw - 48px) * ${zoomScale}))`,
          }}
        >
          <div
            className="document-print-page relative h-[1056px] w-[min(818px,calc(100vw-48px))] origin-top border border-[#474747] bg-[#303030] shadow-2xl shadow-black/35 lg:w-[818px]"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center" }}
          >
            <EditorContent
              editor={editor}
              className="absolute top-[96px] min-h-[760px] cursor-text text-base leading-6 text-white outline-none"
              style={{ left: `${margins.left}px`, right: `${margins.right}px` }}
            />
          </div>
        </div>
      </div>
      <SuggestionBar />
    </main>
  );
}

export { DocumentCanvas };
