import type { UDB } from "./schema";

/** Devuelve SOH y ciclos del último punto válido.
 * - Si no hay soh, intenta calcularlo como (FCC/Design)*100.
 * - Toma el "último" por timestamp más reciente o por orden de llegada si faltan fechas.
 */
export function computeBasicMetrics(udb: UDB): { sohCurrent?: number; cyclesCurrent?: number } {
  if (!udb?.samples?.length) return {};
  // Ordenar por timestamp si existe; si no, mantener orden de carga
  const samples = [...udb.samples].sort((a, b) => {
    const ta = a.timestamp ? Date.parse(a.timestamp) : NaN;
    const tb = b.timestamp ? Date.parse(b.timestamp) : NaN;
    if (!isNaN(ta) && !isNaN(tb)) return ta - tb;
    return 0;
  });
  const last = samples[samples.length - 1];

  let soh = typeof last.soh === "number" ? last.soh : undefined;
  if (soh == null && last.fullChargeCapacity_mAh && last.designCapacity_mAh && last.designCapacity_mAh > 0) {
    soh = (last.fullChargeCapacity_mAh / last.designCapacity_mAh) * 100;
  }

  return {
    sohCurrent: soh,
    cyclesCurrent: last.cycles
  };
}

type Pt = { x: number; y: number };

function median(arr: number[]): number | undefined {
  if (!arr.length) return undefined;
  const a = [...arr].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

export function computeTheilSen(points: Pt[]) {
  const pts = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)).sort((a,b) => a.x - b.x);
  const n = pts.length;
  if (n < 2) return { m: 0, b: pts[0]?.y ?? 0, slopePer100: 0, sohAt: (x:number)=>0, eta80: undefined };

  const slopes: number[] = [];
  for (let i=0;i<n;i++){
    for (let j=i+1;j<n;j++){
      const dx = pts[j].x - pts[i].x;
      if (dx <= 0) continue;
      const dy = pts[j].y - pts[i].y;
      slopes.push(dy/dx);
    }
  }
  const m = median(slopes) ?? 0;
  const intercepts = pts.map(p => p.y - m*p.x);
  const b = median(intercepts) ?? 0;

  const sohAt = (x:number) => m*x + b;
  const slopePer100 = m*100;

  // ETA a 80% desde el último ciclo observado (si m<0)
  let eta80: number | undefined = undefined;
  const last = pts[n-1];
  if (m < 0) {
    // x cuando soh=80: 80 = m*x + b -> x = (80 - b)/m
    const x80 = (80 - b) / m;
    if (Number.isFinite(x80)) eta80 = Math.max(x80, last.x);
  }

  return { m, b, slopePer100, sohAt, eta80 };
}
