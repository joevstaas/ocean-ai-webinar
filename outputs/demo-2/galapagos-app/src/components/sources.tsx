import { meta } from "@/lib/data";

const ROLE: Record<string, string> = {
  protectedseas: "Current protected-area boundaries and rules",
  ntz2000: "Historical no-take zones (Zoning Plan 2000)",
  gfw_yearly: "Apparent fishing hours per year, 2012–2024",
  gfw_monthly: "Apparent fishing hours per month (seasonality)",
  gfw_2024: "2024 gear and flag breakdown",
};

const GFW_CITATION =
  "Global Fishing Watch. Apparent fishing effort, v3.0 (March 2025 release), AIS-based. Derived summaries provided on Ocean Data Platform by HUB Ocean.";

export function SourcesList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-4"}>
      {Object.entries(meta.datasets).map(([key, d]) => {
        const citation = d.citations[0]?.text || (key.startsWith("gfw") ? GFW_CITATION : null);
        return (
          <li key={key} className="text-xs leading-snug text-slate-700">
            <p className="font-medium text-slate-900">
              <a href={d.url} className="hover:underline" target="_blank" rel="noreferrer">
                {d.name}
              </a>
            </p>
            <p className="text-slate-500">
              {ROLE[key]} · Provider: {d.provider ?? "–"} · Licence:{" "}
              {d.license_url ? (
                <a href={d.license_url} className="text-sky-800 hover:underline" target="_blank" rel="noreferrer">
                  {d.license}
                </a>
              ) : (
                d.license
              )}
            </p>
            {citation && <p className="mt-0.5 italic text-slate-600">{citation}</p>}
          </li>
        );
      })}
    </ul>
  );
}
