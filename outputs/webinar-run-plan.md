# Webinar Run Plan: Agentic AI and Ocean Data

**Presenter:** Jo Øvstaas, HUB Ocean  
**Co-host:** Tom Redd  
**Date:** Thursday 22 October 2026  
**Time:** 15:30–16:15 CEST (Norwegian local time)  
**Invitation title:** Webinar | Ocean Data Platform: Working with AI-agents  
**Duration:** 45 minutes  
**Audience:** Researchers, analysts, developers, and practitioners interested in combining ocean data with AI tools  
**Timing:** 38 minutes of content, 5 minutes of planned questions, and 2 minutes of buffer

## Purpose

Show how AI agents and reusable Skills can help people discover, query, filter, analyse, and visualise real ocean data through the Ocean Data Platform (ODP). Demonstrate how to check results and build reproducible workflows, then take a prototype through to a deployed application.

The story moves from an impressive result to an understandable, traceable body of evidence.

## Running Order

| Time | Duration | Segment | Presenter actions and key messages |
|---|---:|---|---|
| 00:00–03:00 | 3 min | Personal opening | Explain your connection to the ocean, your curiosity about AI, and why you are exploring these tools. Set the promise: follow a question through to a working application using real ocean data. |
| 03:00–06:00 | 3 min | Karpathy and the shift towards delegated work | Use the selected Karpathy posts to introduce the move from asking AI questions to delegating work. Connect this to your own experience. Exact posts and references still need to be selected. |
| 06:00–09:00 | 3 min | Three working definitions | Explain AI chatbot, AI agent, and agentic workflow using one ocean-data example. Acknowledge that terminology varies. Chat is an interface, so an agent can also operate through a chat. |
| 09:00–11:00 | 2 min | Your tools and your AI team | Briefly introduce Codex, Claude Code and Microsoft 365 Copilot, then explain how you delegate architecture, UX, implementation and testing to tailored agents. Prior software-engineering experience helps you direct and assess the work, but is not a prerequisite for getting started. |
| 11:00–14:00 | 3 min | Skills made simple | Open a readable SKILL.md example from your collection. Show its name, description, and instructions. Change one sentence. Explain that AI can help write the file and that more advanced Skills can include scripts and reference materials. |
| 14:00–15:00 | 1 min | Questions: concepts and Skills | Take one short clarification. Hold broader discussion for the final Q&A. |
| 15:00–20:00 | 5 min | Demo 1: From an open prompt to an impressive result | Compare the two independently generated Galápagos prototypes. Show how the agents chose different study areas, boundary sources, and OBIS retrieval limits. Reveal that filters act only on the retrieved subset and that neither prototype archives the source data. End with: “It looks cool, but can we trust it?” |
| 20:00–22:00 | 2 min | The conservation question | Introduce Galápagos as the main case and the connection to 30x30. Explain the question the data can support. Distinguish species observations from evidence of migration routes. |
| 22:00–32:00 | 10 min | Demo 2: From a question to evidence | Use an ODP Skill to discover relevant datasets, retrieve and filter data, run a bounded analysis, and present an interactive map. Reveal the sources and method, check one result, and explain how to repeat the analysis. |
| 32:00–33:00 | 1 min | Questions: data and analysis | Take one short clarification about the data or interpretation. |
| 33:00–37:00 | 4 min | From prototype to deployed application | Follow one small map change through GitHub and Vercel: branch → commit → pull request → preview → production. Briefly show the repository connection and environment-variable settings. |
| 37:00–38:00 | 1 min | Takeaways | If ready, show a second prototype built with real ODP data for 20–30 seconds. Close with three ideas: delegate work, make evidence visible, and retain scientific judgement. |
| 38:00–43:00 | 5 min | Questions and discussion | Address broader questions and connect answers to the examples demonstrated. |
| 43:00–45:00 | 2 min | Buffer and close | Absorb delays. If on schedule, take more questions and share links to Skills and examples. |

## Opening Audience Cue

“Please ask questions as we go. I’ll pause for a couple of short clarifications during the session, and we’ll keep the broader discussion for the end.”

## Working Definitions

- **AI chatbot:** You ask questions, receive responses, and drive the next steps.
- **AI agent:** You give a goal, and the system can choose and execute steps using tools, inspect results, and adapt within agreed boundaries.
- **Agentic workflow:** A process combining agent-driven steps with fixed calculations, tools, and human checkpoints. It can involve one or more agents.

These are working definitions for the webinar. A fixed sequence containing an LLM is not necessarily agentic; “AI workflow” or “LLM workflow” may be more precise.

## Software Engineering Still Matters

**Placement:** Use the second minute of the tools segment (09:00–11:00) as a bridge to Skills. Spend roughly one minute on favourite tools and one minute on engineering roles. Reinforce the principles during the GitHub/Vercel demonstration rather than adding time to the agenda.

### Personal Story

“In the past, I relied on my team for different perspectives: an architect, UX designers, front-end developers and testers. Today, I also use tailored agents to take on those roles.

