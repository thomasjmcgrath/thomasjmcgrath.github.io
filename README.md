# Hippo World Tour

Version 1.5.0. An educational travel website for Thomas McGrath. Famous hippos, thoughtful trip planning and an entirely reasonable level of enthusiasm.

Find your fictional hippo archetype at `/quiz`: twelve interactive prompts, saved progress, detailed traits, personal runners-up, friend comparisons and a downloadable card. See `docs/QUIZ.md`.

The photo update adds identified archive images for Fritz, Poppy, Maple, Haggis and Toni. All seven directory cards and profiles now have individual image descriptions and visible source credits. See `docs/MEDIA_CREDITS.md` for provenance and licences.

## GitHub hosting

Use [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) for GitHub Actions deployment to Cloudflare Workers. The package includes automated tests, a manual full-site deployment and an authorized daily data refresh. GitHub Pages alone cannot run the backend. Live provider data still needs your own authorized connections.

## Run locally

Use Node.js 24 LTS on Windows PowerShell, macOS or Linux. In this folder:

```sh
npx pnpm@11.25.0 install --frozen-lockfile
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_wealthy_nitro.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_organic_ricochet.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_live_data.sql
npm run dev
```

Open the URL printed by the server, normally http://localhost:5173. Apply all three migrations in order once to a new database. On an existing version 1.2 or 1.3 database, apply only 0002_live_data.sql. On version 1.1, apply 0001 and 0002. Do not replay migrations already applied. Development and built previews share `.wrangler/state`.

The exported ZIP contains no Site ID or credentials. A clean clone uses the portable execution profile. `npm run install:ci` is the managed Linux installer and needs Bash. Use `npx pnpm` above on Windows.

```sh
npm test
npm run typecheck
npm run build
npm start
```

`npm start` serves the built Worker locally. This is a server app, not an index.html to double-click. The planner exports JSON, a calendar and a print view suitable for saving as PDF.

## Included

- Seven sourced animal profiles across six venues, including current homes and relocation history.
- Search and filters, persistent browser wishlist, route ordering, shared-venue merging and minimum-duration checks.
- Explicit budget allowances with group and per-person totals, rooms and transfer costs.
- JSON import/export, calendar export, trip-pitch copy and print styling.
- Real first-party event collection in D1, deduplication, completed-day comparisons and honest empty states.
- Date-specific external flight searches, airport references, time zones and official visitor/travel-advice links.
- A roughly 6,350-word original field guide in 12 chapters, with research references.
- Protected editorial tools and a hosted MCP maintenance writer for public-source checks, licensed interest imports and retention cleanup.

## Production connections

**In-app airfare and external search-interest feeds are not connected initially.** Integration code is present and has isolated fixture tests, but production provider access and coverage have not been verified. No test fare or invented global ranking appears as real data. External date-specific flight searches work independently.

Set runtime variables using your hosting platform. For local testing use an ignored `.dev.vars` file. Never put secrets in browser code or Git.

| Variable | Purpose |
| --- | --- |
| `HIPPO_SKYSCANNER_API_KEY` | Approved Skyscanner production Flights Live Prices API access. |
| `HIPPO_TRENDS_FEED_URL` | Authorized HTTPS normalization feed. See `docs/INTEREST_FEED.md`. |
| `HIPPO_TRENDS_FEED_TOKEN` | Optional server-to-server bearer token for that feed. |
| `HIPPO_ADMIN_USER_ID` | Exact site-scoped ChatGPT user ID allowed to edit visitor guidance. |

Skyscanner commercial access and Google Trends API access require provider approval. Use only data and credentials you are authorized to use. Trends represent relative search interest, not exact search totals.

## Owner setup

Visit `/admin` while signed in. Before configuration it displays your own trusted site-scoped user ID. Set `HIPPO_ADMIN_USER_ID` to that ID through hosting environment controls, then reload. There is no public role-claim endpoint. Other accounts cannot edit guidance.

Portable local development can sign in at `/signin-with-chatgpt?return_to=/admin` as the starter mock `local_seedy` user. Set `HIPPO_ADMIN_USER_ID=local_seedy` in your ignored local `.dev.vars` only. Production identity headers come from hosting. An independently hosted deployment needs a trusted identity proxy that strips untrusted inbound identity headers.

The owner can review changed-source flags and explicitly override viewing status and guidance with a supporting source URL. Retrieval never automatically declares an animal visible or promises a sighting. If status updates cannot be read, the catalogue falls back to a recheck warning.

## Maintenance and data

