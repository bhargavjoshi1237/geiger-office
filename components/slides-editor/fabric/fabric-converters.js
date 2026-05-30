// Convert between slide-element models and Fabric.js canvas objects.

import {
  Ellipse as FabricEllipse,
  FabricImage,
  Line as FabricLine,
  Rect as FabricRect,
  Textbox as FabricTextbox,
  Triangle as FabricTriangle,
} from "fabric";

export function getElementPatchFromFabricObject(object) {
  const width = Math.max(1, Math.round((object.width ?? 1) * (object.scaleX ?? 1)));
  const height = Math.max(1, Math.round((object.height ?? 1) * (object.scaleY ?? 1)));
  const patch = {
    angle: Math.round(object.angle ?? 0),
    h: height,
    w: width,
    x: Math.round(object.left ?? 0),
    y: Math.round(object.top ?? 0),
  };

  if (object.geigerType === "text") {
    patch.text = object.text ?? "";
    patch.fontSize = Math.round(object.fontSize ?? 36);
  }

  return patch;
}

export async function createFabricObjectFromElement(element) {
  const baseOptions = {
    angle: element.angle ?? 0,
    cornerColor: "#ffffff",
    cornerSize: 11,
    cornerStrokeColor: "#2563eb",
    geigerId: element.id,
    geigerType: element.type,
    left: element.x,
    lockScalingFlip: true,
    objectCaching: false,
    originX: "left",
    originY: "top",
    padding: 0,
    transparentCorners: false,
    top: element.y,
  };

  if (element.type === "text") {
    return new FabricTextbox(element.text, {
      ...baseOptions,
      backgroundColor: element.fill === "transparent" ? "" : element.fill,
      fill: element.color,
      fontFamily: element.fontFamily,
      fontSize: element.fontSize,
      fontStyle: element.italic ? "italic" : "normal",
      fontWeight: element.bold ? "bold" : "normal",
      height: element.h,
      linethrough: false,
      splitByGrapheme: false,
      textAlign: element.align,
      underline: element.underline,
      width: element.w,
    });
  }

  if (element.type === "shape" && element.shape === "ellipse") {
    return new FabricEllipse({
      ...baseOptions,
      fill: element.fill,
      height: element.h,
      opacity: element.opacity,
      rx: element.w / 2,
      ry: element.h / 2,
      stroke: element.color,
      strokeWidth: 0,
      width: element.w,
    });
  }

  if (element.type === "shape" && element.shape === "triangle") {
    return new FabricTriangle({
      ...baseOptions,
      fill: element.fill,
      height: element.h,
      opacity: element.opacity,
      stroke: element.color,
      strokeWidth: 0,
      width: element.w,
    });
  }

  if (element.type === "shape" && element.shape === "line") {
    return new FabricLine([0, 0, element.w, 0], {
      ...baseOptions,
      opacity: element.opacity,
      stroke: element.fill,
      strokeWidth: 8,
      strokeLineCap: "round",
    });
  }

  if (element.type === "shape" && element.shape === "square") {
    return new FabricRect({
      ...baseOptions,
      fill: element.fill,
      height: element.h,
      opacity: element.opacity,
      stroke: element.color,
      strokeWidth: 0,
      width: element.w,
    });
  }

  if (element.type === "shape") {
    return new FabricRect({
      ...baseOptions,
      fill: element.fill,
      height: element.h,
      opacity: element.opacity,
      rx: 22,
      ry: 22,
      stroke: element.color,
      strokeWidth: 0,
      width: element.w,
    });
  }

  const image = await FabricImage.fromURL(element.src, { crossOrigin: "anonymous" });
  image.set({
    ...baseOptions,
    alt: element.alt,
    scaleX: element.w / Math.max(1, image.width ?? element.w),
    scaleY: element.h / Math.max(1, image.height ?? element.h),
  });

  return image;
}
