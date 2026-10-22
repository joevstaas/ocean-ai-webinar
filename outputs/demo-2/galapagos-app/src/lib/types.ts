export type YearMap = Record<string, number>;

export interface Summary {
  n_cells: number;
  fishing_hours: YearMap;
  vessel_presence_hours: YearMap;
  gear_2024: Record<string, number>;
  monthly_fishing_hours: Record<string, number[]>;
  top_flags_2024_approx: Record<string, number>;
}

export interface AreaStats {
  site_id: string;
  site_name: string;
  area_km2: number;
  ring_area_km2: number;
  inside: Summary;
  ring: Summary;
}

export interface Stats {
  years: number[];
  ring_km: number;
  region: Summary;
  areas: AreaStats[];
}

export interface DatasetMeta {
  id: string;
  name: string;
  description: string;
  provider: string | null;
  license: string | null;
  license_url: string | null;
  citations: { text: string; link: string }[];
  url: string;
}

export interface Meta {
  retrieved_at: string;
  collection_id: string;
  collection_url: string;
  study_bbox: number[];
  datasets: Record<"ntz2000" | "protectedseas" | "gfw_yearly" | "gfw_2024" | "gfw_monthly", DatasetMeta>;
  counts: Record<string, number>;
  methods: string[];
}

/** Properties of a ProtectedSeas feature as written by scripts/prepare_data.py */
export interface ProtectedAreaProps {
  site_id: string;
  site_name: string;
  designation: string | null;
  category_name: string | null;
  managing_authority: string | null;
  iucn_category: string | null;
  wdpa_id: string | null;
  level_fishing_protection: number | null;
  year_established: number | null;
  protection_focus: string | null;
  restrictions: string | null;
  allowed: string | null;
  urls: string | null;
  last_update: string | null;
  last_reviewed: string | null;
  area_km2: number;
  [activity: string]: string | number | null;
}

export interface NtzProps {
  id: string;
  source_id: number;
  zoni_2000: string;
  subzone_type: string;
  name: string;
  island: string;
  area_km2: number;
  overlap_cells: number;
  overlap_fh_2024: number;
  overlap_fh_json: string;
}

export type Selection =
  | { kind: "area"; id: string }
  | { kind: "ntz"; id: string }
  | null;
