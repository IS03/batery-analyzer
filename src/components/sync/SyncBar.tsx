"use client";
import { useState } from "react";
import { syncNow } from "@/lib/sync/sync";
import { SyncStatus } from "@/lib/sync/types";

export default function SyncBar() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [msg, setMsg] = useState<string>("");

  const run = async () => {
    try {
      setStatus("syncing");
      setMsg("Sincronizando...");
      const res = await syncNow();
      setStatus("ok");
      setMsg(`OK • ${res.count} ítems`);
      setTimeout(() => {
        setStatus("idle");
        setMsg("");
      }, 3000);
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message ?? "Error");
      setTimeout(() => {
        setStatus("idle");
        setMsg("");
      }, 5000);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "idle": return "text-gray-500";
      case "syncing": return "text-blue-600 animate-pulse";
      case "ok": return "text-green-600";
      case "error": return "text-red-600";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <button 
        onClick={run} 
        disabled={status === "syncing"}
        className="px-3 py-1 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "syncing" ? "Sincronizando..." : "Forzar sincronización"}
      </button>
      <span className={getStatusColor()}>
        {status === "idle" && "Listo para sincronizar"}
        {status === "syncing" && "Sincronizando..."}
        {status === "ok" && "✓ Sincronizado"}
        {status === "error" && "✗ Error"}
        {msg && ` • ${msg}`}
      </span>
    </div>
  );
}
