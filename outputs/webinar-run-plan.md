# Webinar Run Plan: Agentic AI and Ocean Data

**Presenter:** Jo Øvstaas, HUB Ocean
**Co-host:** Tom Redd
**Date:** Thursday 22 October 2026
**Time:** 15:30–16:15 CEST
**Invitation title:** Webinar | Ocean Data Platform: Working with AI-agents
**Deck:** `webinar-slides-draft.html`, 18 slides
**Audience:** Researchers, analysts, developers and ocean-data practitioners
**Timing:** 36 minutes of presentation and demonstrations, 7 minutes of questions, 2 minutes of buffer. Finish by 16:15.

## Story and learning goals

Start with the ODP workflow, explain how agents and Skills help, and compare two plausible prototypes produced from the same prompt. Then show a more explicit workflow through ODP: discover datasets, bring in a local dataset, inspect the result and explore an ODP-powered map. End by inviting participants to try a small project themselves.

Participants should leave able to distinguish chatbot, agent and agentic workflow; understand how a readable Skill guides work; find and ingest ocean data; and ask better questions about provenance, verification and reproducibility.

## Running order: all 18 slides

Elapsed times include the demonstrations. The clock times are presenter cues, not text to add to the slides.

| Slide | Elapsed time | Clock time (CEST) | Duration | What to do and say |
|---|---|---|---:|---|
| 1 · Opening | 00:00–02:00 | 15:30–15:32 | 2 min | Tom welcomes everyone and explains questions. Jo gives the personal ocean/AI introduction using the lobster photo. Set the practical promise. |
| 2 · ODP workflow | 02:00–03:30 | 15:32–15:33:30 | 1.5 min | Find data and/or bring your own into My Data. Use it in analysis, GIS or a custom web app. Point out AI support for discovery, ingest and app development, as individual tasks or a connected workflow. |
| 3 · Why AI coding now? | 03:30–05:30 | 15:33:30–15:35:30 | 2 min | Introduce Karpathy briefly. Connect English-language instructions to more accessible coding. Explain his argument about older/free models versus current agentic models used for technical work. Do not read the posts aloud. |
| 4 · Working definitions | 05:30–07:30 | 15:35:30–15:37:30 | 2 min | Explain chatbot, agent and agentic workflow using the ocean-data examples and illustrations. Focus on who chooses and executes the next step. |
| 5 · My AI tools | 07:30–09:30 | 15:37:30–15:39:30 | 2 min | Briefly cover Codex, Claude Code, Microsoft 365 Copilot and Lovable. Frame differences as personal experience. Spend the final 30 seconds on architecture, UX and testing roles: engineering judgement still matters. |
| 6 · Skills made simple | 09:30–12:30 | 15:39:30–15:42:30 | 3 min | Explain SKILL.md. **Live demo:** open Claude Code or Codex, show the ingest Skill and edit one instruction about column descriptions. Show how readable and modifiable it is. |
| 7 · First Q&A | 12:30–13:30 | 15:42:30–15:43:30 | 1 min | Tom selects one short clarification about tools, agents or Skills. Save broader questions for slide 16. |
| 8 · Same prompt, two runs | 13:30–16:30 | 15:43:30–15:46:30 | 3 min | Show the shared prompt. **Live demo:** open both prototypes in separate tabs and compare the maps. Show one filter, then return to the deck. |
| 9 · Different data decisions | 16:30–18:30 | 15:46:30–15:48:30 | 2 min | Compare geographic windows, boundary sources and configured retrieval limits. These are substantive choices made by the agents. Limits are not verified retrieved counts. |
| 10 · Evidence trail | 18:30–20:00 | 15:48:30–15:50 | 1.5 min | Filters operate on retrieved subsets. Neither prototype preserves the original live data state or validates a protection-coverage calculation. Transition to explicit sources and a repeatable method. |
| 11 · Demo 2 question and layers | 20:00–21:30 | 15:50–15:51:30 | 1.5 min | Introduce Galápagos: observations, protection, apparent fishing activity and your own imported data. Ask where layers overlap. Keep 30×30 as context, not a claim that the demo measures conservation effectiveness. |
| 12 · Demo sequence | 21:30–22:30 | 15:51:30–15:52:30 | 1 min | Orient the audience: find → bring your own → explore → check. Explain ODP as neutral infrastructure supporting provenance, lineage and a consistent access approach. Say which steps were prepared. |
| 13 · Talk to the catalog | 22:30–25:30 | 15:52:30–15:55:30 | 3 min | **Live demo:** copy the discovery prompt from slide 12, open Claude Code and show dataset discovery. Use the two screenshots as the fallback. Distinguish metadata overlap from confirmed local records. Show how the workflow can become your own Skill. |
| 14 · Bring your own | 25:30–28:30 | 15:55:30–15:58:30 | 3 min | Prepared ingest walkthrough: PANGAEA source → private collection → agent prompt. Use Copy ingest prompt if useful. Explain that the ingest ran beforehand; show the method without waiting for another upload. |
| 15 · Inspect, explore and verify | 28:30–35:00 | 15:58:30–16:05 | 6.5 min | Spend about 2 minutes on uploaded metadata, table/files and activity log. Then leave the slide for a **prepared or live ODP-powered map**: show a bounded query/filter, combine layers, explain one result and how to rerun it. See the readiness note below. |
| 16 · Q&A | 35:00–41:00 | 16:05–16:11 | 6 min | Tom brings audience questions. Acknowledge that there has been a lot to absorb. Prioritise practical questions and clarify what was demonstrated versus prepared. |
| 17 · Recap | 41:00–42:00 | 16:11–16:12 | 1 min | Run through the six numbered items without retelling the demos. Express the hope that participants feel more inspired and curious. |
| 18 · Call to action | 42:00–43:00 | 16:12–16:13 | 1 min | Register on ODP and start a small experiment. Agents can add a new “superpower” to the team. Be precise, stay involved and retain human/domain expertise. Thank the audience and Tom. |
| Buffer / close | 43:00–45:00 | 16:13–16:15 | 2 min | Absorb delays. If unused, take one final question or repeat the ODP link. End by 16:15. |

