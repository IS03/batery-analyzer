"use client";

import { useEffect, useState } from "react";
import FileDrop from "@/components/FileDrop";
import SyncToggle from "@/components/SyncToggle";
import MetricsCards from "@/components/MetricsCards";
import SohVsCyclesChart from "@/components/SohVsCyclesChart";
import { autoParse } from "@/lib/parsers";
import { computeBasicMetrics, computeTheilSen } from "@/lib/computeMetrics";
import { sha256Hex } from "@/lib/storage/hash";
import { putDataset, putSamples, putMetrics, listDatasets, loadDataset, putBatteryInfo, updateBatteryInfo } from "@/lib/storage/indexedDb";
import DatasetsList from "@/components/DatasetsList";
import BatteryInfoCard from "@/components/BatteryInfoCard";
import { detectBatteryInfo, type BatteryInfo } from "@/lib/batteryBrand";
import AlertsList from "@/components/AlertsList";
import { quickValidate } from "@/lib/validations";
import ExportPDFButton from "@/components/pdf/ExportPDFButton";
import AuthButtons from "@/components/auth/AuthButtons";
import SyncBar from "@/components/sync/SyncBar";
import { useAuth } from "@/lib/hooks/useAuth";
import { syncNow } from "@/lib/sync/sync";
import { addLocalReport } from "@/lib/sync/storage";

type Point = { x: number; y: number };

