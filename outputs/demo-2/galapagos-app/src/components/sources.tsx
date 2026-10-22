import { meta } from "@/lib/data";
import type { DatasetKey, DatasetMeta, OdpRecord } from "@/lib/types";

const ROLE: Record<DatasetKey, string> = {
  protectedseas: "Current protected-area boundaries and rules",
  ntz2000: "Historical no-take zones (Zoning Plan 2000)",
  gfw_yearly: "Apparent fishing hours per year, 2012–2024",
  gfw_monthly: "Apparent fishing hours per month (seasonality)",
  gfw_2024: "2024 gear and flag breakdown",
};

const A = "text-sky-800 hover:underline";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={A} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : null);

function doiUrl(d: DatasetMeta) {
  return d.origin.doi ? `https://doi.org/${d.origin.doi}` : null;
}

/** Datasets with ODP link, original source and licence — used in the briefing and on /about. */
export function SourcesList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-4"}>
      {(Object.entries(meta.datasets) as [DatasetKey, DatasetMeta][]).map(([key, d]) => {
        const doi = doiUrl(d);
        return (
          <li key={key} className="text-xs leading-snug text-slate-700">
            <p className="font-medium text-slate-900">
              <a href={d.url} className="hover:underline" target="_blank" rel="noreferrer">
                {d.name}
              </a>
            </p>
            <p className="text-slate-500">
              {ROLE[key]} · ODP dataset <span className="font-mono">{d.id}</span> · Licence:{" "}
              {d.license_url ? <Ext href={d.license_url}>{d.license}</Ext> : d.license}
            </p>
            <p className="text-slate-500">
              Original source: {d.origin.publisher}
              {doi ? (
                <>
                  {" "}
                  · <Ext href={doi}>doi:{d.origin.doi}</Ext>
                </>
              ) : d.origin.url ? (
                <>
                  {" "}
                  · <Ext href={d.origin.url}>{d.origin.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Ext>
                </>
              ) : null}
              {d.parent && (
                <>
                  {" "}
                  · via ODP <Ext href={d.parent.url}>{d.parent.name}</Ext>
                </>
              )}
            </p>
            {d.origin.citation && <p className="mt-0.5 italic text-slate-600">{d.origin.citation}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="group relative pb-3 pl-7 last:pb-0">
      <span className="absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
        {n}
      </span>
      <span className="absolute bottom-0 left-[9px] top-5 w-px bg-slate-200 group-last:hidden" aria-hidden />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-0.5 text-xs leading-snug text-slate-700">{children}</div>
    </li>
  );
}

function OdpLine({ r, note }: { r: OdpRecord; note?: string }) {
  return (
    <>
      <p>
        <Ext href={r.url}>{r.name}</Ext>
        {r.visibility === "private" && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-900">private</span>}
      </p>
      <p className="text-slate-500">
        <span className="font-mono">{r.id}</span>
        {r.collection && (
          <>
            {" "}
            · collection <Ext href={r.collection.url}>{r.collection.name}</Ext>
          </>
        )}
        {r.updated_at && <> · catalogue updated {day(r.updated_at)}</>}
      </p>
      {note && <p className="text-slate-500">{note}</p>}
    </>
  );
}

/** Original source → (parent ODP dataset) → ODP dataset used → app files, for one dataset. */
export function LineageCard({ k }: { k: DatasetKey }) {
  const d = meta.datasets[k];
  const o = d.origin;
  const doi = doiUrl(d);
  const outputs = meta.outputs.filter((f) => f.from.includes(k));
  let n = 0;
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{ROLE[k]}</h3>
      <ol className="mt-3">
        <Step n={++n} title="Original source">
          <p>
            {o.url ? <Ext href={o.url}>{o.title ?? o.publisher}</Ext> : (o.title ?? o.publisher)}
            {o.creator && <> · {o.creator}</>}
            {o.published && <> · published {o.published}</>}
          </p>
          <p className="text-slate-500">
            {o.publisher}
            {doi && (
              <>
                {" "}
                · <Ext href={doi}>doi:{o.doi}</Ext>
              </>
            )}
            {o.download_url && (
              <>
                {" "}
                · <Ext href={o.download_url}>original file</Ext>
              </>
            )}
            {o.source_updated && <> · source updated {day(o.source_updated)}</>}
          </p>
          {o.license && <p className="text-slate-500">Original licence: {o.license}</p>}
          {o.related_publication && <p className="text-slate-500">Related publication: {o.related_publication}</p>}
          {o.methodology?.length ? (
            <p className="text-slate-500">
              Methodology:{" "}
              {o.methodology.map((u, i) => (
                <span key={u}>
                  {i > 0 && " · "}
                  <Ext href={u}>{u.replace(/^https?:\/\/[^/]+\//, "").replace(/\/$/, "")}</Ext>
                </span>
              ))}
            </p>
          ) : null}
          {o.checksum_sha256 && (
            <p className="break-all text-slate-500">
              SHA-256 of original archive: <span className="font-mono">{o.checksum_sha256}</span>
            </p>
          )}
        </Step>
        {d.parent && (
          <Step n={++n} title="Full dataset on Ocean Data Platform">
            <OdpLine r={d.parent} note="The dataset below is derived from this one." />
          </Step>
        )}
        <Step n={++n} title="Dataset used by this app">
          <OdpLine r={d} />
          <p className="text-slate-500">
            Licence: {d.license_url ? <Ext href={d.license_url}>{d.license}</Ext> : d.license}
            {d.provider && <> · provider {d.provider}</>}
          </p>
        </Step>
        <Step n={++n} title={`Query, ${day(meta.retrieved_at)}`}>
          <p>
            {d.query.rows.toLocaleString("en")} rows {d.query.filter ? "matching a spatial filter" : "(the whole table)"}
          </p>
          {d.query.filter && (
            <p className="break-all font-mono text-[10px] text-slate-500">
              {d.query.filter.length > 140 ? `${d.query.filter.slice(0, 140)}…` : d.query.filter}
            </p>
          )}
        </Step>
        <Step n={++n} title="App files">
          <ul className="space-y-0.5">
            {outputs.map((f) => (
              <li key={f.file}>
                <a className={`${A} font-mono`} href={`/data/${f.file}`}>
                  {f.file}
                </a>{" "}
                <span className="text-slate-500">— {f.description}</span>
              </li>
            ))}
          </ul>
        </Step>
      </ol>
      {d.constraints.length > 0 && (
        <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-500">
          <b>Use constraints (from ODP):</b> {d.constraints.join(" ")}
        </p>
      )}
    </article>
  );
}

export function OutputsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-1 pr-3 font-semibold">File</th>
            <th className="py-1 pr-3 font-semibold">Built from</th>
            <th className="py-1 pr-3 font-semibold">Size</th>
            <th className="py-1 font-semibold">SHA-256</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {meta.outputs.map((f) => (
            <tr key={f.file} className="border-t border-slate-100 align-top">
              <td className="py-1.5 pr-3">
                <a className={`${A} font-mono`} href={`/data/${f.file}`}>
                  {f.file}
                </a>
              </td>
              <td className="py-1.5 pr-3">
                {f.from.map((k, i) => (
                  <span key={k}>
                    {i > 0 && ", "}
                    <Ext href={meta.datasets[k].url}>{k}</Ext>
                  </span>
                ))}
              </td>
              <td className="py-1.5 pr-3 tabular-nums">{(f.bytes / 1000).toLocaleString("en", { maximumFractionDigits: 0 })} kB</td>
              <td className="py-1.5 font-mono text-[10px] text-slate-500" title={f.sha256}>
                {f.sha256.slice(0, 16)}…
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
