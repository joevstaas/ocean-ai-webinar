"""Pull Galápagos layers from Ocean Data Platform and precompute static app data.

Usage:  python3 -I scripts/prepare_data.py [path-to-.env] [output-dir]

Reads ODP_API_KEY from the given .env, or the nearest .env above this app (never printed). Writes small GeoJSON/JSON
files that the Next.js app serves statically, so no key ever reaches the browser.
"""
import json
import os
import sys
from datetime import datetime, timezone

import geopandas as gpd
import pandas as pd
import requests
import shapely
from dotenv import load_dotenv
from shapely import wkb, wkt
from shapely.geometry import box, mapping
from shapely.geometry.base import BaseGeometry

from odp.client import Client

YEARS = list(range(2012, 2025))
METRIC_CRS = "EPSG:6933"  # equal-area, metres; accurate near the equator
RING_KM = 25  # width of the "surrounding waters" comparison ring
GEAR_COLS = [
    "fh_drifting_longlines", "fh_tuna_purse_seines", "fh_set_longlines", "fh_trawlers",
    "fh_squid_jigger", "fh_fishing", "fh_pole_and_line", "fh_set_gillnets", "fh_fixed_gear",
    "fh_other_purse_seines", "fh_pots_and_traps", "fh_purse_seines", "fh_other_seines",
    "fh_dredge_fishing", "fh_seiners", "fh_trollers",
]
ACTIVITY_COLS = [
    "commercial_fishing", "artisanal_fishing", "recreational_fishing", "subsistence_fishing",
    "longlining", "purse_seine_surrounding_nets", "bottom_trawling", "pelagic_trawling",
    "gillnets_entangling_nets", "drift_nets", "hook_and_line", "trolling", "spear_fishing",
    "fish_aggregating_devices", "traps_pots", "anchoring", "vessel_entry", "diving",
    "industrial_extraction", "aquaculture",
]
PS_KEEP = [
    "site_id", "site_name", "designation", "category_name", "managing_authority", "iucn_category",
    "wdpa_id", "level_fishing_protection", "year_established", "protection_focus", "restrictions",
    "allowed", "urls", "last_update", "last_reviewed",
] + ACTIVITY_COLS

DATASETS = {
    "ntz2000": "c3bb5ad5-eb6e-4306-ae1f-85ac3dadfd8b",
    "protectedseas": "a608f54b-75c7-4df9-a3a8-cedbfa391873",
    "gfw_yearly": "5a873571-1f58-4257-b636-4571b669faf8",
    "gfw_2024": "6b84a740-926a-46e6-bc5e-01c5eac3c9b8",
    "gfw_monthly": "48a20311-3564-4045-b472-de775ecee31c",
}
COLLECTION_ID = "0d46fc5f-8a50-49bf-ab2a-73ac2c8da690"
SEARCH_BOX = box(-95, -4, -86, 4)


def select(client, dataset_id, filt=None, cols=None):
    ds = client.dataset(dataset_id)
    kwargs = {}
    if filt:
        kwargs["filter"] = filt
    if cols:
        kwargs["cols"] = cols
    dfs = list(ds.table.select(**kwargs).dataframes())
    return pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()


def to_geom(v):
    if v is None:
        return None
    if isinstance(v, BaseGeometry):  # SDK may already decode geometry columns
        return v
    if isinstance(v, (bytes, bytearray, memoryview)):
        return wkb.loads(bytes(v))
    return wkt.loads(v)


def clean(v):
    """Make a value JSON-safe (NaN -> None, numpy -> python)."""
    if v is None:
        return None
    if hasattr(v, "item"):
        v = v.item()
    if isinstance(v, float) and v != v:
        return None
    if hasattr(v, "isoformat"):
        return v.isoformat()
    return v


def write_geojson(path, gdf, props, simplify=None):
    """Write GeoJSON; `simplify` (degrees) only thins display geometry — stats use full resolution."""
    feats = []
    for _, r in gdf.iterrows():
        g = r.geometry.simplify(simplify, preserve_topology=True) if simplify else r.geometry
        feats.append({
            "type": "Feature",
            "geometry": mapping(shapely.set_precision(g, 1e-5)),
            "properties": {k: clean(r[k]) for k in props},
        })
    with open(path, "w") as f:
        json.dump({"type": "FeatureCollection", "features": feats}, f, separators=(",", ":"))
    print(f"wrote {path}  ({len(feats)} features, {os.path.getsize(path)/1e6:.2f} MB)")


