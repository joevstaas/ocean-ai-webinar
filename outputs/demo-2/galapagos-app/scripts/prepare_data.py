"""Pull Galápagos layers from Ocean Data Platform and precompute static app data.

Usage:  python3 -I scripts/prepare_data.py [path-to-.env] [output-dir]

Reads ODP_API_KEY from the given .env, or the nearest .env above this app (never printed). Writes small GeoJSON/JSON
files that the Next.js app serves statically, so no key ever reaches the browser.
"""
import hashlib
import importlib.metadata
import json
import os
import re
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
PORTAL = "https://app.hubocean.earth/catalog"
PORTAL_DATASET = re.compile(r"app\.hubocean\.earth/catalog/dataset/([0-9a-f-]{36})")

# What each static file in public/data is built from (checksums are added at write time)
OUTPUTS = [
    {"file": "protected_areas.geojson", "from": ["protectedseas"],
     "description": "ProtectedSeas polygons and rules; display geometry simplified to ~200 m."},
    {"file": "ntz2000.geojson", "from": ["ntz2000", "gfw_yearly"],
     "description": "Zoning Plan 2000 no-take zones (display geometry ~30 m) with fishing hours in overlapping cells."},
    {"file": "fishing_cells.geojson", "from": ["gfw_yearly", "gfw_2024"],
     "description": "0.1° cells with any apparent fishing 2012–2024, yearly hours and 2024 top gear/flag."},
    {"file": "features.json", "from": ["protectedseas", "ntz2000"],
     "description": "Attribute-only copies of the area and zone records for panels and briefings."},
    {"file": "stats.json", "from": ["protectedseas", "gfw_yearly", "gfw_monthly", "gfw_2024"],
     "description": "Per-area inside/surrounding summaries computed from full-resolution boundaries."},
]


def catalog(client, dataset_id):
    r = client._request(requests.Request("GET", f"{client.base_url}/api/catalog/v2/datasets/{dataset_id}"), retry=False)
    r.raise_for_status()
    return r.json()


def odp_record(d):
    """The catalogue facts we cite for an ODP dataset."""
    lic = d.get("license") or {}
    col = d.get("collection") or {}
    return {
        "id": d["id"],
        "name": d.get("name"),
        "url": f"{PORTAL}/dataset/{d['id']}",
        "provider": (d.get("provider") or {}).get("name"),
        "license": lic.get("enum_val") or lic.get("name"),
        "license_url": lic.get("url"),
        "citations": [c for c in d.get("citations") or [] if c.get("text")],
        "documentation": d.get("documentation") or [],
        "constraints": [c["text"] for c in d.get("constraints") or [] if c.get("text")],
        "visibility": d.get("visibility"),
        "updated_at": (d.get("audit_fields") or {}).get("updated_at"),
        "collection": {"id": col.get("id"), "name": col.get("name"), "url": f"{PORTAL}/collection/{col.get('id')}"} if col.get("id") else None,
    }


def parent_dataset_id(d):
    """ODP datasets point to the dataset they were derived from ("Child of" or a portal link in documentation)."""
    ai = d.get("additional_info") or {}
    for text in [ai.get("Child of", "")] + list(d.get("documentation") or []):
        m = PORTAL_DATASET.search(text or "")
        if m and m.group(1) != d["id"]:
            return m.group(1)
    return None


def original_source(key, d, parent):
    """The source outside ODP, taken from the catalogue entries rather than typed in by hand."""
    ai = d.get("additional_info") or {}
    if key == "ntz2000":
        return {
            "title": ai.get("source_title"),
            "creator": ai.get("author"),
            "publisher": ai.get("publisher"),
            "published": ai.get("publication_date"),
            "doi": ai.get("source_doi"),
            "url": ai.get("source_landing_page") or f"https://doi.org/{ai.get('source_doi')}",
            "download_url": ai.get("source_download_url"),
            "license": ai.get("original_licence"),
            "related_publication": ai.get("related_publication"),
            "checksum_sha256": ai.get("original_archive_sha256"),
            "citation": (d.get("citations") or [{}])[0].get("text"),
        }
    if key == "protectedseas":
        docs = d.get("documentation") or []
        return {
            "title": "ProtectedSeas Navigator",
            "publisher": "ProtectedSeas",
            "url": docs[0] if docs else "https://navigatormap.org/",
            "methodology": docs[1:],
            "source_updated": ai.get("last_update.date"),
            "citation": (d.get("citations") or [{}])[0].get("text"),
        }
    # GFW summaries: the original is the GFW release cited by the parent "source data" dataset on ODP
    src = parent or d
    cit = (src.get("citations") or [{}])[0]
    pages = [u for u in src.get("documentation") or [] if "globalfishingwatch.org" in u]
    return {
        "title": cit.get("text"),
        "publisher": "Global Fishing Watch",
        "url": pages[0] if pages else None,
        "doi": cit.get("link", "").removeprefix("https://doi.org/") or None,
        "citation": cit.get("text"),
    }


def dataset_lineage(client, key, dataset_id):
    d = catalog(client, dataset_id)
    pid = parent_dataset_id(d)
    parent = catalog(client, pid) if pid else None
    rec = odp_record(d)
    rec["description"] = d.get("description")
    rec["parent"] = odp_record(parent) if parent else None
    rec["origin"] = original_source(key, d, parent)
    return rec


def file_digest(path):
    with open(path, "rb") as f:
        data = f.read()
    return {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


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

    # --- Catalogue metadata and lineage (dataset -> parent ODP dataset -> original source)
    meta_ds = {key: dataset_lineage(client, key, i) for key, i in DATASETS.items()}
    r = client._request(requests.Request("GET", f"{client.base_url}/api/catalog/v2/data-collections/{COLLECTION_ID}"), retry=False)
    r.raise_for_status()
    collection = {"id": COLLECTION_ID, "name": r.json().get("name"), "visibility": r.json().get("visibility"),
                  "url": f"{PORTAL}/collection/{COLLECTION_ID}"}

    # --- Protected areas (ProtectedSeas, current) -----------------------------
    ps_filter = f'geometry within "{SEARCH_BOX.wkt}"'
    ps = select(client, DATASETS["protectedseas"], ps_filter)
    meta_ds["protectedseas"]["query"] = {"filter": ps_filter, "rows": len(ps)}
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
    meta_ds["ntz2000"]["query"] = {"filter": None, "rows": len(ntz)}
    ntz = gpd.GeoDataFrame(ntz, geometry=ntz["geometry"].map(to_geom), crs="EPSG:4326")

    # --- GFW fishing effort -----------------------------------------------------
    gf = f'geometry within "{bbox.wkt}"'
    yearly = select(client, DATASETS["gfw_yearly"], gf)
    s24 = select(client, DATASETS["gfw_2024"], gf)
    monthly = select(client, DATASETS["gfw_monthly"], gf)
    for key, df in (("gfw_yearly", yearly), ("gfw_2024", s24), ("gfw_monthly", monthly)):
        meta_ds[key]["query"] = {"filter": gf, "rows": len(df)}

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
        "generated_by": {"script": "scripts/prepare_data.py", "odp_sdk": importlib.metadata.version("odp-sdk"),
                         "odp_api": client.base_url},
        "collection_id": COLLECTION_ID,
        "collection_url": f"{PORTAL}/collection/{COLLECTION_ID}",
        "collection": collection,
        "study_bbox": [round(v, 3) for v in (minx, miny, maxx, maxy)],
        "datasets": meta_ds,
        "outputs": [
            {**o, **file_digest(os.path.join(out_dir, o["file"]))} for o in OUTPUTS
        ],
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
