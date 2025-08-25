"use client";

import { useState } from "react";
import { exportNodeToPdf } from "@/lib/pdf/exportToPdf";

type Props = {
  targetId: string; // nodo a exportar (id)
  fileName?: string;
  defaultAnon?: boolean;
  defaultMeta?: boolean;
};

export default function ExportPDFButton({ targetId, fileName, defaultAnon = false, defaultMeta = true }: Props) {
  const [anonymize, setAnonymize] = useState(defaultAnon);
  const [includeMetadata, setIncludeMetadata] = useState(defaultMeta);
  const [loading, setLoading] = useState(false);

  const onExport = async () => {
    try {
      setLoading(true);
      await exportNodeToPdf({
        targetId,
        fileName: fileName ?? "battery-report.pdf",
        anonymize,
        includeMetadata,
        metadata: { appName: "Battery Report", version: "MVP" },
      });
    } catch (e) {
      console.error(e);
      alert("No se pudo exportar el PDF. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)} />
        Anónimo
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={includeMetadata} onChange={(e) => setIncludeMetadata(e.target.checked)} />
        Incluir metadatos
      </label>
      <button
        onClick={onExport}
        disabled={loading}
        className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Exportando…" : "Exportar a PDF"}
      </button>
    </div>
  );
}
