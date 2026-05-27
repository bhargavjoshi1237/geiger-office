"use client";

import { useState } from "react";

const horizontalRulerWidth = 818;
const horizontalRulerUnit = 96;
const horizontalSnapStep = horizontalRulerUnit / 8;
const horizontalMajorMarks = Array.from({ length: 8 }, (_, index) => index + 1);
const horizontalTicks = Array.from(
  { length: Math.floor(horizontalRulerWidth / (horizontalRulerUnit / 4)) },
  (_, index) => (index + 1) * (horizontalRulerUnit / 4),
);
const verticalMarks = Array.from({ length: 8 }, (_, index) => index + 1);
const verticalRulerUnit = 96;
const verticalTicks = Array.from({ length: verticalMarks.length * 4 }, (_, index) => (index + 1) * (verticalRulerUnit / 4));
const minimumWritingWidth = 280;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function snapToRuler(value) {
  return Math.round(value / horizontalSnapStep) * horizontalSnapStep;
}

function RulerHandle({ label, position, side, onDrag, onNudge }) {
  const [isDragging, setIsDragging] = useState(false);

  function startDrag(handle, clientX, removeEvents) {
    const ruler = handle.closest("[data-horizontal-ruler]");
    if (!ruler) return;

    const rect = ruler.getBoundingClientRect();

    setIsDragging(true);
    onDrag(clientX - rect.left);

    function handleMove(moveEvent) {
      onDrag(moveEvent.clientX - rect.left);
    }

    function handleEnd() {
      setIsDragging(false);
      removeEvents(handleMove, handleEnd);
    }

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleEnd, { once: true });
    document.addEventListener("pointercancel", handleEnd, { once: true });
  }

  function handlePointerDown(event) {
    event.preventDefault();
    const handle = event.currentTarget;

    startDrag(handle, event.clientX, (handleMove, handleEnd) => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleEnd);
      document.removeEventListener("pointercancel", handleEnd);
    });
  }

  function handleMouseDown(event) {
    if (window.PointerEvent) return;

    event.preventDefault();
    const handle = event.currentTarget;
    const ruler = handle.closest("[data-horizontal-ruler]");
    if (!ruler) return;

    const rect = ruler.getBoundingClientRect();

    setIsDragging(true);
    onDrag(event.clientX - rect.left);

    function handleMove(moveEvent) {
      onDrag(moveEvent.clientX - rect.left);
    }

    function handleEnd() {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
    }

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd, { once: true });
  }

  function handleKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    onNudge(direction * horizontalSnapStep);
  }

  return (
    <button
      type="button"
      role="slider"
      aria-label={label}
      aria-valuemin={24}
      aria-valuemax={horizontalRulerWidth - 24}
      aria-valuenow={Math.round(position)}
      title={label}
      data-dragging={isDragging}
      data-side={side}
      className="group absolute top-[14px] z-10 h-3 w-5 -translate-x-1/2 cursor-ew-resize touch-none border-0 bg-transparent p-0 focus-visible:outline-none"
      style={{ left: `${position}px` }}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
    >
      <span className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-[#d7d7d7] opacity-80 transition-opacity group-hover:opacity-100 group-data-[dragging=true]:opacity-100" />
      <span className="absolute left-1/2 top-[7px] h-[5px] w-px -translate-x-1/2 bg-[#d7d7d7]/70 opacity-0 transition-opacity group-hover:opacity-100 group-data-[dragging=true]:opacity-100" />
    </button>
  );
}

function HorizontalRuler({ margins, onMarginsChange }) {
  const leftMargin = margins.left;
  const rightMargin = margins.right;
  const rightPosition = horizontalRulerWidth - rightMargin;

  function updateLeftMargin(position) {
    onMarginsChange((current) => ({
      ...current,
      left: clamp(snapToRuler(position), 24, horizontalRulerWidth - current.right - minimumWritingWidth),
    }));
  }

  function updateRightMargin(position) {
    onMarginsChange((current) => ({
      ...current,
      right: clamp(snapToRuler(horizontalRulerWidth - position), 24, horizontalRulerWidth - current.left - minimumWritingWidth),
    }));
  }

  function nudgeLeftMargin(offset) {
    onMarginsChange((current) => ({
      ...current,
      left: clamp(current.left + offset, 24, horizontalRulerWidth - current.right - minimumWritingWidth),
    }));
  }

  function nudgeRightMargin(offset) {
    onMarginsChange((current) => ({
      ...current,
      right: clamp(current.right - offset, 24, horizontalRulerWidth - current.left - minimumWritingWidth),
    }));
  }

  return (
    <div className="hidden h-7 shrink-0 justify-center border-b border-[#2b2b2b] bg-[#1f1f1f] lg:flex">
      <div className="relative h-full w-[818px]" data-horizontal-ruler>
        <div className="absolute inset-x-0 top-4 h-px bg-[#343434]" />
        <div className="absolute left-0 top-4 h-2 border-l border-[#333333]" style={{ width: `${leftMargin}px` }} />
        <div className="absolute right-0 top-4 h-2" style={{ width: `${rightMargin}px` }} />
        <div
          className="absolute top-4 h-2 border-x border-white/10"
          style={{ left: `${leftMargin}px`, right: `${rightMargin}px` }}
        />
        {horizontalTicks.map((offset) => {
          const isMajor = offset % horizontalRulerUnit === 0;
          const isHalf = offset % (horizontalRulerUnit / 2) === 0;

          return (
            <span
              key={offset}
              className="absolute top-4 w-px bg-[#555555]"
              style={{
                left: `${offset}px`,
                height: isMajor ? "8px" : isHalf ? "6px" : "4px",
                opacity: isMajor ? 0.8 : isHalf ? 0.55 : 0.35,
              }}
            />
          );
        })}
        {horizontalMajorMarks.map((mark) => (
          <span
            key={mark}
            className="absolute top-0 -translate-x-1/2 text-[11px] tabular-nums text-[#9a9a9a]"
            style={{ left: `${mark * horizontalRulerUnit}px` }}
          >
            {mark}
          </span>
        ))}
        <RulerHandle
          label="Drag left document margin"
          side="left"
          position={leftMargin}
          onDrag={updateLeftMargin}
          onNudge={nudgeLeftMargin}
        />
        <RulerHandle
          label="Drag right document margin"
          side="right"
          position={rightPosition}
          onDrag={updateRightMargin}
          onNudge={nudgeRightMargin}
        />
      </div>
    </div>
  );
}

function VerticalRuler() {
  return (
    <div className="absolute left-0 top-0 hidden h-full w-4 border-r border-[#333333] bg-[#202020] text-[11px] text-[#a3a3a3] lg:block">
      {verticalTicks.map((offset) => (
        <span
          key={offset}
          className="absolute right-1 h-px w-1.5 bg-[#737373]"
          style={{ top: `${offset}px` }}
        />
      ))}
      {verticalMarks.map((mark) => (
        <span
          key={mark}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-90deg] tabular-nums"
          style={{ top: `${mark * verticalRulerUnit}px` }}
        >
          {mark}
        </span>
      ))}
    </div>
  );
}

export { HorizontalRuler, VerticalRuler };
