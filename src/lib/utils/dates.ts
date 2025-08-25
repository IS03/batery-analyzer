export function parseDateSmart(s: unknown): string | undefined {
  if (typeof s !== "string") return undefined;
  const raw = s.trim();
  if (!raw) return undefined;
  // ISO rápido
  const maybe = new Date(raw);
  if (!isNaN(maybe.getTime()) && /[-T]/.test(raw)) return maybe.toISOString();

  const sep = raw.includes("/") ? "/" : (raw.includes("-") ? "-" : null);
  if (!sep) return isNaN(maybe.getTime()) ? undefined : maybe.toISOString();
  const parts = raw.split(sep).map(p => p.trim());
  if (parts.length < 3) return undefined;
  let [a, b, c] = parts;
  if (c.length === 2) c = (Number(c) + 2000).toString();
  const nA = Number(a), nB = Number(b), nC = Number(c);
  if (![nA,nB,nC].every(Number.isFinite)) return undefined;
  let day:number, month:number, year:number;
  if (nA > 12) { day = nA; month = nB; year = nC; }
  else if (nB > 12) { month = nA; day = nB; year = nC; }
  else { day = nA; month = nB; year = nC; }
  const dt = new Date(Date.UTC(year, month - 1, day));
  return isNaN(dt.getTime()) ? undefined : dt.toISOString();
}
