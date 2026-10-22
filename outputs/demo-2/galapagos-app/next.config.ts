import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// The Mapbox token lives in a project-level .env above this folder (nearest one wins),
// shared with the data-prep script. Only this public token is passed to the app;
// ODP_API_KEY is used solely by scripts/prepare_data.py and never reaches the build.
function readParentEnv(name: string): string | undefined {
  for (let dir = path.resolve(process.cwd(), ".."), i = 0; i < 4; dir = path.dirname(dir), i++) {
    try {
      const text = fs.readFileSync(path.join(dir, ".env"), "utf8");
      const line = text.split(/\r?\n/).find((l) => l.trim().startsWith(`${name}=`));
      const value = line?.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "");
      if (value) return value;
    } catch {
      // no .env here; keep walking up
    }
  }
  return undefined;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? readParentEnv("NEXT_PUBLIC_MAPBOX_TOKEN");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["mapbox-gl"],
  env: mapboxToken ? { NEXT_PUBLIC_MAPBOX_TOKEN: mapboxToken } : {},
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
