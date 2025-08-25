import Papa from "papaparse";
import type { UDB, Sample } from "../schema";
import { toNumberFlexible, toPct0_110 } from "../utils/numbers";
import { parseDateSmart } from "../utils/dates";

export const parseGenericCsv = {
  sniff: (text: string) => {
    const first = text.split("\n", 1)[0] || "";
    const score = /(date|fecha|cycle|ciclos|battery|salud)/i.test(first) ? 0.85 : 0.4;
    return { score };
  },

  parse: (text: string, name?: string): UDB => {
    const first = text.split("\n", 1)[0] || "";
    const delimiter = first.includes(";") ? ";" : ",";
    const p = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true, delimiter });
    const samples: Sample[] = [];

    let brandRaw: string | undefined;
    for (const row of p.data) {
      const ts =
        parseDateSmart(row["Date"] || row["Fecha"] || row["Time"] || row["timestamp"]);
      if (!ts) continue;

      const cycles =
        toNumberFlexible(row["Cycle Count"] || row["Cycles"] || row["Ciclos"]);
      const design =
        toNumberFlexible(row["Design Capacity (mAh)"] || row["Design Capacity"] || row["Capacidad de diseño (mAh)"]);
      const fcc =
        toNumberFlexible(row["Full Charge Capacity (mAh)"] || row["Full Charge Capacity"] || row["Capacidad completa (mAh)"]);
      const soh =
        toPct0_110(row["Battery Health (%)"] || row["Battery Health"] || row["Salud (%)"] || row["Salud"]);

      // Detectar columnas de fabricante/vendor/brand
      const vendorCol = Object.keys(row).find(k => /manufacturer|vendor|brand/i.test(k));
      const vendor = vendorCol ? row[vendorCol] : undefined;
      
      // Guardar brandRaw para meta si no se ha encontrado aún
      if (!brandRaw && vendor) {
        brandRaw = vendor;
      }

      samples.push({
        source: "Generic",
        timestamp: ts,
        cycles: cycles ?? undefined,
        designCapacity_mAh: design ?? undefined,
        fullChargeCapacity_mAh: fcc ?? undefined,
        soh: soh ?? undefined,
        flags: vendor ? { brand: vendor } : undefined,
      });
    }

    return { samples, meta: { source: "Generic", name, ...(brandRaw ? { brand: brandRaw } : {}) } };
  }
};