`/mcp` exposes `get_hippo_catalog`, `get_hippo_source_status` and `refresh_hippo_sources`. Public-source checks use a fixed allowlist, up to three concurrent requests, 12-second timeouts, no redirects and a 4 MB cap per page. Successful retrievals are cached for 12 hours. Failed attempts have a one-minute retry delay. The writer also imports a configured authorized interest feed and prunes expired records. A direct service endpoint, `POST /api/maintenance`, performs the same work and supports `GET` read-back. It relies on this Site remaining owner-private. Add separate service authorization before any future public launch. See `docs/MAINTENANCE.md`.

A retrieval date means a page was fetched, not that public viewing was reconfirmed. Successful timestamps survive failures. Changed text stays flagged until an owner reviews it. A daily cloud task is needed for unattended updating. Check the deployment handoff for whether a schedule was actually created.

Analytics use a rotating random browser token, a known animal ID, a metric and server timestamp. Tokens are hashed in the backend. Raw queries, travel dates, airports, names and email addresses are not stored in analytics. Known bots are excluded, but anonymous statistics are not verified unique-person counts. Visitors can opt out at `/about#privacy`.

Rankings use 7, 30 or 90 completed UTC days, with today separate. Percentage changes require a previous count and at least five current events. First-party activity and imported relative interest are separate. Production traffic is not seeded. Successful maintenance removes raw events older than 14 days, aggregates older than 200 days and expired flight sessions.

## Source map

| Path | Purpose |
| --- | --- |
| `app/` | Pages and server APIs |
| `components/` | Directory, planner, flights, charts, owner tools |
| `lib/catalog.ts` | Animals, venues and source register |
| `lib/quiz.ts`, `lib/quiz-card.ts` | Fictional personality matching and browser-only card export |
| `lib/planner.ts` | Input validation, itinerary, costs and calendar |
| `lib/server.ts` | Database, analytics, authorization, public-source checks |
| `providers/` | Live-flight normalization and licensed-feed validation |
| `db/schema.ts`, `drizzle/` | D1 schema and migrations |
| `content/field-guide.md` | Editable long-form guide |
| `content/chapters.json` | Compiled guide used by the page |
| `tests/` | Logic and regression checks |
| `public/`, `licenses/` | Local assets and font licences |

After editing the guide run `python scripts/compile-guide.py`. The cloud Worker uses the maintained Sites Vinext starter. Preserve `sites()` in `vite.config.ts` and the Worker entrypoint. Sites applies D1 migrations at publication. Standalone Cloudflare hosting needs your own database IDs and identity configuration. The export includes no account provisioning.

## Content limits

Initial editorial review: November 5, 2026. Haggis moved to Wingham in Kent and public viewing is unconfirmed. Toni moved to Mulhouse. Archive photographs have dates and credits. The hero is original AI-generated generic hippo art. Other icons are labelled. See `docs/MEDIA_CREDITS.md` and `/about`.

Transfer days are planning buffers, not verified timetables. Airport references are starting points, not promised routes. Costs are visitor-entered allowances. Changing currency changes labels, not numbers. This release does not include weather forecasts, live ticket inventory, currency conversion or booking checkout. The site starts private to its owner.


## Version 1.1

The new `/map` atlas uses locally served Natural Earth land geometry. Zoom/pan, region and wishlist filters, accessible venue selectors and current viewing notes require no paid mapping service or third-party tiles. The directory supports List/Map views. The planner maps the order of selected venues with schematic lines, not verified transport routes.

Each itinerary day supports a custom title and up to 1,000 characters of notes. Move free days among the required visits and transfers. Arrival, departure and travel sequence remain enforced. Moved free days use the city reached at that point in the trip. Notes follow stable activity IDs and are included in calendar, JSON, text and print exports. Version-one JSON remains compatible. Maximum import size is 150 KB. Changing dates/stops resets the day order, retaining notes for matching activities. Additional paid activities in notes require their own budget allowance.

Source monitoring now uses a bounded 4 MB reader to accommodate Cincinnati's 1.8 MB page, rejects block pages and checks expected animal text. Moo Deng is monitored through the official TAT STAR venue profile. The original government citation and historical check rows are retained. Source/extractor changes establish a new baseline without clearing pending review flags. A retrieval is not a new viewing confirmation.

The hosted catalog tool exposes only the caller's own site-scoped ID and owner-access status. It does not grant roles. Owner activation uses the explicit HIPPO_ADMIN_USER_ID runtime allowlist. This ZIP includes no configured owner ID or credentials.

## Version 1.2 additions

