"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapView } from "./map";
import { AreaPanel, NtzPanel } from "./panels";
import { YearBars } from "./charts";
import { areaProps, LATEST_YEAR, marineAreaIds, meta, ntzProps, stats } from "@/lib/data";
import { CELL_STEPS, fmt, PROTECTION_LEVELS } from "@/lib/format";
import type { Selection } from "@/lib/types";

const DEFAULT_AREA = "AIECU192"; // Galápagos Marine Reserve

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 py-1 text-sm text-slate-800">
      <input type="checkbox" className="mt-0.5 accent-sky-800" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="flex-1">{children}</span>
    </label>
  );
}

export function Dashboard() {
  const [year, setYear] = useState(LATEST_YEAR);
  const [selection, setSelection] = useState<Selection>({ kind: "area", id: DEFAULT_AREA });
  const [showCells, setShowCells] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [showNtz, setShowNtz] = useState(true);

  const regionBars = useMemo(
    () => stats.years.map((y) => ({ year: y, hours: stats.region.fishing_hours[String(y)] ?? 0 })),
    [],
  );

  const panel = (() => {
    if (selection?.kind === "area" && marineAreaIds.includes(selection.id)) {
      const p = areaProps.find((a) => a.site_id === selection.id);
      const s = stats.areas.find((a) => a.site_id === selection.id);
      if (p && s) return <AreaPanel props={p} s={s} year={year} />;
    }
    if (selection?.kind === "ntz") {
      const p = ntzProps.find((z) => z.id === selection.id);
      if (p) return <NtzPanel props={p} year={year} />;
    }
    return <p className="p-4 text-sm text-slate-500">Click a protected area or zone on the map.</p>;
  })();

  const marine = areaProps.filter((a) => marineAreaIds.includes(a.site_id)).sort((a, b) => b.area_km2 - a.area_km2);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_55vh_auto] bg-slate-50 lg:h-dvh lg:grid-cols-[300px_1fr_380px] lg:grid-rows-1">
      {/* Sidebar */}
      <aside className="order-1 overflow-y-auto border-slate-200 bg-white lg:border-r">
        <div className="px-4 pb-3 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Marine park manager view</p>
          <h1 className="text-xl font-semibold leading-tight text-slate-900">Galápagos fishing pressure</h1>
          <p className="mt-1 text-xs leading-snug text-slate-600">
            Where is AIS-tracked fishing happening in and around protected areas, and how is it changing?
          </p>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="year" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Year
            </label>
            <span className="text-lg font-semibold tabular-nums text-slate-900">{year}</span>
          </div>
          <input
            id="year"
            type="range"
            min={stats.years[0]}
            max={LATEST_YEAR}
            step={1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 w-full accent-orange-700"
          />
          <p className="mt-2 text-[11px] text-slate-500">Apparent fishing hours, whole study area (click a bar)</p>
          <YearBars data={regionBars} year={year} onYear={setYear} />
          <p className="text-[11px] leading-snug text-slate-500">
            Early years look low partly because fewer vessels carried AIS.
          </p>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Layers</h3>
          <Toggle checked={showCells} onChange={setShowCells}>
            Apparent fishing hours ({year})
            <span className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-500">
              {CELL_STEPS.map(([t, c]) => (
                <span key={t} className="flex flex-col items-center">
                  <span className="h-2.5 w-8" style={{ background: c }} />
                  {t < 1 ? ">0" : `${t}+`}
                </span>
              ))}
              <span className="ml-1 self-start">h / cell</span>
            </span>
          </Toggle>
          <Toggle checked={showAreas} onChange={setShowAreas}>
            Current protected areas (ProtectedSeas)
            <span className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-500">
              {Object.entries(PROTECTION_LEVELS).map(([k, v]) => (
                <span key={k} className="flex flex-col items-center">
                  <span className="h-1 w-6" style={{ background: v.color }} />
                  {k}
                </span>
              ))}
              <span className="ml-1 self-start">fishing protection level</span>
            </span>
          </Toggle>
          <Toggle checked={showNtz} onChange={setShowNtz}>
            No-take zones, Zoning Plan 2000
            <span className="block text-[11px] leading-snug text-violet-800">Historical research interpretation (Moity 2018), not legal boundaries</span>
          </Toggle>
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Protected areas</h3>
          <ul className="mt-1 space-y-0.5">
            {marine.map((a) => (
              <li key={a.site_id}>
                <button
                  onClick={() => setSelection({ kind: "area", id: a.site_id })}
                  className={`w-full rounded px-2 py-1 text-left text-xs hover:bg-slate-100 ${
                    selection?.kind === "area" && selection.id === a.site_id ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700"
                  }`}
                >
                  {a.site_name}
                  <span className="block text-[11px] font-normal text-slate-500">
                    {fmt(a.area_km2)} km² · level {a.level_fishing_protection ?? "–"}/5
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-200 px-4 py-3 text-[11px] leading-snug text-slate-500">
          Data retrieved from Ocean Data Platform on {meta.retrieved_at.slice(0, 10)}.{" "}
          <Link href="/about" className="text-sky-800 hover:underline">
            Sources, licences & methods →
          </Link>
        </div>
      </aside>

      {/* Map */}
      <main className="relative order-2 overflow-hidden">
        <MapView
          year={year}
          bbox={meta.study_bbox}
          showCells={showCells}
          showAreas={showAreas}
          showNtz={showNtz}
          selection={selection}
          onSelect={setSelection}
        />
      </main>

      {/* Detail panel */}
      <aside className="order-3 overflow-y-auto border-slate-200 bg-white lg:border-l">{panel}</aside>
    </div>
  );
}
