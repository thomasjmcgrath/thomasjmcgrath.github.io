# GitHub Pages release validation

Version 1.6.0, November 6, 2026 (Pacific time).

## Completed checks

- 117 tests passed: 103 existing browser/logic checks and 14 checks for local statistics, static routes, news retention and generated-file publication. The older live-backend connection tests remain in source but are not part of this static edition's test command.
- TypeScript passed for the browser application, Vite configuration and scheduled news script.
- The production static build passed. It contains twenty direct page entry files and 36 static files in total, including the 404 fallback.
- The browser bundle was checked for application-server endpoints and Cloudflare Worker imports. None were present. No server build output is published.
- The temporary phone QA page was removed before the final build.
- The animal, venue, source and image register matches the previous version byte for byte. No animal homes or viewing guidance were automatically rewritten.

## Browser verification

- Home page, news, planner, statistics, Haggis profile, map, destination comparison, field guide, passport, birthdays, watch hub and quiz rendered without an application backend.
- News filtering, saving a story and viewing saved stories worked.
- Return and one-way flight searches retained the selected airport codes, dates and traveller count in their external provider URLs. No real provider checkout or fare purchase was attempted.
- The local statistics view recorded a prepared flight search, deduplicated it in the current session and kept today's total separate. Demo counts were labelled as sample data.
- All twelve quiz prompts were completed. Resume recovered progress after a preview reload. The expected Fritz result, trait score and friend comparison rendered.
- A result card downloaded as a valid PNG, 1080 × 1400 pixels.
- The quiz result was inspected at a 390-pixel phone viewport. Its content width was 375 pixels after the scrollbar, with no horizontal overflow.
- Haggis retained the disabled trip control and unconfirmed public-viewing note.

## News retrieval

A real refresh retrieved the Cincinnati, Metro Richmond, Toronto, Wingham and Mulhouse indexes. It retained thirteen stories, including four newly matched Metro Richmond archive headlines. Zero changed automated headlines required review during this run.

Thai PBS returned a blocked page. Its retained editorial stories remain available, and the failed retrieval is recorded separately. No page was bypassed and no failure was converted into a successful retrieval. News publication dates remain their original source dates.

The daily GitHub workflow is responsible for later retrievals and publication. Its actual run status must be checked in Actions. This release does not claim verified live flight inventory, shared visitor analytics or measured global search rankings.

## Hosting

The existing repository used branch-based Pages publishing from its root. This release keeps that method and includes prebuilt website files. The connected GitHub account and repository administrator/write access were verified. DNS records are not changed by this release.

Production publication is verified through the resulting Pages deployment and the live page. A local build or a successful test job alone is not proof that the website is live.
