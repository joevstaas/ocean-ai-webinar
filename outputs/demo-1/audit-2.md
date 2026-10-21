# Audit: Galápagos Marine Biodiversity Explorer

**Audit date:** 16 October 2026  
**Inspected artifact:** `galapagos_biodiversity_explorer.html`  
**Method:** Inspection of saved HTML, JavaScript, data-source configuration and retrieval logic. This is **not** an independently verified audit of live API responses.

## 1. Executive assessment

**Verdict: Not reproducible from saved data alone.**

The prototype contains a working design for an interactive map and code to request species occurrences and protected-area features from public services. However, the saved HTML contains **no archived observations or protected-area geometries**. No successful original retrieval is documented, and no source response files or retrieval logs are saved. Consequently, the number of records actually obtained in the original browser session cannot be established.

An analyst may be able to rerun the *configured queries*, assuming the external services remain available, but cannot reconstruct a particular historical map state or independently reproduce scientific analytical results from the saved artifact alone.

## 2. Layer-by-layer source audit

| Field | Species observations | Galápagos protected areas | Hermandad Marine Reserve |
|---|---|---|---|
| Provider | Ocean Biodiversity Information System (OBIS) | ArcGIS Online hosted service | ArcGIS Online hosted service |
| Exact source | `https://api.obis.org/v3/occurrence` | `Haase_Galapagos_Guava_MAP3I_WFL1`, FeatureServer layer **14** | Same FeatureServer, layer **13** |
| Original retrieval date | Not established | Not established | Not established |
| Geographic request extent | Rectangle 93°W–88°W, 2°S–2°N | All features on layer, no spatial filter | All features on layer, no spatial filter |
| Actual returned-feature extent | Not established | Not established | Not established |
| Time coverage | No occurrence-date restriction; actual returned dates unknown | Not established | Not established |
| Source-side filters | WKT polygon, `size=1000`, `offset=0` | `where=1=1`, `outFields=*`, `returnGeometry=true`, `outSR=4326`, `f=geojson` | Same as layer 14 |
| Number actually retrieved | **Unknown** | **Unknown** | **Unknown** |
| Number archived in saved HTML | **0** | **0** | **0** |
| Complete matching dataset? | Not proven; limited to one page of at most 1,000 | Not proven; possible service record cap | Not proven; possible service record cap |

**Important:** “0 archived” does not mean that the source contains no records. It means the saved prototype does not include data snapshots.

### 2.1 OBIS observations

The configured request uses:

```text
https://api.obis.org/v3/occurrence
?geometry=POLYGON((-93 -2,-88 -2,-88 2,-93 2,-93 -2))
&size=1000
&offset=0
```

This is a rectangular area rather than an ecological or legal boundary. The source-side request does not restrict date, taxon, depth, sampling method or dataset. The UI allows scientific-name and year filtering **after** records have been received; this filtering cannot recover records omitted from the first API page. Records lacking usable coordinates may be excluded from display.

Since the code requests only a first page, even receipt of 1,000 records would not show that all matching records had been collected. The actual returned count is unknown.

### 2.2 Galápagos protected-area features

The configured ArcGIS endpoint is:

```text
https://services.arcgis.com/qboYD3ru0louQq4F/ArcGIS/rest/services/Haase_Galapagos_Guava_MAP3I_WFL1/FeatureServer/14/query
```

Query parameters:

```text
where=1=1
outFields=*
returnGeometry=true
outSR=4326
f=geojson
```

This asks for the geometries returned by layer 14 but does not verify the data’s legal authority, effective date, full feature extent or completeness. No pagination or response-limit completeness check is established in the saved application.

### 2.3 Hermandad Marine Reserve features

The configured endpoint is the same as above, with layer **13** in place of layer 14; the query parameters are identical. Actual retrieved feature count, extent, authoritative status and time coverage are unknown. Completeness is not proven.

### 2.4 Background basemap

The map uses CARTO `light_all` raster basemap tiles with OpenStreetMap/CARTO attribution. These are external display resources rather than an archived scientific layer. Their exact original tile state and underlying source-data vintage were not captured.

## 3. Approximations, fallback behavior and unsupported interpretations

