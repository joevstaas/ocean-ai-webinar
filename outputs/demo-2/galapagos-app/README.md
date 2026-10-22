# Galápagos fishing pressure

A map-first web app for a marine park manager: where AIS-tracked fishing happens in and
around Galápagos protected areas, how it changes over 2012–2024, and a printable
briefing per area.

## Data lineage

Every layer is read from Ocean Data Platform (ODP). The table traces each one back to its original source.

| Layer | Original source | Full dataset on ODP | ODP dataset used | Licence |
|---|---|---|---|---|
| Current protected areas + rules | [ProtectedSeas Navigator](https://navigatormap.org/) | [ProtectedSeas Navigator V2 — Complete Global Database](https://app.hubocean.earth/catalog/dataset/6fdd5db8-4866-4634-9011-d7591ae7ddc4) | [ProtectedSeas Navigator V2 — Focused](https://app.hubocean.earth/catalog/dataset/a608f54b-75c7-4df9-a3a8-cedbfa391873) (`a608f54b-75c7-4df9-a3a8-cedbfa391873`) | CC-BY-4.0 |
| Historical no-take zones, Zoning Plan 2000 | Moity, N. (2018), PANGAEA, [doi:10.1594/PANGAEA.886891](https://doi.org/10.1594/PANGAEA.886891) | – (ingested directly) | [Galápagos Marine Reserve No-Take Zones – Zoning Plan 2000](https://app.hubocean.earth/catalog/dataset/c3bb5ad5-eb6e-4306-ae1f-85ac3dadfd8b) (`c3bb5ad5-eb6e-4306-ae1f-85ac3dadfd8b`), in the private collection [Galápagos Ocean Data: An AI Workflow Demo](https://app.hubocean.earth/catalog/collection/0d46fc5f-8a50-49bf-ab2a-73ac2c8da690) | CC-BY-SA-3.0 |
| Apparent fishing hours per year | Global Fishing Watch (2025), Apparent Fishing Effort v3.0, [doi:10.5281/zenodo.14982712](https://doi.org/10.5281/zenodo.14982712) | [GFW … monthly — source data v3.0](https://app.hubocean.earth/catalog/dataset/e10d9a76-1949-482d-9292-30b6ed4de9bb) | [GFW … yearly summary 2012–2024](https://app.hubocean.earth/catalog/dataset/5a873571-1f58-4257-b636-4571b669faf8) (`5a873571-1f58-4257-b636-4571b669faf8`) | CC-BY-NC-4.0 |
| Apparent fishing hours per month | same as above | same as above | [GFW … monthly — derived summary](https://app.hubocean.earth/catalog/dataset/48a20311-3564-4045-b472-de775ecee31c) (`48a20311-3564-4045-b472-de775ecee31c`) | CC-BY-NC-4.0 |
| 2024 gear and flag breakdown | same as above | same as above | [GFW … 2024 — derived summary](https://app.hubocean.earth/catalog/dataset/6b84a740-926a-46e6-bc5e-01c5eac3c9b8) (`6b84a740-926a-46e6-bc5e-01c5eac3c9b8`) | CC-BY-NC-4.0 |

The Zoning Plan 2000 layer is a research interpretation of Zoning Plan 2000, published in 2018. It does **not** show
current, legally authoritative protection boundaries. GFW data cover AIS-equipped vessels only, at 0.1° resolution, and
are for non-commercial use.

`npm run prepare-data` reads the links, identifiers, licences, citations and parent datasets above from the ODP
catalogue and writes them to `public/data/meta.json`. It also records the exact query, the number of rows returned, and
the size and SHA-256 of every file the app serves. The app shows this on `/about` (one chain per dataset) and adds a
"Source record" (site_id / WDPA id, or feature and ODP row id) for every area and zone.

## Run

Keys live in a `.env` file above this folder:

- `ODP_API_KEY` — used **only** by the data-prep script, never by the app.
- `NEXT_PUBLIC_MAPBOX_TOKEN` — public Mapbox token used by the map in the browser.

The nearest `.env` above this folder is used (in the webinar repo: the repo root, see `.env.example`).

```bash
npm install
npm run prepare-data   # pulls from ODP → public/data/*.json|geojson
npm run dev            # or: npm run build && npm start
```

## How it works

`scripts/prepare_data.py` queries ODP once and precomputes per-area statistics
(cells counted "inside" by centroid; a 25 km comparison band outside each boundary).
The Next.js app serves the resulting small static files — no ODP calls at runtime.
Lineage, methods and caveats are listed on the `/about` page.