def main(env_path, out_dir):
    load_dotenv(env_path)
    client = Client(api_key=os.environ["ODP_API_KEY"])
    os.makedirs(out_dir, exist_ok=True)
    retrieved_at = datetime.now(timezone.utc).isoformat(timespec="seconds")

    # --- Catalogue metadata for attribution -----------------------------------
    meta_ds = {}
    for key, i in DATASETS.items():
        r = client._request(requests.Request("GET", f"{client.base_url}/api/catalog/v2/datasets/{i}"), retry=False)
        r.raise_for_status()
        d = r.json()
        lic = d.get("license") or {}
        meta_ds[key] = {
            "id": i,
            "name": d.get("name"),
            "description": d.get("description"),
            "provider": (d.get("provider") or {}).get("name"),
            "license": lic.get("enum_val") or lic.get("name"),
            "license_url": lic.get("url"),
            "citations": d.get("citations") or [],
            "url": f"https://app.hubocean.earth/catalog/dataset/{i}",
        }

    # --- Protected areas (ProtectedSeas, current) -----------------------------
    ps = select(client, DATASETS["protectedseas"], f'geometry within "{SEARCH_BOX.wkt}"')
    ps = gpd.GeoDataFrame(ps, geometry=ps["geometry"].map(to_geom), crs="EPSG:4326")
    ps["geometry"] = ps.geometry.make_valid()
    ps_m = ps.to_crs(METRIC_CRS)
    ps["area_km2"] = (ps_m.area / 1e6).round(1)

    # Fishing extent: marine areas plus margin (the National Park is mostly land)
    study = ps.geometry.union_all().envelope.buffer(0.6)
    minx, miny, maxx, maxy = study.bounds
    bbox = box(minx, miny, maxx, maxy)

    # --- Historical no-take zones (your collection) ----------------------------
    ntz = select(client, DATASETS["ntz2000"])
    ntz = gpd.GeoDataFrame(ntz, geometry=ntz["geometry"].map(to_geom), crs="EPSG:4326")

    # --- GFW fishing effort -----------------------------------------------------
    gf = f'geometry within "{bbox.wkt}"'
    yearly = select(client, DATASETS["gfw_yearly"], gf)
    s24 = select(client, DATASETS["gfw_2024"], gf)
    monthly = select(client, DATASETS["gfw_monthly"], gf)

    cells = gpd.GeoDataFrame(yearly, geometry=yearly["geometry"].map(to_geom), crs="EPSG:4326")
    keep24 = ["cell_id", "mmsi_present_2024", "top_gear_1", "top_flag_1", "peak_month", "months_active"] + GEAR_COLS + [
        "top_flag_1_fishing_hours", "top_flag_2", "top_flag_2_fishing_hours", "top_flag_3", "top_flag_3_fishing_hours"]
    cells = cells.merge(s24[keep24], on="cell_id", how="left")
    mcols = [c for c in monthly.columns if c.startswith("fishing_hours_")]
    cells = cells.merge(monthly[["cell_id"] + mcols].rename(columns=lambda c: c.replace("fishing_hours_", "m_") if c != "cell_id" else c),
                        on="cell_id", how="left")
    for y in YEARS:
        cells[f"fh_{y}"] = cells[f"fishing_hours_{y}"].fillna(0).round(2)
    cells_m = cells.to_crs(METRIC_CRS)
    centroids = cells_m.geometry.centroid

    # --- Per-area statistics ----------------------------------------------------
    def summarise(mask):
        sub = cells[mask]
        out = {
            "n_cells": int(mask.sum()),
            "fishing_hours": {str(y): round(float(sub[f"fh_{y}"].sum()), 1) for y in YEARS},
            "vessel_presence_hours": {str(y): round(float(sub[f"hours_{y}"].fillna(0).sum()), 1) for y in YEARS},
            "gear_2024": {g.removeprefix("fh_"): round(float(sub[g].fillna(0).sum()), 1) for g in GEAR_COLS},
            "monthly_fishing_hours": {
                str(y): [round(float(sub.get(f"m_{y}_{m:02d}", pd.Series(dtype=float)).fillna(0).sum()), 1) for m in range(1, 13)]
                for y in YEARS
            },
        }
        out["gear_2024"] = {k: v for k, v in sorted(out["gear_2024"].items(), key=lambda kv: -kv[1]) if v > 0}
        flags = {}
        for n in (1, 2, 3):
            for fl, h in zip(sub[f"top_flag_{n}"], sub[f"top_flag_{n}_fishing_hours"]):
                if isinstance(fl, str) and fl and h == h and h > 0:
                    flags[fl] = flags.get(fl, 0) + float(h)
        out["top_flags_2024_approx"] = {k: round(v, 1) for k, v in sorted(flags.items(), key=lambda kv: -kv[1])[:8]}
        return out

    areas = []
    for i, r in ps.iterrows():
        poly_m = ps_m.geometry.iloc[i]
        ring_m = poly_m.buffer(RING_KM * 1000).difference(poly_m)
        inside = centroids.within(poly_m)
        ring = centroids.within(ring_m)
        a = {
            "site_id": r.site_id,
            "site_name": r.site_name,
            "area_km2": float(r.area_km2),
            "ring_area_km2": round(ring_m.area / 1e6, 1),
            "inside": summarise(inside),
            "ring": summarise(ring),
        }
        areas.append(a)

    region_mask = pd.Series(True, index=cells.index)
    region = summarise(region_mask)

    # --- Historical NTZ: fishing in overlapping grid cells (coarse!) -----------
    sidx = cells.sindex
    ntz_overlap = []
    for g in ntz.geometry:
        hits = list(sidx.query(g, predicate="intersects"))
        sub = cells.iloc[hits]
        ntz_overlap.append((len(hits), {str(y): round(float(sub[f"fh_{y}"].sum()), 1) for y in YEARS}))
    ntz["overlap_cells"] = [n for n, _ in ntz_overlap]
    ntz["overlap_fh_json"] = [json.dumps(d) for _, d in ntz_overlap]
    ntz["overlap_fh_2024"] = [d["2024"] for _, d in ntz_overlap]

    # --- Write outputs ----------------------------------------------------------
    write_geojson(os.path.join(out_dir, "protected_areas.geojson"), ps,
                  [c for c in PS_KEEP if c in ps.columns] + ["area_km2"], simplify=0.002)
    write_geojson(os.path.join(out_dir, "ntz2000.geojson"), ntz,
                  ["id", "source_id", "zoni_2000", "subzone_type", "name", "island", "area_km2",
                   "overlap_cells", "overlap_fh_2024", "overlap_fh_json"], simplify=0.0003)
    cell_props = ["cell_id"] + [f"fh_{y}" for y in YEARS] + ["mmsi_present_2024", "top_gear_1", "top_flag_1", "peak_month"]
    active = cells[cells[[f"fh_{y}" for y in YEARS]].sum(axis=1) > 0].copy()
    for c in ("mmsi_present_2024", "peak_month"):
        active[c] = active[c].astype("float").round(0)
    write_geojson(os.path.join(out_dir, "fishing_cells.geojson"), active, cell_props)

    # Attribute-only copy for panels/briefings (imported statically by the app)
    ps_props = [c for c in PS_KEEP if c in ps.columns] + ["area_km2"]
    ntz_props = ["id", "source_id", "zoni_2000", "subzone_type", "name", "island", "area_km2",
                 "overlap_cells", "overlap_fh_2024", "overlap_fh_json"]
    with open(os.path.join(out_dir, "features.json"), "w") as f:
        json.dump({
            "areas": [{k: clean(r[k]) for k in ps_props} for _, r in ps.iterrows()],
            "ntz": [{k: clean(r[k]) for k in ntz_props} for _, r in ntz.iterrows()],
        }, f, separators=(",", ":"), ensure_ascii=False)

    with open(os.path.join(out_dir, "stats.json"), "w") as f:
        json.dump({"years": YEARS, "ring_km": RING_KM, "region": region, "areas": areas}, f, separators=(",", ":"))

    meta = {
        "retrieved_at": retrieved_at,
        "collection_id": COLLECTION_ID,
        "collection_url": f"https://app.hubocean.earth/catalog/collection/{COLLECTION_ID}",
        "study_bbox": [round(v, 3) for v in (minx, miny, maxx, maxy)],
        "datasets": meta_ds,
        "counts": {"protected_areas": len(ps), "ntz2000": len(ntz), "grid_cells_fetched": len(cells), "grid_cells_with_fishing": len(active)},
        "methods": [
            f"Protected areas: ProtectedSeas polygons fully within lon {SEARCH_BOX.bounds[0]}..{SEARCH_BOX.bounds[2]}, lat {SEARCH_BOX.bounds[1]}..{SEARCH_BOX.bounds[3]}; invalid geometries repaired with make_valid.",
            "Fishing effort: GFW 0.1° grid cells fully within the study box (protected areas' envelope + 0.6°).",
            f"A cell counts as 'inside' an area when its centroid falls inside the polygon; 'surrounding' = centroid in a {RING_KM} km ring outside the boundary (EPSG:6933).",
            "Historical no-take zones: sum of fishing hours in every 0.1° cell that intersects the zone — far coarser than the zones themselves.",
            "Top flags 2024 are approximate: built from each cell's top-3 flags only.",
        ],
    }
    with open(os.path.join(out_dir, "meta.json"), "w") as f:
        json.dump(meta, f, indent=1, ensure_ascii=False)
    print("counts:", meta["counts"])


def find_env():
    d = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # app root
    for _ in range(4):
        d = os.path.dirname(d)
        if os.path.isfile(os.path.join(d, ".env")):
            return os.path.join(d, ".env")
    sys.exit("No .env found above the app; pass its path as the first argument.")


if __name__ == "__main__":
    env = sys.argv[1] if len(sys.argv) > 1 else find_env()
    out = sys.argv[2] if len(sys.argv) > 2 else "public/data"
    main(env, out)
