"use client";

export type AlertItem = { level: "info"|"warn"|"error"; code: string; message: string };

function chip(level: AlertItem["level"]) {
  if (level === "error") return "border-red-500/50";
  if (level === "warn") return "border-amber-500/50";
  return "border-slate-500/40";
}

export default function AlertsList({ items }: { items: AlertItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-white/5">
      <div className="text-sm font-semibold mb-2">Alertas</div>
      <ul className="text-sm space-y-2">
        {items.map((a, i) => (
          <li key={i} className={`px-3 py-2 rounded-md border ${chip(a.level)}`}>
            <span className="opacity-70 mr-2">[{a.level}]</span>{a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
