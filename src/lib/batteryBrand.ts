export type Quality = "OEM_ORIGINAL" | "OEM_SERVICE_GOOD" | "AFTERMARKET_FAKE" | "UNKNOWN";

export type BatteryInfo = {
  brandRaw?: string;
  brandNormalized?: string; // Sunwoda, Desay, ATL, BYD, Samsung SDI, LG Chem, Other/Unknown
  qualityClass?: Quality;
  detectionMethod?: "explicit_field" | "serial_pattern" | "heuristic" | "user_override";
  confidence?: number; // 0–1
};

export const KNOWN_BRANDS = [
  "Sunwoda","Desay","ATL","Simplo","BYD","Samsung SDI","LG Chem"
];

const KEYWORD_MAP: Record<string, string> = {
  sunwoda: "Sunwoda",
  desay: "Desay",
  atl: "ATL",
  amperex: "ATL",
  byd: "BYD",
  "samsung sdi": "Samsung SDI",
  samsung: "Samsung SDI",
  "lg chem": "LG Chem",
  lgchem: "LG Chem",
  simplo: "Simplo",
};

const SUSPICIOUS_AFTERMARKET = [
  "kingcell","pisen","kayo","huahui","no name","noname","generic","unbranded"
];

export function normalizeBrand(raw?: string): string | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  for (const k of Object.keys(KEYWORD_MAP)) if (v.includes(k)) return KEYWORD_MAP[k];
  for (const b of KNOWN_BRANDS) if (v.includes(b.toLowerCase())) return b;
  return "Other/Unknown";
}

export function inferQuality(brandNorm?: string): Quality {
  if (!brandNorm) return "UNKNOWN";
  if (brandNorm === "Desay") return "OEM_SERVICE_GOOD"; // Ejemplo: Desay como service good
  if (KNOWN_BRANDS.includes(brandNorm)) return "OEM_ORIGINAL";
  if (brandNorm === "Other/Unknown") return "AFTERMARKET_FAKE";
  return "UNKNOWN";
}

function isSuspicious(raw?: string) {
  if (!raw) return false;
  const v = raw.toLowerCase();
  return SUSPICIOUS_AFTERMARKET.some(s => v.includes(s));
}

/** Recibe un UDB-like mínimo (meta + samples[].flags) y devuelve BatteryInfo */
export function detectBatteryInfo(udb: { meta?: Record<string, unknown>; samples?: { flags?: Record<string, unknown> }[] }, userOverride?: Partial<BatteryInfo>): BatteryInfo {
  // 1) Override del usuario (máxima prioridad)
  if (userOverride?.brandRaw || userOverride?.brandNormalized || userOverride?.qualityClass) {
    const bn = userOverride.brandNormalized ?? normalizeBrand(userOverride.brandRaw);
    const qc = userOverride.qualityClass ?? inferQuality(bn);
    return { brandRaw: userOverride.brandRaw, brandNormalized: bn, qualityClass: qc, detectionMethod: "user_override", confidence: 0.95 };
  }

  // 2) Campo explícito en meta o flags
  const meta = udb.meta || {};
  const metaCandidates = [
    meta["Battery Manufacturer"], meta["Battery Vendor"], meta["batteryManufacturer"], meta["manufacturer"], meta["vendor"], meta["brand"]
  ].filter(Boolean) as string[];

  let rowBrand: string | undefined;
  for (const s of (udb.samples || [])) {
    const f = s.flags || {};
    const maybe = f["Battery Manufacturer"] || f["Battery Vendor"] || f["manufacturer"] || f["vendor"] || f["brand"];
    if (typeof maybe === "string" && maybe.trim()) { rowBrand = maybe; break; }
  }

  const raw = metaCandidates[0] || rowBrand;
  if (raw) {
    const bn = normalizeBrand(raw);
    const suspicious = isSuspicious(raw);
    let quality = inferQuality(bn);
    let conf = KNOWN_BRANDS.includes(bn ?? "") ? 0.9 : (suspicious ? 0.7 : 0.6);
    if (bn === "Other/Unknown" && suspicious) quality = "AFTERMARKET_FAKE";
    return { brandRaw: raw, brandNormalized: bn, qualityClass: quality, detectionMethod: "explicit_field", confidence: conf };
  }

  // 3) Heurística placeholder (sin datos explícitos)
  return { detectionMethod: "heuristic", confidence: 0.3, qualityClass: "UNKNOWN" };
}
