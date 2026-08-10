# Black Land Loss (BLL) — SvelteKit Rewrite Brief
 
## Project Overview
A new SvelteKit site, built from scratch (not a port of the existing React/Flask app), visualizing historical Black land loss across U.S. states and counties, 1920–1997. The goal is a static, backend-free site that computes land-loss and value-change figures from a shipped dataset and presents them through an EPI Minimum Wage Tracker–style interactive grid, built for a general audience — from researchers who want to dig into the numbers to people encountering this data for the first time.
 
## Core Goal
Two things have to both be true:
1. **The math has to be right.** Land-loss percentage and value-per-acre change, computed correctly for whatever year range the user selects, matching the logic in the current Flask backend (see "Ported Calculation Logic" below).
2. **The visual has to make the research legible.** Someone with no background in the dataset should be able to look at the grid, click a state, and understand what happened there — not just see a number.
## Reference Design: EPI Minimum Wage Tracker
Adopt the interaction pattern, not the visual identity:
- **Cartogram grid, not a geographic map.** Every state is an equal-sized square tile, arranged in a rough approximation of its real position.
- **Color intensity encodes the data value itself** — land-loss percentage or value-per-acre change, not just "has data" vs. "no data."
- **Gray tiles = state not in the dataset.**
- **Right-side detail panel**, populated on tile click: headline number, supporting facts, notes.
- **Legend** showing the color scale's range and what gray means.
- **(Later)** Toggle tabs to switch which metric colors the grid.
- **(Later)** Filter row — e.g., "land loss greater than X%."
## Stack
- **SvelteKit**, file-based routing, static adapter (`@sveltejs/adapter-static`) — no backend, no server-rendered routes.
- Same four pages as before: Home, About, FAQ, Contact.
- Deployment target is likely Cloudflare Pages, but the build should stay host-agnostic (plain static output) until that's decided for real.
## Data Pipeline
- **Source of truth:** `dvf_bll_bld_001_v01.csv` (confirm if other files feed the numbers).
- **Export process:** a one-time (rerun-as-needed) script that reads the CSV and writes static JSON into the SvelteKit project. Not part of the build step — run manually, commit the output. If the CSV changes, rerun the script and commit the new JSON as a visible diff.
- **JSON shape:** raw, filtered rows — not precomputed percentages. Precomputing every valid year-pair × state × county combination was considered and rejected: 17 years gives 136 possible start/end pairs, multiplied across ~17 states and their counties, which is unnecessary bulk for a computation this cheap to do in the browser.
  - One JSON array of records: `{ state, name, county, year, liftot, valtot, valavg }`, filtered to drop unused rows.
  - A separate `states.json` for the state/county picklist structure (state_code, state_name, sorted county list) — this is static once generated and doesn't need recomputing on every page load.
- **Missing data:** use `null`, not the `-1` sentinel the Flask version used to dodge NaN-in-JSON — handle `null`/zero checks explicitly in the calculation code instead.
## Ported Calculation Logic (must match current backend behavior)
Source: current `get-state-data` / `get-county-data` Flask routes.
- Land-loss percentage: `((land_year2 − land_year1) / land_year1) × 100`, using the `liftot` column, filtered to the matching year + name (+ `county == 0` for state-level, or matching `state` for county-level).
- Value per acre: `valtot / liftot` for each year, guarding against `liftot` being zero or missing (invalid → don't divide, return `null`/`N/A` for that year).
- If either year's `liftot` is missing or zero, the percentage itself is `N/A`, not a computed value.
- All computation happens **client-side**, triggered by slider/dropdown changes, not fetched from a server.
### New requirement: nominal vs. inflation-adjusted value
The current Flask backend only returns **nominal** value (the raw dollar figure for that year). The rewrite needs to show **both**:
- **Value at that time** — the nominal figure, as today.
- **Value in today's dollars** — the same figure converted using an inflation index, so a 1920 value and a 1997 value are actually comparable to a present-day reader.
This is new scope, not a port — the old backend has no inflation-adjustment logic anywhere. It requires:
- An inflation index/CPI table spanning 1920–1997 (and up to the present, to convert to "today's dollars"). **Source not yet confirmed — see Open Questions.**
- A decision on where that index lives: baked into the JSON export (each year record carries its CPI multiplier) vs. a separate small lookup table loaded alongside the main dataset. Likely the latter, since a year→CPI-factor table is tiny and reusable across every state/county calculation rather than duplicated per row.
- The detail panel design needs a slot for both figures, not just one headline value — worth deciding whether "today's dollars" is the primary headline (more meaningful to a general-audience reader) with nominal shown as secondary context, or vice versa.
## What to Preserve
- **Dark theme with orange accent as the starting point** — open to revisiting the palette and typography as part of this rewrite, but keep it intentional rather than defaulting to framework boilerplate. (See `frontend-design` guidance for how to do this well.)
- **The year-range dual slider (1920–1997)** — this is BLL's core differentiator from EPI's point-in-time tool. Keep it front and center near the grid.
## Component Structure (initial pass, expect to adjust once building)
- Grid + tile + legend, likely collapsed into fewer files than the old React version since Svelte's scoped styles remove the reason to keep CSS separate per component.
- Detail panel.
- Shared selection state (selected state, county, year range) — likely a Svelte store rather than prop-drilled, since SvelteKit's page structure doesn't lend itself to the old "lift state to HomePage" pattern.
## Audience Considerations
General audience, spanning researchers to first-time visitors. This means:
- The detail panel and About page should carry real explanatory content — what the numbers mean, where they come from — not just raw figures.
- Consider whether the Home page grid itself needs a short framing sentence or tooltip for someone with zero context on Black land loss as a topic, versus assuming prior knowledge.
- FAQ and About pages get real copy as part of this rewrite, not placeholder text carried over from the old site.
## Open Questions / Decisions Still Needed
- **Inflation index source for nominal-vs-today's-dollars conversion** — which CPI/inflation series, and does it need to handle methodology differences across the 1920–1997 span.
- Confirm `dvf_bll_bld_001_v01.csv` is the only data source.
- Final color palette and typography — open for reconsideration, to be decided during design work rather than locked in this brief.
- Whether the toggle-tab and filter-row features move from "later" to core scope once the base grid is working.
- Deployment target — Cloudflare Pages is likely but not committed.