They can work around the clock, within the limits of the tools and infrastructure, and they do not get tired in the human sense. That makes it practical to ask for another review, another test, or another iteration.

But the need for good software engineering has not gone away. I still need to define the problem, make design choices and check whether the result is fit for purpose.

Having software-engineering experience is an advantage. It helps you ask better questions and recognise weak solutions. It is not a requirement for getting started. You can ask the agents to explain their choices and help you learn as you build.”

### Roles to Make Concrete

| Agent role | Example assignment for the ocean-data prototype |
|---|---|
| Architecture | Propose how the application, ODP access and data processing should fit together. Explain trade-offs and where credentials belong. |
| UX | Check whether an ocean scientist can understand the filters, partial-data warnings and source information. |
| Front-end implementation | Build the map and controls, including clear loading, empty and error states. |
| Testing and review | Check an independently specified expected result, incomplete retrieval, invalid coordinates and failure of a data service. Review the proposed changes before publication. |

Describe these as assigned roles and review perspectives. A single agent can perform several roles; separate agents are optional and do not automatically provide independent validation.

### Principles to Carry Through the Demos

- Define the intended behaviour and acceptance criteria before accepting generated code.
- Keep data access, calculations and presentation understandable and separable.
- Use version control and review small changes.
- Test against known inputs and expected outputs, including failure cases.
- Protect credentials and distinguish preview from production.
- Preserve the data and method needed to reproduce analytical results.

“Agents do not get tired” does not mean that they are error-free, retain perfect context, or can operate indefinitely without limits. Repeated agent reviews can share the same mistaken assumptions. Retain human responsibility for scientific interpretation and release decisions.

**Bridge to Skills:** “Skills are one way I write down how I want these roles to work, so I do not have to explain the same expectations every time.”

## Skills: Key Explanation

“In its simplest form, a Skill is just a Markdown file: readable instructions telling the agent when and how to do a particular task. You can ask AI to write it for you, read it yourself, and change it as your way of working improves.”

The core file is called `SKILL.md`. Skills in Claude and Codex use this general pattern. More advanced Skills can also include scripts, templates, and reference files.

Make the distinction explicit: the Skill describes the working method; connected tools and permissions enable the agent to access data and execute actions.

