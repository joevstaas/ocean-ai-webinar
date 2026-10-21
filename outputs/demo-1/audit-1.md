# Audit — Galápagos Marine Biodiversity Explorer

**Audit date:** 16 October 2026  
**Artifact:** `galapagos_biodiversity_explorer.html`  
**Overall finding:** **Not reproducible as delivered.** The HTML implements an interactive map and live API requests, but does not contain retrieved observations, protected-area geometries, retrieval logs, or saved analysis results.

## Executive findings

| Audit criterion | Finding |
|---|---|
| Public sources and API query logic identified | Yes |
| Exact request parameters recoverable | Yes |
| Number of records retrieved during original creation | Unknown; no execution log |
| Complete matching datasets | Not established; requests are capped |
| Raw source responses or geospatial data saved | No |
| Source retrieval timestamps | Not recorded |
| Deterministic re-execution | No |
| Reproducible scientific analytical results | No |

The application attempts to obtain live observations and boundary polygons when opened. No stored response proves either API successfully returned any records during prototype creation. The number **saved in the HTML is zero** for both scientific layers; this does **not** mean either upstream dataset has zero records.

## 1. Layer A — Species observations

| Property | Finding from the saved code |
|---|---|
| Data provider | Ocean Biodiversity Information System (OBIS) |
| Exact requested source | OBIS v3 aggregated occurrence endpoint: `https://api.obis.org/v3/occurrence` |
| Constituent datasets | Not specified; dataset-level identifiers can occur in returned records, but none are saved |
| Retrieval date and time | Not captured or evidenced |
| Geographic extent | WKT rectangular search polygon, approximately **92.8°W–87.5°W; 2.5°S–2.1°N** |
| Observation time coverage | No server-side date filter; actual oldest/newest event dates unknown |
| Server-side filters | `geometry=<WKT polygon>`; `size=<selected cap>`; requested field list |
| Default requested cap | **1,500** records; user may choose **500** or **3,000** |
| Actual records retrieved | Unknown |
| Observation records embedded/saved | **0** |
| Dataset completeness | Not established; capped one-request response, no pagination |

**Requested fields:** `id`, `occurrenceID`, `scientificName`, `species`, `class`, `eventDate`, `decimalLatitude`, `decimalLongitude`, `basisOfRecord`, `datasetName`, `datasetID`, `minimumDepthInMeters`, `maximumDepthInMeters`.

**Processing:** The client discards records with null or nonnumeric latitude/longitude, then offers local filtering by taxonomic `class`, `basisOfRecord`, and event year (since 1990, 2000, 2010, or 2020). The taxonomy and basis filter options are populated from whatever capped response arrives. Changing these filters does **not** query all matching records in OBIS. The app shows the API-reported matching `total` if present, but does not persist it.

**Interpretation:** The map can show occurrence coordinates, not abundance, species absence, effort-normalized richness, or complete regional biodiversity. Its displayed “distinct scientific names” counts strings within the visible capped records; this is not a validated species-richness metric.

## 2. Layer B — Protected-area boundary polygons

| Property | Finding from the saved code |
|---|---|
| Data represented | A service labeled `WDPA_WDOECM_poly_May2026` (WDPA / WDOECM), exposed via ArcGIS |
| Exact requested source | `https://services3.arcgis.com/2LJ6Q6yCIIUOP8qx/ArcGIS/rest/services/WDPA_WDOECM_poly_May2026/FeatureServer/0/query` |
| Source version | **May 2026** in service name; independent release manifest and provenance not saved |
| Retrieval date and time | Not recorded |
| Spatial query | Envelope **93°W–87°W; 3°S–3°N**, `esriSpatialRelIntersects`, input/output EPSG:4326 |
| Attribute filter | `PRNT_ISO3 = 'ECU'` |
| Explicit marine-only filter | **None** |
| Temporal filter | **None**; `STATUS_YR` requested as an attribute |
| Geometry/output | `returnGeometry=true`, `f=geojson`; display only Polygon/MultiPolygon geometries |
| Maximum requested records | **200** (`resultRecordCount=200`) |
| Actual records retrieved | Unknown |
| Geometries embedded/saved | **0** |
| Completeness | Unknown; no pagination or explicit truncation check |

**Requested fields:** `SITE_ID`, `NAME`, `NAME_ENG`, `DESIG`, `DESIG_ENG`, `STATUS`, `STATUS_YR`, `IUCN_CAT`, `NO_TAKE`, `REP_M_AREA`, `REALM`.

**Interpretation:** This query selects Ecuador-attributed features intersecting an envelope. It does not establish that every returned feature is a marine protected area, that features are wholly within the study area, or that they collectively represent all current legally authoritative Galápagos marine protected areas. The service name mentions both WDPA and WDOECM; the app does not distinguish their status. Returned feature counts do not necessarily equal unique sites.

## 3. Layer C — Background basemap

