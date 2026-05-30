// Grid dimensions and visual defaults for the spreadsheet editor.

export const COLUMN_COUNT = 26;
export const ROW_COUNT = 100;
export const columns = Array.from({ length: COLUMN_COUNT }, (_, index) =>
  String.fromCharCode(65 + index),
);
export const rows = Array.from({ length: ROW_COUNT }, (_, index) => index + 1);

export const defaultCellWidth = 112;
export const defaultRowHeight = 28;
export const minCellWidth = 64;
export const minRowHeight = 24;

export const SHEET_GRID_COLORS = {
  header: "#202020",
  range: "#2e2e2e",
  active: "#3a3a3a",
  borderStrong: "#474747",
  text: "#ffffff",
  textSecondary: "#a3a3a3",
};

export const defaultStyle = {
  align: "left",
  bold: false,
  fillColor: null,
  fontSize: 14,
  italic: false,
  numberFormat: "auto",
  outlined: false,
  strike: false,
  textColor: SHEET_GRID_COLORS.text,
  underline: false,
};

export const formulaTemplates = [
  { label: "SUM", value: "=SUM(B2:B4)" },
  { label: "AVERAGE", value: "=AVERAGE(B2:B4)" },
  { label: "MIN", value: "=MIN(B2:B4)" },
  { label: "MAX", value: "=MAX(B2:B4)" },
  { label: "COUNT", value: "=COUNT(B2:B4)" },
];