Example collection: [joevstaas/awesome-claude-skills](https://github.com/joevstaas/awesome-claude-skills).

## Demo 1: Two Prototypes, Different Data Decisions

**Confirmed by Jo:** Both independent experiments used the same prompt. Present this as “Same prompt. Two independent runs. Different data decisions.” Model and tool configurations have not been established as identical.

**Evidence:** Two saved HTML prototypes and their Markdown audits, located in `the local project folder`.

The comparison is based on static inspection of the saved HTML and audits. Original live API responses and historical map states have not been independently verified. Do not present configured limits as actual retrieved record counts.

### Five-Minute Sequence

| Time within demo | Presenter action | Key message |
|---|---|---|
| 00:00–01:00 | Show the original task and the two prototypes side by side. | The agents produced two plausible interfaces for the same task. |
| 01:00–02:00 | Reveal the different geographic windows and protected-area sources. | The agents made substantive research-design decisions without an agreed specification. |
| 02:00–03:00 | Show the OBIS retrieval limits and a species or year filter. | The filter acts on the downloaded subset, not all matching records in OBIS. Explain this from the code even if live services are unavailable. |
| 03:00–04:00 | Open the audits and show the absence of archived data and validated spatial calculations. | A saved interface does not preserve its original data state; visual overlap is not a coverage calculation. |
| 04:00–05:00 | Summarise the finding and transition to Demo 2. | We need explicit data choices, provenance, and a repeatable method. |

### Observed Differences

| Dimension | Test 1 | Test 2 |
|---|---|---|
| Observation search window | Longitude −92.8 to −87.5; latitude −2.5 to 2.1 | Longitude −93 to −88; latitude −2 to 2 |
| Protected-area source | ArcGIS service named WDPA/WDOECM, May 2026 | Separate hosted ArcGIS layers for Galápagos and Hermandad |
| Default OBIS request limit | Up to 1,500 records; selectable 500 or 3,000 | Up to 1,000 records |
| Pagination | None | None |
| Local filters | Taxonomic class, year, record basis | Scientific name, year range |
| Archived observations and polygons | None in the delivered artifacts | None in the delivered artifacts |
| Validated protection-coverage calculation | None | None |

Both prototypes use OBIS, yet define different data selections. Neither establishes that the retrieved subset is complete or representative. Neither documents independent validation of the legal authority and currency of the boundary geometries.

Both disclose meaningful limitations. No synthetic observations or substitute polygons were found in the saved code. Present these strengths alongside the gaps.

### Suggested Spoken Takeaway

“Same task. Two plausible prototypes. Different study areas, different protected-area sources, and different limits on the observations retrieved.

Both use real-data APIs. Neither preserves the data needed to reconstruct the original result.

The challenge is not just finding real data. It is agreeing on exactly which data, which selection, and which method we are using.”

### Transition to ODP

“In the next demo, we will make those decisions explicit: identified datasets through ODP, a defined study area, documented filters, saved inputs, and a repeatable calculation.”

The evidence demonstrates variation in the agents’ choices, not that identical API requests returned different responses. Authoritative data outside ODP can also support reproducible work. ODP provides the selected foundation for this demonstration; the Skill and analysis must still implement completeness checks, provenance capture, and repeatable processing.

Avoid the claim “Without ODP, data retrieval is nondeterministic.” Use: **“Without explicit data choices, the agent has room to define the analysis.”**

## Demo 2: Ten-Minute Breakdown

| Time within demo | Step | Evidence to show |
|---|---|---|
| 00:00–02:00 | Discover | Ask a natural-language question and show the relevant ODP datasets and why they were selected. |
| 02:00–04:00 | Query and filter | Show a real data retrieval and understandable filters, such as geography, species, and time period. |
| 04:00–07:00 | Analyse and explore | Show a defined calculation and an interactive map with layers, filters, or clickable features. |
| 07:00–10:00 | Verify and reproduce | Open “Show me the evidence”, check one result against the source data, and show how the same saved inputs and analysis can be run again. |

### Proposed Case

Explore how documented species observations overlap with marine protected areas in an explicitly defined Galápagos study area, maintaining continuity with Demo 1. Proposed sources are ProtectedSeas Navigator and OBIS through ODP, subject to confirmation of availability, coverage, and access.

Keep the core demonstration focused on Galápagos observations and protected-area overlap. Choose the final extent, species, period and calculation after inspecting the actual data.

**Possible future extension:** Expand towards Cocos to explore ecological connectivity. This is outside the core demo and would require suitable additional data, including animal-tracking data to investigate movement. Mention it briefly as a next research question if useful.

Do not prescribe the discovery in advance. A useful finding could be an apparent gap, existing coverage, or insufficient evidence.

### Scientific and Reproducibility Messages

- Observations do not alone establish migration routes, absence, habitat importance, or conservation effectiveness.
- Observation density can reflect sampling effort.
- Protection boundaries and permitted activities need to be interpreted together.
- ODP does not automatically make an analysis deterministic or correct.
- Repeatable analytical results require identifiable saved inputs, documented filters, code, parameters, and relevant software versions. Agent wording can still vary.

Closing line for the analysis:

“Our AI agent has helped us understand what we know, what we don’t know, and which additional data we need to make better conservation decisions.”

## GitHub and Vercel: Keep It Concrete

Use the research-project analogy: GitHub holds the project recipe and change log; Vercel builds and runs the application for people to use in a browser.

| Concept | Plain-language explanation |
|---|---|
| Repository | The project folder containing code, method documentation, and change history. Ocean data can remain in ODP. |
| Private / public | Repository contents are restricted to authorised users or readable by everyone. |
| main | The branch used as the shared starting point in this project. |
| Branch | A parallel experiment where a change can be developed without altering main. |
| Commit | A recorded set of changes with a short logbook message. |
| Pull request (PR) | A proposal to bring changes into the shared version, with space for review and discussion. |
| Connect repository | Link the project recipe to Vercel so it can build and deploy the application. |
| Environment variables | Application settings, such as service addresses and access credentials. Keep secret credentials out of the repository and browser code. |
| Preview | A deployed test version with its own link. |
| Production | The published version intended for users. |

For the demonstrated setup, explain that the configured production branch, often main, triggers production deployments. Other working branches can generate previews. A private repository does not by itself make the deployed website private.

Show one small change, such as adding a species filter. Keep the repository connection and required settings configured before the webinar.

## Preparation Checklist

- Confirm the exact Karpathy posts, links, and intended message.
- Finalise the personal opening and the three learning takeaways.
- Select one short, readable Skill and the sentence to modify on screen.
- Confirm actual ODP access, dataset coverage, licences, and metadata.
- Define the study area, species, period, and calculation after inspecting the data.
- Prepare saved data extracts, documented analysis, source references, and one meaningful verification check.
- Prepare both demos with intermediate results and a working final version available.
- Prepare side-by-side screenshots of the two tested prototypes and a compact comparison of their data decisions.
- Keep the original HTML and audits available; distinguish code-inspection findings from verified live retrievals.
- Ensure Demo 2 actually fixes the gaps highlighted in Demo 1: agreed extent and datasets, complete or explicitly bounded extraction, saved inputs, and a verified spatial calculation.
- Prepare a second real-ODP prototype example if available.
- Configure GitHub and Vercel, including preview and production settings.
- Keep credentials hidden during screen sharing.
- Rehearse the complete sequence, including the two short question pauses.

## Timing and Fallback Rules

Demo 2 is the main delivery promised in the invitation. Preserve its full question → discovery → query/filter → analysis → interactive map → verification → reproduction sequence.

If running late:

1. Shorten the Karpathy discussion.
2. Shorten the favourite-tools overview.
3. Skip the optional second prototype.
4. Use prepared intermediate or final demo results rather than waiting for a long agent run or deployment.

Protect at least five minutes for the final Q&A. If the short question pauses are unused, continue and retain the time as buffer.
