# Version 1.2 validation

- 63 automated tests passed, including existing itinerary, analytics and map regressions plus news parsing, publisher link restrictions, external-entity rejection, future-date rejection, changed-headline detection, original-date sorting and checklist round-trip validation.
- TypeScript checking passed after resolving the new checklist component and test typing.
- The production build completed before API testing. The final workflow repeats the build after source-adapter refinements.
- Schema-only migration 0001 adds news_checks and news_items. It contains no seed data and changes no existing tables. Both local schema migrations applied successfully.
- Eight initial editorial stories were checked against the linked publishers. The newest report is dated November 6, 2026. Archive and undated records remain labelled.
- Browser preview first failed because the clean checkout lacked its managed execution profile. The supported configuration helper repaired that setting. A later browser action was rejected by an environment URL security policy. The policy was not bypassed. Visual, mobile and browser interaction verification for this release is incomplete.
- Saved-story persistence and checklist toggles require browser interaction verification. Their storage and parser paths were reviewed and checklist import/export was covered in automated tests.
- The previous release’s calendar attachment download and file-picker restore checks remain unverified. This release does not claim to resolve them.
- API and hosted maintenance results are recorded separately after they run.