## Demo 2 readiness: the remaining presentation gap

The current deck shows discovery and ingest with screenshots. Slide 15 shows the ingested dataset; it does not itself demonstrate the promised query/filter → analysis → interactive map → verification/reproduction sequence.

The 6.5-minute slot on slide 15 reserves time to open a separate working ODP-powered map. Before the webinar, select its URL or local file, the exact filters to demonstrate, one result to check and the saved inputs/code needed to repeat it. Prepare screenshots or a short recording of the same sequence. If that demonstration is not ready, describe the session honestly as discovery and ingest; do not claim that the slides alone fulfil the invitation’s analysis and interactive-map promises.

Suggested split within slide 15:

| Time within slot | Action |
|---|---|
| 00:00–02:00 | Inspect the ingested dataset: metadata, rows, files and activity log. |
| 02:00–04:30 | Open the ODP-powered map. Show the study area, a query/filter and selected layers. Explain one bounded calculation or result. |
| 04:30–06:00 | Check one result against source data. Show dataset IDs, filters, saved inputs and code/parameters needed to rerun it. |
| 06:00–06:30 | State the limits of interpretation and transition to Q&A. |

## Live-demo cues and fallback rules

| Slide | Tool / material | Stop rule and fallback |
|---|---|---|
| 6 | Claude Code or Codex; local ingest SKILL.md | One instruction change only. If switching tools is awkward, use the readable excerpt on the slide. |
| 8 | `outputs/demo-1/prototype-1.html` and `prototype-2.html` | Open tabs beforehand. If an API is slow or unavailable, show saved evidence and the audits rather than waiting. |
| 13 | Claude Code; discovery prompt on slide 12 | Start from a prepared session. If results are not ready within about 45 seconds, use Prompt 1 and Prompt 2 screenshots and explain the completed run. Do not add counts, aggregates or bulk downloads. |
| 14 | PANGAEA source, private ODP collection and prepared ingest screenshots | Say: “I ran the ingest beforehand to save us some waiting.” Avoid duplicate uploads. |
| 15 | Ingested dataset and selected ODP-powered map | Use a prepared working result if live queries are slow. Explain exactly which parts were prepared and which are live. |

## Presenter messages to retain

### Opening and questions

“Please ask questions as we go. Tom will help collect them. We’ll take one short pause after Skills and a longer Q&A after the demonstrations.”

### Skills

