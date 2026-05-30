// Cell value coercion and display formatting.

export function coerceCellValue(value) {
  if (value === "" || value == null) return "";
  if (typeof value === "number") return value;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && String(value).trim() !== "" ? numericValue : value;
}

export function formatDisplayValue(value, style) {
  if (value == null || value === "") return "";
  if (value instanceof Error) return "#ERROR";
  if (style.numberFormat === "currency" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(Number(value));
  }
  if (style.numberFormat === "percent" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: "percent" }).format(
      Number(value),
    );
  }
  if (style.numberFormat === "number" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value));
  }

  return String(value);
}
