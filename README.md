# Ocean Data Platform: Working with AI-agents

HUB Ocean webinar, 22 October 2026, 15:30–16:15 CEST. Presented by Jo Øvstaas with co-host Tom Redd.

## Presentation

Open [the HTML presentation](outputs/webinar-slides-draft.html) in a browser after downloading or cloning this repository. It currently contains 14 draft slides.

- Arrow keys: previous/next slide.
- **N**: presenter notes. **F**: fullscreen.
- Click a screenshot to enlarge; use Close or Escape to return.
- Slide 11 contains a copyable dataset-discovery prompt.

Fonts and slide images are embedded, so the slides can be viewed offline. Demo prototypes and external links require internet access. Private ODP dataset links require the appropriate account permissions.

## Contents

- [Run plan](outputs/webinar-run-plan.md): 45-minute agenda, demo steps and presenter guidance.
- [Demo 1](outputs/demo-1/): two independently generated Galápagos map prototypes and their audits.

Demo 1 compares different data choices made from the same prompt. Its audits primarily inspect the saved code, not preserved original API responses. The presentation copies use Esri Ocean basemap tiles; the audits document this change from the original CARTO basemap. Live data services may be slow or unavailable.

## ODP ingest example

The presentation includes a prepared walkthrough of importing historical Galápagos no-take zones into a private ODP collection. The source is:

Moity, Nicolas (2018): *No-Take Zones in the Galapagos Marine Reserve, Zoning plan 2000*. PANGAEA. [DOI: 10.1594/PANGAEA.886891](https://doi.org/10.1594/PANGAEA.886891). Research conducted on behalf of the Charles Darwin Foundation. Source licence: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

This is a historical research interpretation, **not current legal protection boundaries**. It is shown as an ingestion example, not as the protection layer for a 2024 fishing analysis.

## Credentials and assets

No API keys, credential files or local ingestion state are included. `.env.example` contains only a placeholder. Never commit a real `.env` file.

HUB Ocean and product logos, third-party screenshots, fonts and source data retain their respective ownership and applicable terms. No blanket licence is applied to those assets. The whale illustration is AI-generated and labelled in the slides.

This repository is a working draft. The later map-analysis and deployment parts of the webinar are still being developed.
