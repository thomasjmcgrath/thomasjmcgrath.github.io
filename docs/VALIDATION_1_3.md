# Version 1.3 validation

- 81 automated checks passed: 63 existing checks and 18 new passport, import safety, sighting statistics, birthday-window, annual-age, calendar serialization and watch-source coverage checks.
- Passport tests cover historical location preservation, future/before-birth/overflow date rejection, unknown animals, malformed backups, duplicate/conflicting records, capacity including undo/import, plain-text notes and non-visit stamp exclusion.
- Calendar tests cover date ordering, wishlist filtering, changing ages, first-anniversary behavior, exact window bounds, stable event UIDs, all-day end dates, source notes and Unicode-safe folding.
- Watch sources were verified through official pages. Toronto and Cincinnati offer official camera access paths, with provider terms. Poppy’s old camera launch link redirects to her profile and a currently working stream remains unconfirmed.
- Browser visual and interaction checks remain incomplete because the preview-browser URL security policy blocked the prior verification session. No alternate browser-control path was used to bypass it. Passport import picker, on-screen persistence, responsive layout and attachment downloads require browser verification.
- Production build, TypeScript and hosted API results are recorded after the final release workflow.
- No new database migration is required. Existing news rows, last successful retrievals, owner controls, animal homes and visitor guidance remain in place.
