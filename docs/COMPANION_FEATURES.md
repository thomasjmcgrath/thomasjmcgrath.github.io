# Personal passport, birthday calendar and desk safari

## Passport

Local storage key: hwt-passport-v1. One record describes one known hippo, an actual date, an in-person or camera/video activity, whether the animal was seen, a user-entered place/source and optional plain-text notes. An in-person seen result contributes one animal stamp. Repeated visits do not add another animal to the total. Watch logs and missed sightings do not award in-person stamps.

The passport does not write to the server, public analytics, animal homes, viewing guidance or trip bookings. A historical location is the user’s record, not inferred from the animal’s current city. Notes render as text, not HTML.

Loading invalid stored JSON preserves it and disables editing. A recovery copy can be downloaded. Explicitly restoring a valid backup replaces that unreadable document. Normal imports merge unique IDs and reject conflicting payloads or more than 250 records. Writes that fail show a warning so the visitor can export the in-memory record. Remove has an undo action, also bounded by the capacity check. Exports and recovery copies remain visitor-controlled downloads.

## Birthdays

The existing sourced profile birth dates power anniversary calculations. The next-365-days view includes today through 364 days after today, with no extra next-year duplicate when a birthday is today. Calendar-year views use explicit year boundaries. The date API rejects invalid dates, reversed windows, unknown animal IDs and spans over 731 inclusive calendar days. The birth itself is not labelled a first birthday.

ICS files have stable per-animal/per-year UIDs, explicit all-day start and exclusive next-day end, escaped descriptions and Unicode-safe byte folding. They do not use a recurring rule that could freeze the displayed age. Events are anniversary references, never invented official zoo parties or guaranteed sighting dates.

## Watch links

Sources checked November 6, 2026:

- Toronto Zoo official Live Cams page: https://www.torontozoo.com/livecams
- Cincinnati Zoo official membership page: https://cincinnatizoo.org/membership/
- Metro Richmond Zoo official Poppy page and historical launch: https://metrorichmondzoo.com/animals/poppy-the-pygmy-hippo/ and https://metrorichmondzoo.com/newsroom/pygmy-hippo-live-stream/
- Metro Richmond outdoor-camera history: https://metrorichmondzoo.com/newsroom/new-pygmy-hippo-outdoor-experience/

Toronto links to Zoolife; its access promotions and subscription conditions can change. Cincinnati’s hippo camera requires provider membership/sign-in. No player session or paid membership was accessed during implementation, and no uptime claim is made. Poppy’s historical View Poppy Cam link now opens the animal profile, where a current working player was not confirmed. Her entry is an update/archive source with a camera-link warning, not a verified live stream.

The rest of the cast links to existing official zoo or keeper pages. Archive keeper articles remain archive context. Local clocks use the current directory’s IANA time zones and update once a minute. A local clock is not a camera-status check. All video playback opens on the provider’s site, so no third-party player is loaded by this hub.

## News addition

The original Toronto Zoo release, published October 28, 2026, is https://www.torontozoo.com/mediaroom/press2026/20260728. Its URL contains a different numeric date; the original article text controls the publication date. The story describes the fictional Canadian house hippo in a MediaSmarts/CN Tower campaign and mentions Maple. The bulletin summary distinguishes the fictional animal from real pygmy hippos. Its added-to-the-bulletin timestamp is separate from its original publication date, so an older story newly curated here can correctly appear as new to a returning reader.

## Daily upkeep

Existing news and visitor-source maintenance continues without changing the schedule or source deployments. Passport data stays device-local. Birthday ages recalculate automatically. Watch-source check dates are editorial dates, not repeated playback verification. No external interest, flight fares, rankings or viewing guidance are invented.