| Property | Finding |
|---|---|
| Provider | CARTO tiles, OpenStreetMap contributor attribution |
| Tile URL | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` |
| Geographic extent | Requested dynamically for the map viewport |
| Retrieval date / tile vintage | Not saved |
| Saved offline tiles | None |
| Analytical role | Visual context only; not a biodiversity or legal-boundary input |

The map also loads Leaflet 1.9.4 from a public CDN, so HTML alone does not provide a fully offline runtime.

## 4. Approximations, fallbacks, and unsupported interpretations

| Issue | Severity | Audit observation |
|---|---|---|
| Galápagos defined using rectangular query windows | High | Search windows are not official administrative, ecological, or marine-reserve boundaries. The two data layers use different rectangles. |
| Capped OBIS observations | High | Results are a limited retrieval, not a complete or representative scientific sample. No pagination. |
| “Species observations” designation | Medium | `scientificName` may describe taxa above species rank; basis and taxonomic validity are not checked. |
| Distinct scientific names as biodiversity | High | Visible name count is not taxonomically validated richness and is sensitive to the capped subset. |
| Protected-area features treated as MPAs | High | Neither marine-only filtering nor PA-versus-OECM verification is implemented. |
| May 2026 boundary vintage | Medium | Inferred from the feature service identifier, not a stored primary-source manifest. |
| Visual overlap used to imply protection coverage | High | No verified point-in-polygon calculation or protected-area effectiveness analysis is performed. |
| Missing observation QA | Medium | Coordinate uncertainty, taxonomic synonym handling, duplicate checks and sampling effort are not addressed. |
| Potentially incomplete polygons | High | ArcGIS result cap is 200; no completeness verification. |
| Feature counts | Medium | Returned polygon features may not correspond one-to-one with unique protected areas. |

**Synthetic/fallback records:** None found in the saved code. The app does not generate fake observations or geometry. On API failure it displays an error and leaves the relevant layer empty. However, those failures and response metadata are not preserved in a saved machine-readable audit log.

**Unsupported conclusions:** The prototype cannot establish species richness, biodiversity hotspots, representativeness of sampling, percent of biodiversity protected, conservation effectiveness, changes over time, or the full current legal protection footprint. No scientific analytical outputs are saved.

## 5. Reproducibility inventory

The available delivered artifact is a single HTML file (`galapagos_biodiversity_explorer.html`; **15,292 bytes** at audit). This is the executable interface and query source, not a frozen dataset.

| Item | Saved? |
|---|---|
| UI, map styling, client-side filter and query code | Yes |
| API endpoint URLs and query parameters | Yes |
| Default geographic extents and request limits | Yes |
| Original OBIS JSON/CSV occurrence records | **No** |
| Original MPA GeoJSON or GIS file | **No** |
| Source response bodies and headers | **No** |
| Actual returned record counts and record IDs | **No** |
| Request execution time, status, error, pagination trace | **No** |
| Complete extraction or API-total verification | **No** |
| Official authoritative Ecuador boundary reference | **No** |
| Source license snapshots, versions, checksums | **No** |
| Frozen basemap and Leaflet assets | **No** |
| Reproducible quality-control and analytical result tables | **No** |

### Could another analyst reproduce the same map and results?

**Interface and query construction: largely yes. Original map data state and scientific results: no.** Another analyst can open the HTML and request data from the public endpoints again, assuming the endpoints and external JavaScript/tile services still work. But a different response, source revision, returned order, cap behavior, or failure can lead to a different displayed dataset. No original retrieval timestamp, payload, version lock or checksum is present for comparison.

## 6. Minimum additions required for scientific reproducibility

1. **Frozen source data:** save actual occurrence rows and protected-area geometries, with stable record identifiers and machine-readable formats.
2. **Provenance manifest:** capture dataset names/IDs, publishers, source URLs, publication versions, licenses, UTC retrieval timestamps, coordinate reference systems and cryptographic hashes.
3. **Retrieval logs:** preserve exact URL/query, response status, total counts, paging/offsets, page sizes, returned counts and errors; verify whether extraction is exhaustive.
4. **Processing code and QA:** document accepted coordinates, deduplication, taxonomic normalization, terrestrial/marine filtering, PA/OECM differentiation and geometry validation.
5. **Saved analyses:** provide explicit study-region geometry, reproducible point-in-polygon methods, sampling-bias caveats, resulting tables and maps, plus tests.
6. **Authoritative boundaries:** reconcile third-party global polygons with the appropriate Ecuadorian authority's designated, current marine boundaries and zoning.

## Final assessment

| Dimension | Status |
|---|---|
| Interactive demonstration | Implemented |
| Documented data-source requests | Available |
| Verified original retrieval | **Not evidenced** |
| Complete and versioned scientific data | **Missing** |
| Reproducible scientific analysis | **Not achieved** |

**Conclusion:** This is a useful public-data exploration interface but not an auditable, reproducible biodiversity assessment. A live API integration does not itself establish which records were used, whether retrieval was exhaustive, or how scientifically defensible conclusions were derived.

---

*Audit scope: static inspection of the saved HTML and available output artifacts, not a verified successful browser/API retrieval. Unknown values have deliberately not been replaced with assumptions.*


## Webinar display update

The presentation copy of the HTML now uses Esri Ocean tiles instead of CARTO, following an API-key-required message from CARTO. Scientific queries and data handling are unchanged. The audit above describes the originally supplied artifact. Replacement tile service: `https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer`. Attribution: Esri, Garmin, GEBCO, NOAA NGDC and other contributors.
