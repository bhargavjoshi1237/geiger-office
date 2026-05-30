"use client";

import { useEffect, useRef } from "react";
import { Canvas as FabricCanvasEngine } from "fabric";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/components/slides-editor/constants";
import {
  createFabricObjectFromElement,
  getElementPatchFromFabricObject,
} from "@/components/slides-editor/fabric/fabric-converters";

export function FabricSlideCanvas({ mode, scale, selectedElementId, slide, onChangeElement, onSelectElement }) {
  const canvasElementRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isSyncingRef = useRef(false);
  const onChangeElementRef = useRef(onChangeElement);
  const onSelectElementRef = useRef(onSelectElement);
  const selectedIdRef = useRef(selectedElementId);

  useEffect(() => {
    onChangeElementRef.current = onChangeElement;
    onSelectElementRef.current = onSelectElement;
    selectedIdRef.current = selectedElementId;
  }, [onChangeElement, onSelectElement, selectedElementId]);

  useEffect(() => {
    if (!canvasElementRef.current) return undefined;

    const canvas = new FabricCanvasEngine(canvasElementRef.current, {
      backgroundColor: "#ffffff",
      fireRightClick: true, // emit mouse:down for the right button so right-click can select before the context menu opens
      height: SLIDE_HEIGHT,
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: false, // let the native/Radix context menu open
      width: SLIDE_WIDTH,
    });

    fabricCanvasRef.current = canvas;

    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      onSelectElementRef.current(activeObject?.geigerId);
    };

    // Right-click selects the object under the cursor (like Google Slides) so the
    // context menu acts on it; clicking empty space clears the selection.
    const handleMouseDown = (opt) => {
      if (opt.e?.button !== 2) return;
      if (opt.target) {
        canvas.setActiveObject(opt.target);
        onSelectElementRef.current(opt.target.geigerId);
      } else {
        canvas.discardActiveObject();
        onSelectElementRef.current(undefined);
      }
      canvas.requestRenderAll();
    };

    const handleModified = (event) => {
      if (isSyncingRef.current || !event.target?.geigerId) return;
      onChangeElementRef.current(event.target.geigerId, getElementPatchFromFabricObject(event.target));
    };

    const handleTextEditingExited = (event) => {
      if (isSyncingRef.current || !event.target?.geigerId) return;
      onChangeElementRef.current(event.target.geigerId, getElementPatchFromFabricObject(event.target));
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelection);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("object:modified", handleModified);
    canvas.on("text:editing:exited", handleTextEditingExited);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Rebuild the canvas objects only when the slide content or edit mode changes.
  // Selection is handled by a separate effect so clicking/dragging a shape does
  // not tear down and recreate the object mid-interaction.
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;
    isSyncingRef.current = true;

    async function syncObjects() {
      canvas.clear();
      canvas.set({ backgroundColor: slide.background });
      canvas.selection = mode === "edit";

      const objects = await Promise.all(slide.elements.map((element) => createFabricObjectFromElement(element)));
      if (cancelled) return;

      objects.forEach((object) => {
        object.selectable = mode === "edit";
        object.evented = mode === "edit";
        canvas.add(object);
      });

      const selectedObject = objects.find((object) => object.geigerId === selectedIdRef.current);
      if (selectedObject) {
        canvas.setActiveObject(selectedObject);
      }

      canvas.requestRenderAll();
      isSyncingRef.current = false;
    }

    syncObjects();

    return () => {
      cancelled = true;
      isSyncingRef.current = false;
    };
  }, [mode, slide]);

  // Reflect external selection changes onto the existing canvas without rebuilding.
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isSyncingRef.current) return;
    if (canvas.getActiveObject()?.geigerId === selectedElementId) return;

    const target = canvas.getObjects().find((object) => object.geigerId === selectedElementId);
    if (target) canvas.setActiveObject(target);
    else canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [selectedElementId]);

  return (
    <div
      className="relative origin-top overflow-hidden border border-[#333333] shadow-2xl shadow-black/35"
      style={{
        height: SLIDE_HEIGHT,
        marginBottom: -(SLIDE_HEIGHT * (1 - scale)),
        transform: `scale(${scale})`,
        width: SLIDE_WIDTH,
      }}
    >
      <canvas ref={canvasElementRef} aria-label="Slide canvas" />
    </div>
  );
}
