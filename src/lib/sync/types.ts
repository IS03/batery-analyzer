export type LocalReport = {
  id?: string;
  title?: string;
  payload: Record<string, unknown>;
  source?: string;
  device_model?: string;
  quality_class?: string;
  local_rev: string; // p.ej. Date.now().toString()
  updated_at?: string; // opcional; sincronizado desde server
};

export type SyncStatus = "idle" | "syncing" | "ok" | "error";

export type SyncResult = {
  count: number;
};
