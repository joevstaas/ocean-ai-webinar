"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt, fmtHours, GEAR_LABELS, MONTHS } from "@/lib/format";

const AXIS = { fontSize: 11, fill: "#64748b" };
const GRID = "#e2e8f0";
const INSIDE = "#c2410c";
const RING = "#64748b";

/** Fishing density inside an area vs. its surrounding ring, per year. */
export function DensityTrend({
  rows,
  year,
  ringLabel,
  height = 190,
}: {
  rows: Record<string, number>[];
  year: number;
  ringLabel: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 8, right: 18, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={2} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => fmt(Number(v))} />
        <Tooltip formatter={(v) => `${fmtHours(Number(v))} h / 1,000 km²`} labelStyle={{ color: "#0f172a" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
        <ReferenceLine x={year} stroke="#0f172a" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="inside" name="Inside area" stroke={INSIDE} strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="ring" name={ringLabel} stroke={RING} strokeWidth={1.6} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Total apparent fishing hours per year. */
export function YearBars({
  data,
  year,
  onYear,
  height = 130,
}: {
  data: { year: number; hours: number }[];
  year: number;
  onYear?: (y: number) => void;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={3} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => (v >= 1000 ? `${fmt(v / 1000)}k` : fmt(v))} />
        <Tooltip formatter={(v) => [`${fmt(Number(v))} h`, "Apparent fishing"]} labelStyle={{ color: "#0f172a" }} cursor={{ fill: "rgba(15,23,42,0.05)" }} />
        <Bar
          dataKey="hours"
          isAnimationActive={false}
          radius={[2, 2, 0, 0]}
          onClick={(d) => onYear?.(Number((d as { payload?: { year: number } }).payload?.year))}
          shape={(props: unknown) => {
            const p = props as { x: number; y: number; width: number; height: number; payload: { year: number } };
            return <rect x={p.x} y={p.y} width={p.width} height={p.height} rx={2} fill={p.payload.year === year ? INSIDE : "#fdba74"} style={{ cursor: onYear ? "pointer" : undefined }} />;
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthBars({ values, height = 130 }: { values: number[]; height?: number }) {
  const data = values.map((v, i) => ({ month: MONTHS[i], hours: v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval={1} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => fmt(Number(v))} />
        <Tooltip formatter={(v) => [`${fmtHours(Number(v))} h`, "Apparent fishing"]} labelStyle={{ color: "#0f172a" }} cursor={{ fill: "rgba(15,23,42,0.05)" }} />
        <Bar dataKey="hours" fill={INSIDE} radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal share bars, no chart library needed. */
export function ShareList({ items, labels, max = 6 }: { items: Record<string, number>; labels?: Record<string, string>; max?: number }) {
  const entries = Object.entries(items).filter(([, v]) => v > 0).slice(0, max);
  const total = Object.values(items).reduce((a, b) => a + b, 0);
  if (!entries.length) return <p className="text-xs text-slate-500">No apparent fishing recorded.</p>;
  return (
    <ul className="space-y-1.5">
      {entries.map(([k, v]) => (
        <li key={k} className="text-xs">
          <div className="flex justify-between text-slate-700">
            <span>{labels?.[k] ?? GEAR_LABELS[k] ?? k}</span>
            <span className="tabular-nums text-slate-500">
              {fmtHours(v)} h · {fmt((v / total) * 100)}%
            </span>
          </div>
          <div className="mt-0.5 h-1.5 rounded bg-slate-100">
            <div className="h-1.5 rounded bg-orange-600" style={{ width: `${(v / entries[0][1]) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
