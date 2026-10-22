import Link from "next/link";
import type { Metadata } from "next";
import { SourcesList } from "@/components/sources";
import { FISHING_CAVEAT, HISTORICAL_WARNING, meta } from "@/lib/data";

export const metadata: Metadata = { title: "Sources & methods · Galápagos fishing pressure" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-xs text-sky-800 hover:underline">
        ← Back to map
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Sources, licences & methods</h1>
      <p className="mt-1 text-sm text-slate-600">
        All layers come from{" "}
        <a className="text-sky-800 hover:underline" href={meta.collection_url} target="_blank" rel="noreferrer">
          Ocean Data Platform
        </a>{" "}
        and were retrieved on {meta.retrieved_at.replace("T", " ").replace("+00:00", " UTC")}.
      </p>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Read this first</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        <li>{HISTORICAL_WARNING}</li>
        <li>{FISHING_CAVEAT}</li>
        <li>
          “Apparent fishing” is Global Fishing Watch’s model of vessel behaviour. It does not by itself show illegal
          activity, and it does not show which rules applied to a given vessel.
        </li>
        <li>Global Fishing Watch data are licensed CC-BY-NC-4.0: attribution required, non-commercial use only.</li>
      </ul>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Datasets</h2>
      <div className="mt-2">
        <SourcesList />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">How the numbers are made</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {meta.methods.map((m) => (
          <li key={m}>{m}</li>
        ))}
        <li>Map outlines are simplified for display (~200 m for protected areas, ~30 m for zones); statistics use the full-resolution boundaries.</li>
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        Counts: {meta.counts.protected_areas} protected areas, {meta.counts.ntz2000} historical no-take zones,{" "}
        {meta.counts.grid_cells_with_fishing} grid cells with recorded fishing (of {meta.counts.grid_cells_fetched} in the
        study box {meta.study_bbox.join(", ")}).
      </p>
    </div>
  );
}
