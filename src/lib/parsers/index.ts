import type { UDB } from "../schema";
import { parseGenericCsv } from "./parseGenericCsv";

const PARSERS = [parseGenericCsv];

export async function autoParse(file: File): Promise<UDB> {
  const text = await file.text();
  for (const p of PARSERS) {
    const hit = p.sniff(text);
    if (hit.score > 0.8) return p.parse(text, file.name);
  }
  throw new Error("Formato no reconocido. Probá con un CSV estándar (Date/Cycle/Battery Health).");
}
