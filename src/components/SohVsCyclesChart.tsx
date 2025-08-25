"use client";

import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Scatter, ReferenceLine } from "recharts";

export type Point = { x: number; y: number };
export type Trend = { m: number; b: number; slopePer100: number; eta80?: number };

export default function SohVsCyclesChart({ data, trend }: { data: Point[]; trend?: Trend }) {
  const hasData = data && data.length > 0;
  const y80 = 80;

  // Dominio en X para trazar la recta
  const xMin = hasData ? Math.min(...data.map(d => d.x)) : 0;
  const xMax = hasData ? Math.max(...data.map(d => d.x)) : 1;

  // Si hay tendencia, generamos dos puntos extremos para Line
  const trendData = trend
    ? [
        { x: xMin, y: trend.m * xMin + trend.b },
        { x: xMax, y: trend.m * xMax + trend.b },
      ]
    : [];

  return (
    <div className="rounded-xl border p-4 bg-white/70 dark:bg-white/5">
      <div className="text-sm font-semibold mb-1">SOH vs. ciclos</div>
      {trend && (
        <div className="text-xs opacity-80 mb-2">
          Pendiente: {trend.slopePer100.toFixed(2)} p.p./100c
          {typeof trend.eta80 === "number" ? ` · ETA 80%: ${Math.round(trend.eta80)} ciclos` : ""}
        </div>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" tick={{ fontSize: 12 }} label={{ value: "Ciclos", position: "insideBottom", offset: -2 }} />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} label={{ value: "SOH (%)", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(val: any, name: any) => [val, name === "y" ? "SOH (%)" : name]} />
            {/* Puntos */}
            <Scatter dataKey="y" />
            {/* Línea suave (visual) */}
            <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
            {/* Línea 80% */}
            {hasData && <ReferenceLine y={y80} strokeDasharray="4 4" />}
            {/* Tendencia Theil–Sen */}
            {trend && <Line data={trendData} dataKey="y" dot={false} strokeWidth={2} isAnimationActive={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
