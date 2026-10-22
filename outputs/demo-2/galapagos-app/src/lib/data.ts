import statsJson from "../../public/data/stats.json";
import metaJson from "../../public/data/meta.json";
import featuresJson from "../../public/data/features.json";
import type { Meta, NtzProps, ProtectedAreaProps, Stats } from "./types";

export const stats = statsJson as unknown as Stats;
export const meta = metaJson as unknown as Meta;
export const areaProps = (featuresJson as unknown as { areas: ProtectedAreaProps[] }).areas;
export const ntzProps = (featuresJson as unknown as { ntz: NtzProps[] }).ntz;

/** Galápagos National Park is the terrestrial park (the islands): shown as land, never as a fishing area. */
export const LAND_PARK_ID = "AIECU193";
export const marineAreaIds = stats.areas.map((a) => a.site_id).filter((id) => id !== LAND_PARK_ID);

export const LATEST_YEAR = stats.years[stats.years.length - 1];

export const HISTORICAL_WARNING =
  "Research interpretation (Moity, 2018) of the Galápagos Marine Reserve Zoning Plan 2000. Historical — not the current, legally authoritative protection boundaries.";

export const FISHING_CAVEAT =
  "Apparent fishing from AIS tracking (Global Fishing Watch). Vessels without AIS — including most small artisanal boats — are missing, and 0.1° grid cells (~123 km²) are much coarser than many zones.";
