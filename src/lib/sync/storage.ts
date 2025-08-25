import { LocalReport } from './types';

const KEY = "battery_reports";

export function readLocal(): LocalReport[] {
  try { 
    return JSON.parse(localStorage.getItem(KEY) || "[]"); 
  } catch { 
    return []; 
  }
}

export function writeLocal(data: LocalReport[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function addLocalReport(report: Omit<LocalReport, 'local_rev'>): LocalReport {
  const local = readLocal();
  const newReport: LocalReport = {
    ...report,
    local_rev: Date.now().toString(),
  };
  local.push(newReport);
  writeLocal(local);
  return newReport;
}

export function updateLocalReport(id: string, updates: Partial<LocalReport>): LocalReport | null {
  const local = readLocal();
  const index = local.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  local[index] = {
    ...local[index],
    ...updates,
    local_rev: Date.now().toString(),
  };
  writeLocal(local);
  return local[index];
}

export function deleteLocalReport(id: string): boolean {
  const local = readLocal();
  const filtered = local.filter(r => r.id !== id);
  if (filtered.length === local.length) return false;
  writeLocal(filtered);
  return true;
}
