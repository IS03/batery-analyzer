export const LIMITS = {
  soh: { min: 0, max: 110 },
  deltaSOH_AnomalyPP: 5,
  minPointsForForecast: 8
};

export type AlertLevel = "info" | "warn" | "error";
export type SimpleAlert = { level: AlertLevel; code: string; message: string };

type SampleLike = {
  timestamp?: string;
  cycles?: number;
  soh?: number;
  fullChargeCapacity_mAh?: number;
  designCapacity_mAh?: number;
  flags?: Record<string, unknown>;
};

type BatteryInfoLike = {
  brandNormalized?: string;
  qualityClass?: "OEM_ORIGINAL" | "OEM_SERVICE_GOOD" | "AFTERMARKET_FAKE" | "UNKNOWN";
  detectionMethod?: "explicit_field" | "serial_pattern" | "heuristic" | "user_override";
  confidence?: number;
};

function computeSOH(s: SampleLike): number | undefined {
  if (typeof s.soh === "number") return s.soh;
  if (s.fullChargeCapacity_mAh && s.designCapacity_mAh && s.designCapacity_mAh > 0) {
    return (s.fullChargeCapacity_mAh / s.designCapacity_mAh) * 100;
  }
  return undefined;
}

export function quickValidate(samples: SampleLike[], battery?: BatteryInfoLike): SimpleAlert[] {
  const out: SimpleAlert[] = [];
  const n = samples.length;

  // 1) Pocos puntos
  if (n < 3) out.push({ level: "warn", code: "few_points", message: `Muy pocos puntos (${n}).` });

  // 2) SOH fuera de rango razonable
  const sohs = samples.map(computeSOH).filter((v): v is number => v!=null);
  if (sohs.some(v => v > LIMITS.soh.max)) {
    out.push({ level: "warn", code: "soh_gt_110", message: "SOH > 110% detectado (posible calibración optimista o error de medición)." });
  }
  if (sohs.some(v => v < LIMITS.soh.min)) {
    out.push({ level: "warn", code: "soh_lt_0", message: "SOH < 0% detectado (valores inválidos)." });
  }

  // 3) Ciclos no monótonos
  const cycles = samples.map(s => s.cycles).filter((v): v is number => v!=null);
  for (let i=1;i<cycles.length;i++){
    if (cycles[i] < cycles[i-1]) { out.push({ level: "info", code: "cycles_non_monotonic", message: "Los ciclos no son estrictamente crecientes (posible reset o lectura parcial)." }); break; }
  }

  // 4) Saltos bruscos de SOH entre filas consecutivas (> deltaSOH_AnomalyPP)
  for (let i=1;i<sohs.length;i++){
    const d = Math.abs(sohs[i] - sohs[i-1]);
    if (d > LIMITS.deltaSOH_AnomalyPP) {
      out.push({ level: "info", code: "soh_jump", message: `Cambio brusco de SOH (${d.toFixed(1)} p.p.).` });
      break;
    }
  }

  // 5) Marca sospechosa
  if (battery?.qualityClass === "AFTERMARKET_FAKE") {
    out.push({ level: "warn", code: "aftermarket", message: "Proveedor aftermarket/sospechoso detectado." });
  }

  return out;
}
