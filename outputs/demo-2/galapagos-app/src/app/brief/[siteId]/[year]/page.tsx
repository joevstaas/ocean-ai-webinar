import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DensityTrend, MonthBars, ShareList } from "@/components/charts";
import { ActivityGrid, ProtectionBadge } from "@/components/panels";
import { PrintButton } from "@/components/print-button";
import { SourcesList } from "@/components/sources";
import { areaProps, FISHING_CAVEAT, HISTORICAL_WARNING, LATEST_YEAR, marineAreaIds, meta, ntzProps, stats } from "@/lib/data";
import { density, fmt, fmtHours, regulationLines, trendRows } from "@/lib/format";

export function generateStaticParams() {
  return marineAreaIds.flatMap((id) => stats.years.map((y) => ({ siteId: id, year: String(y) })));
}

function lookup(siteId: string, year: string) {
  if (!marineAreaIds.includes(siteId)) return null;
  const s = stats.areas.find((a) => a.site_id === siteId);
  const p = areaProps.find((a) => a.site_id === siteId);
  const y = Number(year);
  if (!s || !p || !stats.years.includes(y)) return null;
  return { s, p, y };
}

export async function generateMetadata({ params }: PageProps<"/brief/[siteId]/[year]">): Promise<Metadata> {
  const { siteId, year } = await params;
  const found = lookup(decodeURIComponent(siteId), year);
  return { title: found ? `${found.p.site_name} — ${year} briefing` : "Briefing" };
}

function Block({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {note && <p className="text-[11px] text-slate-500">{note}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default async function Brief({ params }: PageProps<"/brief/[siteId]/[year]">) {
  const { siteId, year } = await params;
  const found = lookup(decodeURIComponent(siteId), year);
  if (!found) notFound();
  const { s, p, y } = found;
  const k = String(y);

  const inside = s.inside.fishing_hours[k] ?? 0;
  const prev = s.inside.fishing_hours[String(y - 1)];
  const dIn = density(inside, s.area_km2);
  const dRing = density(s.ring.fishing_hours[k] ?? 0, s.ring_area_km2);
  const rows = trendRows(stats.years, { inside: { s: s.inside, area: s.area_km2 }, ring: { s: s.ring, area: s.ring_area_km2 } });
  const monthly = s.inside.monthly_fishing_hours[k] ?? [];
  const peak = monthly.length ? monthly.indexOf(Math.max(...monthly)) : -1;
  const monthTotal = monthly.reduce((a, b) => a + b, 0);
  const ntzNearby = p.site_id === "AIECU192" ? ntzProps.length : 0;
  const restrictions = regulationLines(p.restrictions).slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl bg-white px-6 py-8 print:px-0 print:py-0">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href="/" className="text-xs text-sky-800 hover:underline">
          ← Back to map
        </Link>
        <PrintButton />
      </div>

      <header className="border-b border-slate-200 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Fishing pressure briefing · {y}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{p.site_name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {p.designation} · {fmt(s.area_km2)} km²{p.year_established ? ` · established ${p.year_established}` : ""}
          {p.managing_authority ? ` · ${p.managing_authority}` : ""}
        </p>
        <div className="mt-2">
          <ProtectionBadge level={p.level_fishing_protection} />
        </div>
      </header>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-slate-50 p-3">
          <div className="text-[11px] text-slate-500">Apparent fishing inside, {y}</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtHours(inside)} h</div>
          <div className="text-[11px] text-slate-500">
            {prev ? `${inside >= prev ? "+" : ""}${fmt(((inside - prev) / prev) * 100)}% vs ${y - 1}` : `${s.inside.n_cells} grid cells`}
          </div>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <div className="text-[11px] text-slate-500">Density inside vs. {stats.ring_km} km surrounding band</div>
          <div className="text-2xl font-semibold tabular-nums">
            {fmtHours(dIn)} <span className="text-base font-normal text-slate-500">vs {fmtHours(dRing)}</span>
          </div>
          <div className="text-[11px] text-slate-500">hours per 1,000 km²</div>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <div className="text-[11px] text-slate-500">Busiest month inside, {y}</div>
          <div className="text-2xl font-semibold">{peak >= 0 && monthly[peak] > 0 ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][peak] : "–"}</div>
          <div className="text-[11px] text-slate-500">{monthTotal > 0 ? `${fmt((monthly[peak] / monthTotal) * 100)}% of the year's hours inside` : ""}</div>
        </div>
      </div>

      <p className="mt-3 rounded-md bg-amber-50 p-2.5 text-xs leading-snug text-amber-900 ring-1 ring-amber-200">{FISHING_CAVEAT}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Block title="Trend, hours per 1,000 km²">
          <DensityTrend rows={rows} year={y} ringLabel={`Surrounding ${stats.ring_km} km`} height={200} />
        </Block>
        <Block title={`Seasonality inside, ${y}`}>
          <MonthBars values={monthly} height={200} />
        </Block>
        <Block title={`Gear inside, ${LATEST_YEAR}`} note="Only available for the latest year.">
          <ShareList items={s.inside.gear_2024} />
        </Block>
        <Block title={`Vessel flags inside, ${LATEST_YEAR} (approx.)`} note="From each cell's top three flags.">
          <ShareList items={s.inside.top_flags_2024_approx} labels={{}} max={5} />
        </Block>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Block title="Coded rules (ProtectedSeas)">
          <ActivityGrid props={p} />
        </Block>
        <Block title="Key restrictions (excerpt)">
          <ul className="list-disc space-y-1 pl-4 text-xs leading-snug text-slate-700">
            {restrictions.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </Block>
      </div>

      {ntzNearby > 0 && (
        <p className="mt-6 rounded-md bg-violet-50 p-2.5 text-xs leading-snug text-violet-900 ring-1 ring-violet-200">
          The map also shows {ntzNearby} no-take zones from Zoning Plan 2000. {HISTORICAL_WARNING} They are not used in
          the figures above.
        </p>
      )}

      <footer className="mt-8 border-t border-slate-200 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</h2>
        <div className="mt-2">
          <SourcesList compact />
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Area record: ProtectedSeas site_id <span className="font-mono">{p.site_id}</span>
          {p.wdpa_id ? <> (WDPA {p.wdpa_id})</> : null} in ODP dataset{" "}
          <span className="font-mono">{meta.datasets.protectedseas.id}</span>. Retrieved from Ocean Data Platform{" "}
          {meta.retrieved_at.slice(0, 10)}; full lineage at /about. A cell counts as inside when its centre
          lies within the boundary. Apparent fishing does not by itself indicate illegal activity.
        </p>
      </footer>
    </div>
  );
}
