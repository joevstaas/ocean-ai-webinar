"use client";
import { useEffect, useState, type ComponentType } from "react";
import type { MapViewProps } from "./map-view";

// Client-only load without next/dynamic (see mapbox-odp-maps skill: Turbopack false positive).
export function MapView(props: MapViewProps) {
  const [Component, setComponent] = useState<ComponentType<MapViewProps> | null>(null);

  useEffect(() => {
    import("./map-view").then((mod) => setComponent(() => mod.default));
  }, []);

  if (!Component) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-700 border-t-transparent" />
      </div>
    );
  }
  return <Component {...props} />;
}
