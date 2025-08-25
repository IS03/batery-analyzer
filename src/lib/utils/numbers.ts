export function toNumberFlexible(x: unknown): number | undefined {
  if (x == null) return undefined;
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x !== "string") return undefined;
  let s = x.trim().toLowerCase();
  if (!s) return undefined;
  s = s
    .replace(/\s+/g, "")
    .replace(/(mah|mv|v|°c|c|%)/gi, "")
    .replace(/[^0-9,.-]/g, "");
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    const last = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
    if (s[last] === ",") { s = s.replace(/\./g, ""); s = s.replace(",", "."); }
    else { s = s.replace(/,/g, ""); }
  } else if (hasComma) s = s.replace(",", ".");
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : undefined;
}

export function toPct0_110(x: unknown): number | undefined {
  const v = toNumberFlexible(x);
  if (v == null) return undefined;
  if (v < 0 || v > 110) return undefined;
  return v;
}