- The Bloat Bulletin at `/news`: source-dated stories about the seven featured hippos, original summaries for curated stories, official/reporting labels, archive badges, animal/topic/search filters and a trip-wishlist filter.
- Saved stories and a new-since-last-visit marker, stored only in the current browser.
- Public news publisher checks reuse the existing maintenance endpoint and linked daily automation. RSS headlines are attributed without copying article bodies. Changed automated headlines retain their previous payload pending owner approval. Failed retrievals preserve last-success timestamps and stored articles.
- Owner news controls can refresh indexes, hide or restore stories and approve changed headlines. They require the existing authenticated owner.
- Destination comparison at `/compare`, using the existing visitor registry and current owner overrides. No fare, availability or route claims are generated.
- A per-trip planning checklist with user timestamps. JSON export version 3 carries it, while earlier trip files continue to import. Changing the journey clears checklist marks. A tick is a personal record, not a booking or sighting confirmation.

Read `docs/NEWS.md` for source coverage and `docs/VALIDATION_1_2.md` for validation limits. News does not change animal homes or visitor guidance. External search interest still enters only through the configured authorized feed.

## Version 1.3 additions

- `/passport` is a personal visit and watch log. Seen-in-person stamps are awarded only for self-reported successful visits. Missed sightings and watched videos remain separate. Historical places are editable rather than inferred from the current animal home. Logs stay in browser storage and can be backed up, merged, edited, printed and removed with undo. They never enter shared analytics or the animal registry.
- Passport JSON has its own `hippo-world-tour-passport` format, version 1. It is separate from the planner’s version 3 export. Inputs are bounded to 250 records, 120-character places and 1,200-character notes. Conflicting duplicate IDs abort import instead of overwriting records. Malformed stored data pauses editing and offers a raw recovery download. Storage failures are visible.
- `/birthdays` shows sourced birth-date anniversaries for the next 365 days or a selected year, optionally filtered to the trip wishlist. Ages are calculated for each anniversary, with a downloadable ICS and copied text. These are not zoo event announcements.
- `/watch` provides two current official camera options, official update links for the rest of the cast, provider access notes and live local zoo clocks. A current Poppy camera link could not be confirmed and is labelled accordingly. No video player is embedded and no subscription price is copied.
- The news bulletin also includes Toronto Zoo’s October 28, 2026 Maple/house-hippo media-literacy story, checked against the original official release.
- `GET /api/milestones` supplies the same bounded anniversary calculations for a date window. It accepts `from`, `through` and optional comma-separated `hippos` IDs.

There are no new dependencies, schema migrations, credentials, sharing changes or new scheduled tasks in version 1.3. Read docs/COMPANION_FEATURES.md and docs/VALIDATION_1_3.md.

## Version 1.4 connections and GitHub deployment

Flight searches now keep the original route, currency and traveller count in the server-held search session. Polling from a different browser session, altered query or expired search is rejected. Provider errors stay separate from valid empty results.

Authorized interest imports now store an atomic snapshot with its source URL, methodology, data date and last-success timestamp. Failed imports preserve the previous data. The chart labels stale snapshots, missing animals, tied ranks and insufficient comparisons. Existing legacy interest rows remain readable.

The GitHub package includes CI, manual Cloudflare deployment, a daily data-refresh workflow, a local environment example and a live connection checker. Public standalone hosting requires its maintenance secret and disables the private Sites owner tools. The current private Site keeps its existing owner access and automation. See docs/GITHUB_SETUP.md and docs/VALIDATION_1_4.md.

## Version 1.5 personality quiz

- `/quiz` has ten multiple-choice prompts and two sliders. Keyboard controls, a progress bar, a question map, previous/skip controls and an editable review support a comfortable pace. At least eight answers are needed for a result.
- All seven featured hippos have a fictional archetype with a story, strengths, a chaos clause and an ideal day. Results include a five-axis trait chart, an archetype overlay, personal runners-up and a friend comparison.
- Quiz drafts and answers stay in the current browser. Share links carry only a known hippo ID and quiz version. Shared archetypes do not disclose personal scores or answers. A PNG card includes the named archive image and its credit.
- Real animal profiles, venue restrictions and planner eligibility still come from the existing catalog and visitor-status system. The quiz does not generate popularity data or automatically change visiting guidance.
- The GitHub deployment workflow omits optional provider secrets when they are not configured. Maintenance authorization remains required for standalone hosting.

This is an entertainment quiz with authored archetypes, not a scientific assessment or a measured description of animal behaviour. No new dependencies, migrations, credentials or scheduled tasks are needed. Read `docs/QUIZ.md` and `docs/VALIDATION_1_5.md`.