“In its simplest form, a Skill is a Markdown file describing when and how to do a task. Ask your agent to help write it, read it, change it and improve it through use.”

The Skill describes the method; tools, credentials and permissions enable execution. Claude and Codex share the broad approach, while setup and available tools vary. Use [the Skills collection](https://github.com/joevstaas/awesome-claude-skills) for inspiration and adapt the instructions to your workflow.

### Software engineering, slide 5

“I used to rely on architects, UX designers, developers and testers for different perspectives. I now also assign those roles to tailored agents. They make more iteration practical, but I still define the task and assess the result. Engineering experience helps; it is not a prerequisite for getting started.”

Agents do not get tired in the human sense, but remain subject to errors, context and infrastructure limits. Agent review is not automatically independent validation.

### Demo 1

Jo confirmed that both experiments used the same prompt. Their model and tool configurations have not been established as identical. The audits inspect saved code, not archived original API responses.

| Difference | Prototype 1 | Prototype 2 |
|---|---|---|
| Observation search window | Longitude −92.8 to −87.5; latitude −2.5 to 2.1 | Longitude −93 to −88; latitude −2 to 2 |
| Boundary source | Hosted WDPA/WDOECM service | Separate hosted Galápagos and Hermandad layers |
| Default OBIS request limit | Up to 1,500 records | Up to 1,000 records |
| Pagination / preserved source responses | Neither | Neither |

The point is variation in agent decisions. Authoritative data outside ODP can also support reproducible work. Avoid “Without ODP, retrieval is nondeterministic.” Say: **“Without explicit data choices, the agent has room to define the analysis.”**

### ODP and scientific interpretation

ODP provides a shared data foundation, context and a consistent access approach. Operations still vary by data type. Provenance identifies where data came from; lineage records how it was transformed. Show concrete evidence rather than implying that every transformation is automatically recorded.

Metadata bounding-box overlap identifies candidates; it does not prove local records or suitability. One intersecting record establishes presence only. Observations do not establish absence, migration routes or conservation effectiveness. Apparent fishing effort is model-derived AIS evidence, not proof of illegal fishing. Protection rules, zoning and permits require interpretation.

Keep Galápagos as the core geography. Cocos is a possible future extension requiring additional evidence, including tracking data for movement questions.

### Ingest context

Source: Moity (2018), [PANGAEA DOI 10.1594/PANGAEA.886891](https://doi.org/10.1594/PANGAEA.886891), historical no-take zones from Zoning Plan 2000, CC BY-SA 3.0. The example has 60 polygons. It is a research interpretation, not current legally authoritative boundaries. Keep it separate from current protection layers.

Show the source, original archive, geometry preparation, column descriptions, licence, provenance and read-back checks. An activity log supports traceability but is not by itself a complete scientific lineage record. Reproducibility needs identifiable saved inputs, filters, code, parameters and relevant software versions.

## GitHub and Vercel: optional follow-up

There is no dedicated GitHub/Vercel slide in the current 18-slide deck, so the former four-minute deployment demo is removed from the main running order. Do not add it on top of this 45-minute plan. If asked, give a brief analogy: GitHub holds the project recipe and change log; Vercel builds and serves the web app. Offer deeper treatment as a follow-up.

## Timekeeping and preparation

Tom monitors the clock and collects questions. Agree on quiet cues for 30 seconds remaining and moving on.

Key checkpoints: start Demo 1 by **15:43:30**, Demo 2 by **15:50**, finish demonstrations by **16:05**, start the recap by **16:11**, and finish the planned close by **16:13**.

If behind schedule, shorten Karpathy and the tools overview, use prepared discovery/ingest results, and avoid opening every audit or metadata field. Use the two-minute buffer first; protect at least five minutes of Q&A. Do not wait on long agent runs, repeat an ingest, or introduce a deployment demo.

Before going live:

- Open the deck, both Demo 1 prototypes, Claude Code, the Skill, ODP collection and final map in advance.
- Rehearse the map query, one verified result and the reproduction evidence for slide 15.
- Check screenshot enlargement, Live demo reminders, copy buttons and external links.
- Confirm ODP access and keep credentials hidden while screen sharing.
- Have screenshots or a short recording ready for slow or unavailable services.
- Rehearse to the checkpoints, including the two Q&A pauses and final call to action.
