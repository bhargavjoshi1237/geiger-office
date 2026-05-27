const ZOOM_PRESETS = [50, 75, 100, 125];
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 25;

function clampZoom(zoom) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export { MAX_ZOOM, MIN_ZOOM, ZOOM_PRESETS, ZOOM_STEP, clampZoom };
