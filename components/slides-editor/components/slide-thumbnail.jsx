"use client";

import Image from "next/image";
import { GripVertical } from "lucide-react";
import { SLIDE_WIDTH } from "@/components/slides-editor/constants";
import { cn } from "@/lib/utils";

export function SlideThumbnail({ active, dragging, index, slide, onClick, onDragEnd, onDragOver, onDragStart, onDrop }) {
  const scale = 156 / SLIDE_WIDTH;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex w-full items-start gap-1 rounded-md p-1 transition-colors hover:bg-[#242424]",
        active && "bg-[#242424]",
        dragging && "opacity-40",
      )}
    >
      <span className="flex w-5 shrink-0 flex-col items-center justify-between self-stretch py-1">
        <span className="text-xs text-[#a3a3a3]">{index + 1}</span>
        <GripVertical className="h-3.5 w-3.5 cursor-grab text-[#737373] opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 justify-center text-left"
      >
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
    </div>
  );
}
