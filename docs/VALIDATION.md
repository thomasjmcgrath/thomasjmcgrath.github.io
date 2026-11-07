# Release validation — November 6, 2026

- 27 logic and regression tests passed with Node 24.
- Strict TypeScript checking passed.
- Production Vinext build passed with all pages, APIs and MCP route included.
- Browser-verified desktop home, directory search, Haggis profile, statistics, field guide and planner.
- Browser-verified persistence across full navigations, shared-venue merging, three-adult room/budget recalculation, and short-route blocking. Calendar and trip-pitch controls disable when the route is invalid.
- Browser-verified the unconnected airfare response and date-specific external flight links. No provider quotes were manufactured.
- Browser-verified real first-party search persistence: one qualifying search event appeared in today's partial total after selecting Haggis from a directory query. Completed-day ranking stayed empty and labelled honestly. Local QA data are not included in publication.
- Browser-verified a JSON download containing all selected animals, dates, travellers and cost assumptions. Import validation has automated coverage. A second browser download event for the calendar was not captured by the browser automation, so calendar download completion was not independently verified. Calendar serialization, date boundaries, escaping and line folding passed automated tests.
- Phone layouts checked in a 390px frame, with a 375px content viewport after scrollbar. Home, planner and field guide had no horizontal document overflow or clipped heading/paragraph text. Mobile navigation opened and navigated successfully. All 12 field-guide chapters rendered.
- Production live airfare, provider coverage and an authorized external-interest feed could not be tested without production provider access. Empty connection states were verified instead.
- Owner editing requires the explicit site-scoped allowlist variable. This release does not automatically grant the first visitor an owner role.

Hosted verification identified and corrected an unsupported Cloudflare redirect mode in source retrieval. Requests now use manual redirect handling, preserving the no-redirect policy. Failed source checks have a bounded retry delay. Final deployment and unattended maintenance verification are recorded in the handoff.
