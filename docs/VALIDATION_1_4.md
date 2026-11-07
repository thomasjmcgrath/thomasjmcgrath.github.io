# Version 1.4 validation

- 101 automated checks passed, including 20 new connection and hosting checks.
- Flight tests exercise create and poll, server-held currency and traveller counts, ownership checks, route-change rejection, expiry, rate limits, missing credentials, provider failures and malformed responses. Blank and zero amounts do not become free-flight quotes.
- Authorized-interest tests exercise the configured endpoint, source provenance, ties, missing animals, all-zero and insufficient comparison sets, payload limits, caching, changed measurement methods and failure preservation of the last successful payload and timestamp.
- A real in-memory SQLite upgrade applies all migrations and verifies existing source success timestamps, news and legacy interest rows survive.
- Standalone hosting tests check the public maintenance authorization gate, disabled Sites owner routes and generated D1/assets configuration.
- Provider responses in automated tests are explicitly isolated fixtures. They are not installed in the live database, UI or public assets.
- Production provider activation still needs an approved Skyscanner key and an authorized interest-feed URL. An actual production fare and external dataset cannot be verified without those connections.
- TypeScript, production build, preview and deployment checks are completed during release packaging.
- The GitHub Actions workflow is supplied but has not been run in the user's GitHub/Cloudflare account. No external repository or Cloudflare deployment was created in this task.
