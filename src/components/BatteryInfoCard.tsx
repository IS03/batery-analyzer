"use client";
import { useState } from "react";

export type BatteryInfoCardProps = {
  info: {
    brandRaw?: string;
    brandNormalized?: string;
    qualityClass?: "OEM_ORIGINAL"|"OEM_SERVICE_GOOD"|"AFTERMARKET_FAKE"|"UNKNOWN";
    detectionMethod?: "explicit_field"|"serial_pattern"|"heuristic"|"user_override";
    confidence?: number;
  };
  onOverride?: (raw: string) => void;
};

function getBadge(q?: string) {
  switch (q) {
    case "OEM_ORIGINAL": return { icon: "🟢", className: "text-green-600", label: "OEM_ORIGINAL" };
    case "OEM_SERVICE_GOOD": return { icon: "🟡", className: "text-yellow-600", label: "OEM_SERVICE_GOOD" };
    case "AFTERMARKET_FAKE": return { icon: "🔴", className: "text-red-600", label: "AFTERMARKET_FAKE" };
    default: return { icon: "⚪", className: "text-slate-500", label: "UNKNOWN" };
  }
}

export default function BatteryInfoCard({ info, onOverride }: BatteryInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(info.brandRaw || "");

  const badge = getBadge(info.qualityClass);

  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-white/5">
      <div className="text-sm font-semibold mb-2">Marca / Calidad</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="opacity-70">Crudo</div>
          <div className="font-medium break-words" data-sensitive="true">{info.brandRaw ?? "—"}</div>
        </div>
        <div>
          <div className="opacity-70">Normalizado</div>
          <div className="font-medium">{info.brandNormalized ?? "—"}</div>
        </div>
        <div>
          <div className="opacity-70">Calidad</div>
          <div className={`font-semibold flex items-center gap-1 ${badge.className}`}>
            <span>{badge.icon}</span> {badge.label}
          </div>
        </div>
        <div>
          <div className="opacity-70">Método / Conf.</div>
          <div className="font-medium">
            {info.detectionMethod ?? "—"} {info.confidence!=null ? `· ${(info.confidence*100).toFixed(0)}%` : ""}
          </div>
        </div>
      </div>

      {onOverride && (
        <div className="pt-3">
          {!editing ? (
            <button className="px-3 py-2 rounded-md border" onClick={()=>setEditing(true)}>Editar marca (override)</button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input className="border rounded-md px-3 py-2 bg-transparent" value={raw} onChange={e=>setRaw(e.target.value)} placeholder="Sunwoda / Desay / ATL / ..."/>
              <button className="px-3 py-2 rounded-md border" onClick={()=>{ setEditing(false); onOverride(raw); }}>Guardar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
