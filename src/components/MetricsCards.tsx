"use client";

export default function MetricsCards({ soh, cycles }: { soh?: number; cycles?: number }) {
  const fmt = (v?: number, suf = "") => (v == null ? "—" : `${Number.isFinite(v) ? (Math.round(v * 10) / 10) : v}${suf}`);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border p-4 bg-white/70 dark:bg-white/5">
        <div className="text-xs opacity-70">SOH actual</div>
        <div className="text-xl font-semibold">{fmt(soh, "%")}</div>
      </div>
      <div className="rounded-xl border p-4 bg-white/70 dark:bg-white/5">
        <div className="text-xs opacity-70">Ciclos actuales</div>
        <div className="text-xl font-semibold">{fmt(cycles)}</div>
      </div>
    </div>
  );
}
