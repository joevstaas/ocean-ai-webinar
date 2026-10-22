# Galápagos fishing pressure

A map-first web app for a marine park manager: where AIS-tracked fishing happens in and
around Galápagos protected areas, how it changes over 2012–2024, and a printable
briefing per area.

## Data (all from Ocean Data Platform)

| Layer | ODP dataset | Licence |
|---|---|---|
| Current protected areas + rules | ProtectedSeas Navigator V2 — Focused (`a608f54b…`) | CC-BY-4.0 |
| Historical no-take zones, Zoning Plan 2000 | Moity (2018), collection `0d46fc5f…` (`c3bb5ad5…`) | CC-BY-SA-3.0 |
| Apparent fishing hours (yearly, monthly, 2024 gear/flags) | GFW derived summaries (`5a873571…`, `48a20311…`, `6b84a740…`) | CC-BY-NC-4.0 |

The Zoning Plan 2000 layer is a historical research interpretation, **not** current
legal boundaries. GFW data cover AIS-equipped vessels only, at 0.1° resolution.

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
Methods and caveats are listed on the `/about` page.
