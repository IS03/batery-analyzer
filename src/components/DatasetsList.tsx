"use client";

export type DatasetListItem = {
  id: string;
  source: string;
  rows: number;
  ingestedAt: string; // ISO
};

export default function DatasetsList({ items, onOpen }: { items: DatasetListItem[]; onOpen: (id: string)=>void }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-white/5">
      <div className="text-sm font-semibold mb-2">Datasets guardados</div>
      <ul className="space-y-2 text-sm">
        {items.map(it => (
          <li key={it.id} className="flex items-center justify-between gap-2">
            <div className="flex-1 truncate">
              <span className="font-medium">{it.source}</span>
              <span className="opacity-70"> · filas: {it.rows} · {new Date(it.ingestedAt).toLocaleString()}</span>
            </div>
            <button className="px-3 py-1 rounded-md border" onClick={()=>onOpen(it.id)}>Abrir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
