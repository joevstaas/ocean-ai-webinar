"use client";
import Link from "next/link";
import type { AreaStats, NtzProps, ProtectedAreaProps } from "@/lib/types";
import { ACTIVITY_CODE, ACTIVITY_LABELS, density, fmt, fmtHours, parseLinks, PROTECTION_LEVELS, regulationLines, trendRows } from "@/lib/format";
import { FISHING_CAVEAT, HISTORICAL_WARNING, LATEST_YEAR, stats } from "@/lib/data";
import { DensityTrend, MonthBars, ShareList, YearBars } from "./charts";

const TONE: Record<string, string> = {
  allowed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  prohibited: "bg-rose-50 text-rose-800 ring-rose-200",
  restricted: "bg-amber-50 text-amber-800 ring-amber-200",
  unknown: "bg-slate-50 text-slate-600 ring-slate-200",
};

export function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="border-t border-slate-200 px-4 py-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {note && <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{note}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function ProtectionBadge({ level }: { level: number | null }) {
  if (!level) return <span className="text-xs text-slate-500">Not scored</span>;
  const l = PROTECTION_LEVELS[level];
  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-700">
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-2.5 w-4 rounded-sm" style={{ background: i <= level ? l.color : "#e2e8f0" }} />
        ))}
      </span>
      <span>
        <b>{level}/5</b> · {l.label}
      </span>
    </span>
  );
}

export function ActivityGrid({ props }: { props: ProtectedAreaProps }) {
  const rows = Object.keys(ACTIVITY_LABELS).filter((k) => props[k] !== null && props[k] !== undefined && props[k] !== 3);
  if (!rows.length) return <p className="text-xs text-slate-500">No coded activity rules.</p>;
  return (
    <ul className="grid grid-cols-1 gap-1">
      {rows.map((k) => {
        const code = ACTIVITY_CODE[Number(props[k])];
        return (
          <li key={k} className="flex items-center justify-between text-xs">
            <span className="text-slate-700">{ACTIVITY_LABELS[k]}</span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ${TONE[code?.tone ?? "unknown"]}`}>{code?.label ?? "–"}</span>
          </li>
        );
      })}
    </ul>
  );
}

function RegulationText({ label, text }: { label: string; text: string | null }) {
  const lines = regulationLines(text);
  if (!lines.length) return null;
  return (
    <details className="group mt-2 text-xs">
      <summary className="cursor-pointer select-none font-medium text-sky-800 hover:underline">{label}</summary>
      <div className="mt-1 max-h-56 space-y-1 overflow-y-auto rounded bg-slate-50 p-2 leading-snug text-slate-700">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </details>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-slate-900">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

export function AreaPanel({ props, s, year }: { props: ProtectedAreaProps; s: AreaStats; year: number }) {
  const y = String(year);
  const prev = String(year - 1);
  const inside = s.inside.fishing_hours[y] ?? 0;
  const before = s.inside.fishing_hours[prev];
  const dIn = density(inside, s.area_km2);
  const dRing = density(s.ring.fishing_hours[y] ?? 0, s.ring_area_km2);
  const change = before ? ((inside - before) / before) * 100 : null;
  const rows = trendRows(stats.years, { inside: { s: s.inside, area: s.area_km2 }, ring: { s: s.ring, area: s.ring_area_km2 } });
  const links = parseLinks(props.urls);

  return (
    <div>
      <header className="px-4 pb-3 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-sky-800">{props.designation ?? props.category_name}</p>
        <h2 className="text-lg font-semibold leading-tight text-slate-900">{props.site_name}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {fmt(s.area_km2)} km²{props.year_established ? ` · est. ${props.year_established}` : ""}
          {props.managing_authority ? ` · ${props.managing_authority}` : ""}
        </p>
        <div className="mt-2">
          <ProtectionBadge level={props.level_fishing_protection} />
        </div>
        <Link
          href={`/brief/${encodeURIComponent(props.site_id)}/${year}`}
          className="mt-3 inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
        >
          Open {year} briefing →
        </Link>
      </header>

      <Section title={`Apparent fishing in ${year}`} note={FISHING_CAVEAT}>
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Inside area"
            value={`${fmtHours(inside)} h`}
            sub={change === null ? `${s.inside.n_cells} grid cells` : `${change >= 0 ? "+" : ""}${fmt(change)}% vs ${prev}`}
          />
          <Stat label="Density inside vs. surrounding" value={`${fmtHours(dIn)}`} sub={`vs ${fmtHours(dRing)} h per 1,000 km²`} />
        </div>
      </Section>

      <Section title="Trend, hours per 1,000 km²" note={`Surrounding = ${stats.ring_km} km band just outside the boundary.`}>
        <DensityTrend rows={rows} year={year} ringLabel={`Surrounding ${stats.ring_km} km`} />
      </Section>

      <Section title={`Seasonality inside, ${year}`}>
        <MonthBars values={s.inside.monthly_fishing_hours[y] ?? []} />
      </Section>

      <Section title={`Gear inside, ${LATEST_YEAR}`} note="Gear breakdown is only available for the latest year.">
        <ShareList items={s.inside.gear_2024} />
      </Section>

      <Section title={`Vessel flags inside, ${LATEST_YEAR} (approx.)`} note="Built from each cell's top three flags only.">
        <ShareList items={s.inside.top_flags_2024_approx} labels={{}} max={5} />
      </Section>

      <Section title="Rules (ProtectedSeas)">
        <ActivityGrid props={props} />
        <RegulationText label="What is prohibited / restricted" text={props.restrictions} />
        <RegulationText label="What is allowed" text={props.allowed} />
        {links.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-xs">
            {links.slice(0, 4).map((l) => (
              <li key={l.href}>
                <a className="text-sky-800 hover:underline" href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
        {props.last_update && <p className="mt-2 text-[11px] text-slate-500">ProtectedSeas record last updated {String(props.last_update).slice(0, 10)}.</p>}
      </Section>
    </div>
  );
}

export function NtzPanel({ props, year }: { props: NtzProps; year: number }) {
  const series = JSON.parse(props.overlap_fh_json) as Record<string, number>;
  const data = stats.years.map((y) => ({ year: y, hours: series[String(y)] ?? 0 }));
  const cellArea = props.overlap_cells * 123;
  return (
    <div>
      <header className="px-4 pb-3 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-violet-800">Zoning Plan 2000 · subzone {props.zoni_2000}</p>
        <h2 className="text-lg font-semibold leading-tight text-slate-900">{props.name}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {props.island} · {fmt(props.area_km2, 1)} km² · {props.subzone_type}
        </p>
        <div className="mt-3 rounded-md bg-violet-50 p-2.5 text-xs leading-snug text-violet-900 ring-1 ring-violet-200">
          <b>Historical layer.</b> {HISTORICAL_WARNING}
        </div>
      </header>
      <Section
        title="Apparent fishing in overlapping grid cells"
        note={`${props.overlap_cells} grid cell${props.overlap_cells === 1 ? " (~123 km²) touches" : `s (~${fmt(cellArea)} km²) touch`} this ${fmt(props.area_km2, 1)} km² zone. These hours are nearby activity, not fishing inside the zone.`}
      >
        <YearBars data={data} year={year} />
        <p className="mt-1 text-xs text-slate-600">
          {year}: <b className="tabular-nums">{fmtHours(series[String(year)] ?? 0)} h</b> in overlapping cells.
        </p>
      </Section>
    </div>
  );
}
