# Maintenance and read-back

The fixed source allowlist is in `lib/server.ts`, the registry is in `lib/catalog.ts`, and optional authorized feed configuration uses runtime variables. There are no credentials here.

1. Use the published Site's supported hosted MCP cloud connection.
2. Call `refresh_hippo_sources` with empty arguments. It fetches allowlisted public sources, records attempts/successes, detects text changes, imports a configured authorized feed and prunes expired data.
3. Call `get_hippo_source_status`. Verify persisted attempt timestamps correspond to the run, or report that a recent check was reused. Report unavailable sources and pending review flags. Preserve successful timestamps on failures.
4. For a configured interest feed, verify its persisted snapshot date and import time. Unconnected, unavailable and measured zero are different states.

The writer updates this Site only. It needs Site service access but no signed-in visitor or personal app. The owner `/api/admin` endpoint is separate. Never spoof visitor identity for unattended access.

Use a linked daily cloud task in the owner's timezone. Check the Site's linked automations before creating one. If cloud access or duplicate-check metadata is unavailable, do not claim a schedule is active. The owner button remains available after allowlist setup.

Transient failures are recorded for the next eligible run. Do not repeatedly hammer blocked sources. Changes need editorial review. Verify the animal's current home and public access directly before replacing guidance. Routine data refreshes do not need republishing.

## Verified service path

A cloud task can read `get_site` for the selected project and use its returned `siwc_bypass_bearer_token`, when present, only as `OAI-Sites-Authorization: Bearer <token>` to that same Site. Never log, save or embed the token in a prompt. If it is unavailable, use a connected Site MCP tool or report the access failure. Do not create or rotate a token to work around missing access.

The direct shared writer is `POST /api/maintenance` with `{}`. Read back `GET /api/maintenance`. It runs the same source checks and licensed-feed import as the MCP tool. The current deployment is owner-private and relies on that Sites access boundary. This path has no access to visitor-owned records or editorial override actions. Before a future public deployment, add separate service authorization. Do not make the site public merely to let a task run.

Active monitors are declared in lib/source-monitor.ts. The archived moodeng-gov citation is retained. The new moodeng-visitor monitor uses the TAT STAR venue profile. Bodies are limited to 4 MB. Historical check rows and previous successful retrievals survive failures.

## News upkeep in version 1.2

The same empty-argument refresh also checks the six public news publisher indexes in lib/news.ts. Read back the `news` field and its feed attempt/success timestamps. Report unavailable publishers, failed article metadata and changed headlines waiting for review. Stored stories and last successful retrievals must survive failures. Do not convert news into current viewing guidance. See NEWS.md.
