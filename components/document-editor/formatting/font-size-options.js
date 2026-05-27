const DEFAULT_FONT_SIZE = 11;
const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 99;
const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96];

function clampFontSize(size) {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));
}

function parseFontSize(fontSize) {
  if (!fontSize) {
    return DEFAULT_FONT_SIZE;
  }

  const parsed = Number.parseInt(String(fontSize), 10);

  return Number.isFinite(parsed) ? clampFontSize(parsed) : DEFAULT_FONT_SIZE;
}

function toFontSizeValue(size) {
  return `${clampFontSize(size)}pt`;
}

export { DEFAULT_FONT_SIZE, FONT_SIZE_OPTIONS, MAX_FONT_SIZE, MIN_FONT_SIZE, clampFontSize, parseFontSize, toFontSizeValue };
