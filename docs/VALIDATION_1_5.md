# Version 1.5 validation

Personality quiz release, November 6, 2026 (America/Dawson_Creek).

## Automated checks

- `npm test`: 123 tests passed, including 22 quiz tests and all 101 existing checks.
- TypeScript: `tsc --noEmit` passed.
- Production Worker build: passed using the maintained Sites build helper.
- No new dependency or database migration.

Quiz checks cover control identifiers, valid answer contributions, all seven reachable outcomes, deterministic results, zero-valued sliders, changing preferences, partial answers, unmeasured dimensions, minimum answer count, invalid payloads, bounded scores, stable ties, versioned draft recovery, link whitelists, unsafe URL rejection and changing friend-comparison suggestions.

## Browser checks

The local preview was tested with a desktop browser and a 390-pixel iframe viewport (375-pixel content area after its scrollbar).

- Entered the quiz through the existing site's footer and inspected the intro layout and archive-photo credits.
- Used keyboard 2 and Enter to select and advance, then Previous to confirm the answer remained selected.
- Reloaded during the quiz, chose Resume and continued at the saved question.
- Completed all twelve prompts, including confirming the middle slider preset and choosing the 75 preset.
- Reviewed the answer summary and revealed the expected Fritz result for the test path. Its tied Haggis runner-up was labelled.
- Changed the active trait interpretation, hid the archetype chart overlay, expanded all personal matches and selected Maple in the friend comparison.
- Verified the selectable share-link fallback on the HTTP preview. The generated URL contained only `result=fritz` and `v=1`.
- Triggered the PNG export through the UI, retrieved the generated file, verified its PNG format and 1080 × 1400 dimensions, and visually inspected the design and archive credit.
- Opened the Haggis shared archetype. It displayed neither personal scores nor answers, and its trip control remained disabled with public viewing unconfirmed.
- Inspected mobile intro, result, review and question layouts. No horizontal document overflow was measured on the intro, result or question screen. Skipping an answer reduced the count, returned to review and allowed editing it back.
- Saved a screenshot of the actual desktop result. The temporary mobile QA page was removed before publication.

## Scope and limits

The fictional archetypes and personal scores are entertainment content. They do not claim scientific validity or measured animal behaviour. Personal quiz outcomes do not enter the site's popularity data.

This release does not connect a live flight provider or an external search-interest feed. Existing restrictions and empty states remain applicable. Browser QA used the local preview and its existing visitor-status fallback.

Publication was blocked when the Site source service returned HTTP 503 on the initial push and a retry. The local source and successful build were retained, and the source package contains the complete quiz. The existing hosted version was not replaced. Production quiz route retrieval could not be verified. A later publication must synchronize this source successfully while preserving the Site's access rules.

The clipboard fallback was verified locally. An operating system clipboard grant and native phone/browser coverage were not tested. The PNG download and responsive layout were exercised in the cloud browser.
