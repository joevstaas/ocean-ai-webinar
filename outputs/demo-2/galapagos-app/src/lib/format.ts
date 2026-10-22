import type { Summary } from "./types";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ProtectedSeas activity codes (from the ODP column descriptions). */
export const ACTIVITY_CODE: Record<number, { label: string; tone: "allowed" | "prohibited" | "restricted" | "unknown" }> = {
  0: { label: "Allowed", tone: "allowed" },
  1: { label: "Prohibited", tone: "prohibited" },
  2: { label: "Restricted", tone: "restricted" },
  3: { label: "N/A or unknown", tone: "unknown" },
};

export const ACTIVITY_LABELS: Record<string, string> = {
  commercial_fishing: "Commercial / industrial fishing",
  artisanal_fishing: "Artisanal fishing",
  recreational_fishing: "Recreational fishing",
  subsistence_fishing: "Subsistence fishing",
  longlining: "Longlining",
  purse_seine_surrounding_nets: "Purse seine nets",
  bottom_trawling: "Bottom trawling",
  pelagic_trawling: "Pelagic trawling",
  gillnets_entangling_nets: "Gillnets",
  drift_nets: "Drift nets",
  hook_and_line: "Hook and line",
  trolling: "Trolling",
  spear_fishing: "Spearfishing",
  fish_aggregating_devices: "Fish aggregating devices",
  traps_pots: "Traps and pots",
  anchoring: "Anchoring",
  vessel_entry: "Vessel entry",
  diving: "Diving",
  industrial_extraction: "Industrial extraction",
  aquaculture: "Aquaculture",
};

export const GEAR_LABELS: Record<string, string> = {
  fishing: "Unclassified fishing",
  drifting_longlines: "Drifting longlines",
  set_longlines: "Set longlines",
  tuna_purse_seines: "Tuna purse seines",
  other_purse_seines: "Other purse seines",
  purse_seines: "Purse seines",
  trawlers: "Trawlers",
  squid_jigger: "Squid jiggers",
  pole_and_line: "Pole and line",
  set_gillnets: "Set gillnets",
  fixed_gear: "Fixed gear",
  pots_and_traps: "Pots and traps",
  other_seines: "Other seines",
  dredge_fishing: "Dredges",
  seiners: "Seiners",
  trollers: "Trollers",
};

export const PROTECTION_LEVELS: Record<number, { label: string; color: string }> = {
  1: { label: "Least restrictive", color: "#a5b4c7" },
  2: { label: "Low", color: "#7fb3c9" },
  3: { label: "Moderate", color: "#3e8fb0" },
  4: { label: "High", color: "#1f6f8b" },
  5: { label: "Most restrictive", color: "#0b4a63" },
};

/** Map colour ramp for apparent fishing hours per 0.1° cell (lower bound → colour). */
export const CELL_STEPS: [number, string][] = [
  [0.1, "#fde9a8"],
  [5, "#fbbf24"],
  [20, "#f97316"],
  [80, "#dc2626"],
  [300, "#7f1d1d"],
];

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString("en-GB", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const fmtHours = (n: number) => (n >= 100 ? fmt(n) : fmt(n, 1));

/** Fishing hours per 1,000 km², so areas of different size can be compared. */
export const density = (hours: number, areaKm2: number) => (areaKm2 > 0 ? (hours / areaKm2) * 1000 : 0);

export function trendRows(years: number[], series: Record<string, { s: Summary; area: number }>) {
  return years.map((y) => {
    const row: Record<string, number> = { year: y };
    for (const [key, { s, area }] of Object.entries(series)) {
      row[key] = Math.round(density(s.fishing_hours[String(y)] ?? 0, area) * 10) / 10;
    }
    return row;
  });
}

/** ProtectedSeas regulation text contains <br> tags; turn it into plain lines. */
export function regulationLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "Label|url; Label|url" → links */
export function parseLinks(urls: string | null): { label: string; href: string }[] {
  if (!urls) return [];
  return urls
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.lastIndexOf("|");
      return i > -1 ? { label: p.slice(0, i).trim(), href: p.slice(i + 1).trim() } : { label: p, href: p };
    })
    .filter((l) => /^https?:\/\//.test(l.href));
}
