"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import mapboxgl, { type ExpressionSpecification, type FilterSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Selection } from "@/lib/types";
import { LAND_PARK_ID } from "@/lib/data";
import { CELL_STEPS, fmtHours, PROTECTION_LEVELS } from "@/lib/format";

export interface MapViewProps {
  year: number;
  bbox: number[];
  showCells: boolean;
  showAreas: boolean;
  showNtz: boolean;
  selection: Selection;
  onSelect: (s: Selection) => void;
}

function cellColor(year: number): ExpressionSpecification {
  const expr: unknown[] = ["step", ["coalesce", ["get", `fh_${year}`], 0], "rgba(0,0,0,0)"];
  for (const [t, c] of CELL_STEPS) expr.push(t, c);
  return expr as ExpressionSpecification;
}

const levelColor: ExpressionSpecification = [
  "match",
  ["coalesce", ["get", "level_fishing_protection"], 0],
  ...Object.entries(PROTECTION_LEVELS).flatMap(([k, v]) => [Number(k), v.color]),
  "#64748b",
] as unknown as ExpressionSpecification;

const NONE = "__none__";
const MARINE: FilterSpecification = ["!=", ["get", "site_id"], LAND_PARK_ID];
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapViewImpl({ year, bbox, showCells, showAreas, showNtz, selection, onSelect }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // Map handlers are registered once; read the latest props through refs (avoids stale closures)
  const onSelectRef = useRef(onSelect);
  const yearRef = useRef(year);
  useLayoutEffect(() => {
    onSelectRef.current = onSelect;
    yearRef.current = year;
  });
  const [ready, setReady] = useState(false);
  const [basemapBlocked, setBasemapBlocked] = useState<number | null>(null);

  useEffect(() => {
    if (!container.current || !TOKEN) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/light-v11",
      bounds: [bbox[0], bbox[1], bbox[2], bbox[3]] as [number, number, number, number],
      fitBoundsOptions: { padding: 24 },
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-right");
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: "Fishing: Global Fishing Watch · Areas: ProtectedSeas · Zoning 2000: Moity (2018), PANGAEA",
      }),
    );
    map.on("error", (e) => {
      const err = e.error as { status?: number; url?: string; message?: string } | undefined;
      // Basemap tiles rejected → the token lacks tile access; our own layers still render
      if ((err?.status === 401 || err?.status === 403) && err.url?.includes("api.mapbox.com")) {
        setBasemapBlocked(err.status);
        return;
      }
      console.error("[Map]", err?.message || String(err ?? e));
    });

    const hover = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 8, maxWidth: "240px" });

    // Add our layers once the style is parsed, not on "load": "load" waits for every
    // basemap tile and never fires if basemap tiles fail (e.g. a token without tile scope).
    map.once("style.load", async () => {
      map.resize();
      const [cells, areas, ntz] = await Promise.all(
        ["fishing_cells", "protected_areas", "ntz2000"].map((n) => fetch(`/data/${n}.geojson`).then((r) => r.json())),
      );
      if (mapRef.current !== map) return;

      map.addSource("cells", { type: "geojson", data: cells });
      map.addSource("areas", { type: "geojson", data: areas });
      map.addSource("ntz", { type: "geojson", data: ntz });

      map.addLayer({
        id: "cells-fill",
        type: "fill",
        source: "cells",
        paint: { "fill-color": cellColor(yearRef.current), "fill-opacity": 0.78 },
      });
      map.addLayer({
        id: "areas-fill",
        type: "fill",
        source: "areas",
        filter: MARINE,
        paint: { "fill-color": levelColor, "fill-opacity": 0.06 },
      });
      map.addLayer({
        id: "areas-line",
        type: "line",
        source: "areas",
        filter: MARINE,
        paint: { "line-color": levelColor, "line-width": 1.6 },
      });
      // Terrestrial national park = the islands; drawn as land for orientation, not clickable
      map.addLayer({
        id: "land-fill",
        type: "fill",
        source: "areas",
        filter: ["==", ["get", "site_id"], LAND_PARK_ID],
        paint: { "fill-color": "#e7e2d6", "fill-opacity": 0.95 },
      });
      map.addLayer({
        id: "land-line",
        type: "line",
        source: "areas",
        filter: ["==", ["get", "site_id"], LAND_PARK_ID],
        paint: { "line-color": "#a8a29e", "line-width": 0.8 },
      });
      map.addLayer({
        id: "areas-selected",
        type: "line",
        source: "areas",
        filter: ["==", ["get", "site_id"], NONE],
        paint: { "line-color": "#0f172a", "line-width": 3.2 },
      });
      map.addLayer({
        id: "ntz-fill",
        type: "fill",
        source: "ntz",
        paint: { "fill-color": "#7c3aed", "fill-opacity": 0.22 },
      });
      map.addLayer({
        id: "ntz-line",
        type: "line",
        source: "ntz",
        paint: { "line-color": "#6d28d9", "line-width": 1.1, "line-dasharray": [2, 1.5] },
      });
      map.addLayer({
        id: "ntz-selected",
        type: "line",
        source: "ntz",
        filter: ["==", ["get", "id"], NONE],
        paint: { "line-color": "#2e1065", "line-width": 3 },
      });

      map.on("click", (e) => {
        const z = map.queryRenderedFeatures(e.point, { layers: ["ntz-fill"].filter((l) => map.getLayoutProperty(l, "visibility") !== "none") });
        if (z.length) {
          onSelectRef.current({ kind: "ntz", id: String(z[0].properties?.id) });
          return;
        }
        const a = map.queryRenderedFeatures(e.point, { layers: ["areas-fill"] });
        if (a.length) {
          // Nested areas overlap (e.g. Hermandad and its subzones): pick the smallest
          a.sort((x, y) => Number(x.properties?.area_km2) - Number(y.properties?.area_km2));
          onSelectRef.current({ kind: "area", id: String(a[0].properties?.site_id) });
        }
      });

      for (const l of ["ntz-fill", "areas-fill"]) {
        map.on("mouseenter", l, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", l, () => (map.getCanvas().style.cursor = ""));
      }

      map.on("mousemove", "cells-fill", (e) => {
        const p = e.features?.[0]?.properties;
        if (!p) return;
        const y = yearRef.current;
        const h = Number(p[`fh_${y}`] ?? 0);
        hover
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font:12px system-ui,sans-serif;color:#1e293b">
               <div style="font-weight:600;color:#0f172a;margin-bottom:2px">${fmtHours(h)} apparent fishing hours (${y})</div>
               <div style="color:#64748b">0.1° cell ${p.cell_id}</div>
               ${y === 2024 && p.top_gear_1 ? `<div style="color:#475569;margin-top:2px">Top gear 2024: ${String(p.top_gear_1).replace(/_/g, " ")} · flag ${p.top_flag_1 ?? "–"}</div>` : ""}
             </div>`,
          )
          .addTo(map);
      });
      map.on("mouseleave", "cells-fill", () => hover.remove());

      setReady(true);
    });

    return () => {
      hover.remove();
      map.remove();
      mapRef.current = null;
    };
    // bbox is static data; initialise once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setPaintProperty("cells-fill", "fill-color", cellColor(year));
  }, [year, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const vis = (on: boolean) => (on ? "visible" : "none");
    map.setLayoutProperty("cells-fill", "visibility", vis(showCells));
    for (const l of ["areas-fill", "areas-line", "areas-selected"]) map.setLayoutProperty(l, "visibility", vis(showAreas));
    for (const l of ["ntz-fill", "ntz-line", "ntz-selected"]) map.setLayoutProperty(l, "visibility", vis(showNtz));
  }, [showCells, showAreas, showNtz, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const areaId = selection?.kind === "area" ? selection.id : NONE;
    const ntzId = selection?.kind === "ntz" ? selection.id : NONE;
    map.setFilter("areas-selected", ["==", ["get", "site_id"], areaId] as FilterSpecification);
    map.setFilter("ntz-selected", ["==", ["get", "id"], ntzId] as FilterSpecification);
  }, [selection, ready]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={container} style={{ width: "100%", height: "100%" }} />
      {basemapBlocked && (
        <div className="absolute left-3 top-3 max-w-xs rounded-md bg-white/95 px-3 py-2 text-xs leading-snug text-amber-900 shadow ring-1 ring-amber-300">
          <b>Basemap unavailable</b> (Mapbox HTTP {basemapBlocked}). Data layers are shown, but land and labels are
          missing — check that the Mapbox token has the default public scopes.
        </div>
      )}
      {!TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-6 text-center text-sm text-red-700">
          Map unavailable: NEXT_PUBLIC_MAPBOX_TOKEN is not set.
        </div>
      )}
    </div>
  );
}