export default function Page() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [soh, setSoh] = useState<number | undefined>(undefined);
  const [cycles, setCycles] = useState<number | undefined>(undefined);
  const [points, setPoints] = useState<Point[]>([]);
  const [trend, setTrend] = useState<{ m: number; b: number; slopePer100: number; eta80?: number } | undefined>(undefined);
  const [datasets, setDatasets] = useState<{ id: string; source: string; rows: number; ingestedAt: string }[]>([]);
  const [datasetId, setDatasetId] = useState<string | undefined>(undefined);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [alerts, setAlerts] = useState<{ level: "info"|"warn"|"error"; code: string; message: string }[]>([]);

  async function refreshList() {
    const list = await listDatasets(10);
    setDatasets(list);
  }

  // Sincronización automática al hacer login
  useEffect(() => {
    if (isAuthenticated && user) {
      syncNow().catch(console.error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => { refreshList(); }, []);

  const rebuildFromSamples = (samples: unknown[], battery?: BatteryInfo) => {
    // Reconstruye puntos, métricas y tendencia
    const pts: Point[] = [];
    for (const s of samples) {
      const sample = s as Record<string, unknown>;
      let y = typeof sample.soh === "number" ? sample.soh : undefined;
      if (y == null && sample.fullChargeCapacity_mAh && sample.designCapacity_mAh && (sample.designCapacity_mAh as number) > 0) {
        y = ((sample.fullChargeCapacity_mAh as number) / (sample.designCapacity_mAh as number)) * 100;
      }
      const x = sample.cycles as number;
      if (x != null && y != null) pts.push({ x, y });
    }
    pts.sort((a, b) => a.x - b.x);
    setPoints(pts);

    if (pts.length >= 2) {
      const ts = computeTheilSen(pts);
      setTrend({ m: ts.m, b: ts.b, slopePer100: ts.slopePer100, eta80: ts.eta80 });
    } else {
      setTrend(undefined);
    }

    if (samples.length) {
      // métrica mínima del último
      const last = samples[samples.length - 1] as Record<string, unknown>;
      let sohCur = typeof last.soh === "number" ? last.soh : undefined;
      if (sohCur == null && last.fullChargeCapacity_mAh && last.designCapacity_mAh && (last.designCapacity_mAh as number) > 0) {
        sohCur = ((last.fullChargeCapacity_mAh as number) / (last.designCapacity_mAh as number)) * 100;
      }
      setSoh(sohCur);
      setCycles(last.cycles as number);
    } else {
      setSoh(undefined);
      setCycles(undefined);
    }

    // Recalcular alertas
    setAlerts(quickValidate(samples as Record<string, unknown>[], battery || undefined));
  };

  const handleFile = async (f: File) => {
    try {
      setStatus("Procesando…");
      const udb = await autoParse(f);

      // Persistencia: hash + ids
      const hash = await sha256Hex(JSON.stringify(udb));
      const id = crypto.randomUUID();
      const source = (udb.meta?.source as string) || "Unknown";
      const rows = udb.samples.length;

      await putDataset({ id, hash, source, rows, ingestedAt: new Date().toISOString() });
      await putSamples(id, udb.samples);

      // Métricas mínimas y Theil–Sen para guardar algo útil
      const pts: Point[] = [];
      for (const s of udb.samples) {
        let y = typeof s.soh === "number" ? s.soh : undefined;
        if (y == null && s.fullChargeCapacity_mAh && s.designCapacity_mAh && s.designCapacity_mAh > 0) {
          y = (s.fullChargeCapacity_mAh / s.designCapacity_mAh) * 100;
        }
        const x = s.cycles;
        if (x != null && y != null) pts.push({ x, y });
      }
      pts.sort((a, b) => a.x - b.x);

      const metricsToSave: Record<string, unknown> = {};
      const basic = computeBasicMetrics(udb);
      metricsToSave.basic = basic;

      if (pts.length >= 2) {
        const ts = computeTheilSen(pts);
        metricsToSave.trend = { m: ts.m, b: ts.b, slopePer100: ts.slopePer100, eta80: ts.eta80 };
      }

      await putMetrics(id, metricsToSave);

      // Marca/Calidad
      const bi = detectBatteryInfo(udb);
      await putBatteryInfo({ datasetId: id, ...bi });
      setBatteryInfo(bi);
      setDatasetId(id);

      // Guardar en localStorage para sync si está autenticado
      if (isAuthenticated) {
        addLocalReport({
          title: `Reporte ${source}`,
          payload: {
            samples: udb.samples,
            metrics: metricsToSave,
            batteryInfo: bi,
            datasetId: id,
          },
          source,
          device_model: udb.meta?.deviceModel as string || undefined,
          quality_class: bi?.qualityClass,
        });
      }

      // UI
      setStatus(`OK · filas: ${rows} · guardado`);
      rebuildFromSamples(udb.samples, bi);
      await refreshList();
    } catch (e: unknown) {
      console.error(e);
      setStatus(e instanceof Error ? e.message : "Error al procesar");
      setDatasetId(undefined);
      setBatteryInfo(null);
      setSoh(undefined);
      setCycles(undefined);
      setPoints([]);
      setTrend(undefined);
      setAlerts([]);
    }
  };

  const handleOpenDataset = async (id: string) => {
    const packed = await loadDataset(id);
    if (!packed?.samples) { setStatus("No se pudieron cargar las muestras."); return; }
    setStatus(`Abierto dataset: ${id}`);
    setDatasetId(id);
    setBatteryInfo(packed.batteryInfo || null);
    rebuildFromSamples(packed.samples, packed.batteryInfo || undefined); // <-- recalcula alertas
  };

  const handleOverrideBrand = async (raw: string) => {
    if (!datasetId) return;
    const override = detectBatteryInfo({}, { brandRaw: raw, detectionMethod: "user_override" as const });
    setBatteryInfo(override);
    await updateBatteryInfo(datasetId, { ...override, datasetId });
    // Recalcular alertas con el nuevo estado de marca:
    const packed = await loadDataset(datasetId);
    rebuildFromSamples(packed.samples || [], override);
  };

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">🔋 Battery Analyzer</div>
          <div className="flex items-center gap-4">
            {isAuthenticated && <SyncBar />}
            <SyncToggle />
            {(soh != null || cycles != null) && (
              <ExportPDFButton targetId="reportRoot" />
            )}
            <AuthButtons />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section id="upload" className="no-print">
          <FileDrop onFile={handleFile} />
          <p className="mt-3 text-sm opacity-70">
            {status || "Todos los datos se procesan en tu navegador. Nothing is uploaded."}
          </p>
        </section>

        {/* Contenido exportable */}
        <div id="reportRoot" className="space-y-8">
          {(soh != null || cycles != null) && (
            <section id="metrics" className="space-y-3">
              <MetricsCards soh={soh} cycles={cycles} />
            </section>
          )}

          {!!points.length && (
            <section id="charts" className="space-y-3">
              <SohVsCyclesChart data={points} trend={trend} />
            </section>
          )}

          {/* NUEVO: panel de alertas */}
          {!!alerts.length && (
            <section id="alerts" className="space-y-3">
              <AlertsList items={alerts} />
            </section>
          )}

          {batteryInfo && (
            <section id="battery-info" className="space-y-3">
              <BatteryInfoCard info={batteryInfo} onOverride={handleOverrideBrand} />
            </section>
          )}
        </div>

        <section id="datasets" className="no-print">
          <DatasetsList items={datasets} onOpen={handleOpenDataset} />
        </section>
      </div>
    </main>
  );
}