| Issue | Finding | Implication |
|---|---|---|
| Rectangular study extent | Geographic approximation | Not equivalent to Galápagos waters or marine reserve borders |
| First 1,000 OBIS matches | One-page limit, not a validated representative sample | Species composition and patterns could be biased by service ordering |
| OBIS aggregation | Contributing datasets not inventoried | Dataset-level provenance cannot be reconstructed from archived results |
| Distinct scientific names | Not the same as verified species richness | Taxonomic synonyms and non-species names may inflate or change counts |
| Missing observation years | A year filter may exclude records without a parseable year | Filtered counts are conditional on metadata completeness |
| Protected-area boundaries | Public hosted GIS geometries, not independently checked authoritative legal boundaries | Unsuitable for legal conclusions without verification |
| ArcGIS responses | No demonstrated pagination/completeness verification | A successful response may omit matching features |
| Retrieval/status timestamps | No persisted source snapshot or retrieval log | Cannot prove when source data were retrieved or their vintage |
| API success | Connectivity is not scientific validation | Returned features may still need quality checks |
| Fallback features | No synthetic observations or replacement polygons found | Error states/empty layers must not be mistaken for absence of species or protection |

The map does not establish that protected areas adequately cover biodiversity. It does not implement a validated spatial intersection analysis, protected-versus-unprotected observation proportions, sampling-effort correction or assessment of management effectiveness. Overlaying points and boundaries visually is **not** an analytical result.

The on-screen “visible named taxa” indicator counts unique scientific-name strings, not independently verified distinct biological species. A successful empty API response should also be distinguished from an API failure or a partial response.

## 4. What is saved and what is missing

### Available

- `galapagos_biodiversity_explorer.html` (saved HTML/CSS/JavaScript; 14,199 bytes at audit)
- Configured source URLs and API query parameters
- Visualization code, styling and map initialization
- Client-side observation filters and popups
- Request-status/error-display logic
- Introductory source and limitation disclosures

### Missing

- Raw OBIS response or occurrence export
- Raw protected-area GeoJSON or other archived geometries
- Verified response feature counts and total matching-record counts
- Original successful request times and response logs
- Dataset versions/publication dates and service metadata snapshots
- Proof of pagination completeness or extent coverage
- Archived identifiers and underlying OBIS dataset inventory
- Authoritative legal boundary validation and effective dates
- Checksums, source manifest and fixed data snapshot
- Reproducible spatial analysis scripts and derived-output files
- A persisted, point-in-time interactive map state

## 5. Reproducibility assessment

| Task | Reproducible from saved files? |
|---|---|
| Reopen the same interface | Yes, provided external JS/CSS/maps remain reachable |
| Reissue the configured requests | In principle, if APIs remain reachable and compatible |
| Recover exactly the originally returned observations | **No** |
| Recover exactly the original MPA geometries | **No** |
| Verify the original returned record counts | **No** |
| Rebuild map completely offline | **No** |
| Reproduce scientific conclusions about conservation coverage | **No**; no validated analysis is preserved |
| Independently validate a specific historical map state | **No** |

## 6. Overall conclusion and recommended next steps

The prototype demonstrates an approach for interactively querying public marine biodiversity and conservation GIS services. It is **not yet a reproducible scientific data product**. Its central limitation is lack of preserved and independently verified data provenance—not merely a visualization limitation.

To make a subsequent version auditable, retrieve and store timestamped raw responses; capture exact query parameters, source metadata and counts; paginate and verify completeness; preserve taxon and dataset identifiers; confirm protected-area boundaries with authoritative Ecuadorian sources; and archive repeatable geospatial analyses and derived outputs with checksums.

**Audit boundary:** This report is based on the saved application code. No original live browser/API session or its responses were available for independent verification. All unknown values are explicitly identified rather than assumed.


## Webinar display update

The presentation copy of the HTML now uses Esri Ocean tiles instead of CARTO, following an API-key-required message from CARTO. Scientific queries and data handling are unchanged. The audit above describes the originally supplied artifact. Replacement tile service: `https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer`. Attribution: Esri, Garmin, GEBCO, NOAA NGDC and other contributors.
