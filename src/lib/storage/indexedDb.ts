import Dexie, { Table } from "dexie";

export interface DatasetRow { id: string; hash: string; source: string; rows: number; ingestedAt: string; }
export interface SamplesRow { datasetId: string; index: number; sample: any; }
export interface MetricsRow { datasetId: string; metrics: any; }

// NUEVO:
export interface BatteryInfoRow {
  datasetId: string; // PK
  brandRaw?: string;
  brandNormalized?: string;
  qualityClass?: "OEM_ORIGINAL" | "OEM_SERVICE_GOOD" | "AFTERMARKET_FAKE" | "UNKNOWN";
  detectionMethod?: "explicit_field" | "serial_pattern" | "heuristic" | "user_override";
  confidence?: number;
}

export class LocalDB extends Dexie {
  datasets!: Table<DatasetRow, string>;
  samples!: Table<SamplesRow, [string, number]>;
  metrics!: Table<MetricsRow, string>;
  batteryInfo!: Table<BatteryInfoRow, string>; // NUEVO

  constructor() {
    super("battery_analyzer");
    this.version(1).stores({
      datasets: "id, hash, source, ingestedAt",
      samples: "[datasetId+index], datasetId",
      metrics: "datasetId",
    });
    // v2: agregar batteryInfo
    this.version(2).stores({
      batteryInfo: "datasetId",
    });
  }
}

export const db = new LocalDB();

// Helpers CRUD
export async function putDataset(row: DatasetRow) {
  await db.datasets.put(row);
  return row;
}

export async function putSamples(datasetId: string, samples: any[]) {
  const bulk = samples.map((s, i) => ({ datasetId, index: i, sample: s })) as SamplesRow[];
  if (bulk.length) await db.samples.bulkPut(bulk);
  return bulk.length;
}

export async function putMetrics(datasetId: string, metrics: any) { await db.metrics.put({ datasetId, metrics }); }

// NUEVO:
export async function putBatteryInfo(info: BatteryInfoRow) { await db.batteryInfo.put(info); return info; }
export async function updateBatteryInfo(datasetId: string, patch: Partial<BatteryInfoRow>) {
  await db.batteryInfo.update(datasetId, patch);
  return db.batteryInfo.get(datasetId);
}

export async function listDatasets(limit = 10) { return db.datasets.orderBy("ingestedAt").reverse().limit(limit).toArray(); }
export async function loadDataset(datasetId: string) {
  const ds = await db.datasets.get(datasetId);
  const rows = await db.samples.where("datasetId").equals(datasetId).sortBy("index");
  const m = await db.metrics.get(datasetId);
  const bi = await db.batteryInfo.get(datasetId); // NUEVO
  return { dataset: ds, samples: rows.map(r => r.sample), metrics: m?.metrics, batteryInfo: bi };
}
