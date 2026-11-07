# Version 1.1 validation

- 47 meaningful logic and regression checks passed, including the original 27 checks.
- Strict TypeScript checking passed.
- The atlas uses real Natural Earth land geometry, locally served, with no mapping API key or external tiles.
- Desktop browser checks verified map rendering, fitting venues, Europe filtering, selecting Haggis and the unconfirmed-viewing state.
- Browser checks verified a three-venue circuit, custom Maple title and notes, moving a free day to the start of the itinerary, correct rest-day city, and persistence after reload. The downloaded JSON contained the edited plan.
- JSON import validation, backwards compatibility and round-trip data preservation passed automated checks. The browser file-picker restore test stalled and was not completed. It was not repeated.
- Calendar serialization checks verified custom titles, multiline notes, escaping, folding and moved dates. A browser calendar download event was not captured. The export now uses a generic attachment MIME type with the .ics filename for download compatibility.
- The initial map hydration mismatch was corrected by removing redundant SVG title elements. Venue markers retain explicit accessible names and a corresponding HTML venue list.
- New map phone layouts have responsive rules and the original site passed phone checks. A fresh phone browser check of the new atlas is recorded separately when available.
- Cincinnati's actual source was approximately 1.8 MB. The new reader is bounded at 4 MB and rejects truncated and blocked pages. The TAT STAR official venue profile was retrieved and its Moo Deng text verified during source research. Hosted read-back is performed after deployment.
- No new database migration is required. Historical source-check rows are preserved. No animal-home or viewing guidance overrides were automatically written.
- Owner access is verified using the authenticated caller's own site-scoped identity and configured through the deployment environment, with no public role claim or secret in source.

Live airfare and external search-interest feeds still require approved production provider access.
