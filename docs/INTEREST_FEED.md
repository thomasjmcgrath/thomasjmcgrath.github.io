# Authorized interest-feed contract

Configure `HIPPO_TRENDS_FEED_URL` with an authorized HTTPS JSON endpoint. An optional `HIPPO_TRENDS_FEED_TOKEN` is sent as a bearer token. The app does not scrape Google Trends or guess an alpha API endpoint.

Schema example only, not actual data:

```json
{
  "source": "Your licensed provider",
  "sourceUrl": "https://your-provider.example/methodology",
  "method": "Weekly relative interest, with the same scale and interval for every tracked animal.",
  "region": "WORLDWIDE",
  "dataThrough": "2026-11-01",
  "points": [
    {"hippoId": "moo-deng", "date": "2026-11-01", "value": 0},
    {"hippoId": "fiona", "date": "2026-11-01", "value": 0}
  ]
}
```

No example is installed as production data. Use IDs from `lib/catalog.ts`. Regions are WORLDWIDE or uppercase two-letter countries. Values can be fractional. They are not automatically rescaled to 0–100. Dates must exist, cannot exceed dataThrough and cannot be in the future. Duplicate animal/date pairs are rejected. Limits: 2–1,000 samples, 300 KB.

Use the same scale and interval for all subjects in a snapshot. Independently normalized animals cannot be ranked together. Disambiguate the actual animal for generic names such as Maple, Toni and Poppy. Omitted animals are not assigned zero.

Version 1.4 imports the bounded feed as one atomic snapshot, including its public methodology URL. Legacy animal/date/geography records remain readable. Imports are idempotent for the configured feed. A source or method change for an existing geography is rejected until you explicitly migrate that dataset. Successful imports occur at most once per 12 hours. The UI uses the latest persisted snapshot date, source, method and import time, not the fetch date as a proxy for the data date.


Refresh failures preserve the prior payload and last-success timestamp, with a separate attempt timestamp and warning. A zero is a measured zero, omitted animals are not assigned zero, and tied nonzero values share the same rank. A snapshot with fewer than two animals on its latest date or all-zero values does not assign ranks. Snapshots older than 14 days are labelled old, not silently presented as current.
