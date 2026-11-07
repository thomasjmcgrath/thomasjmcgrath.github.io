# Put the full Hippo World Tour on GitHub

This package is ready to store in a GitHub repository and deploy to Cloudflare Workers. GitHub Pages alone serves static files and cannot run the flight API, news updater or shared database. No separate frontend/backend rewrite is needed.

## Quick setup

1. Create a GitHub repository and upload the CONTENTS of the Hippo_World_Tour folder, including .github. Keep filled .dev.vars and .env files out of Git.
2. Create a new Cloudflare D1 database for this site. Do not point the first migration run at an existing unrelated database.
3. In GitHub, open Settings > Secrets and variables > Actions. Add the secrets below. Do not put their values in source files.
4. Open Actions > Deploy full site to Cloudflare > Run workflow. This runs tests and the build, applies migrations, sends server-only secrets and deploys.
5. Copy the resulting HTTPS Worker URL into the repository variable HIPPO_SITE_URL. This enables the daily data-refresh workflow. The schedule is 14:30 UTC. It updates data without rebuilding or redeploying the site.

The separate Test the hippos workflow also runs on pushes and pull requests. Deployment is manual so a casual edit does not automatically publish.

| GitHub secret | What to put there |
| --- | --- |
| CLOUDFLARE_API_TOKEN | Your account-scoped token with Worker Scripts Edit and D1 Edit permissions. |
| CLOUDFLARE_ACCOUNT_ID | Your Cloudflare account ID. |
| CLOUDFLARE_D1_DATABASE_ID | The ID of the new D1 database. |
| HIPPO_MAINTENANCE_TOKEN | Your own private, long random maintenance secret. It protects the public site's updater. |
| HIPPO_SKYSCANNER_API_KEY | Your approved production Skyscanner Travel API key. Needed for in-app live fares. |
| HIPPO_TRENDS_FEED_URL | Your configured authorized JSON search-interest feed. Needed for external rankings. |
| HIPPO_TRENDS_FEED_TOKEN | Optional bearer token required by that feed. Leave unset if the feed does not require it. |

Optional repository variable HIPPO_WORKER_NAME controls the Worker name. Default: hippo-world-tour. Do not configure HIPPO_ADMIN_USER_ID on this standalone deployment. Its ChatGPT-only owner editor and MCP entry points are disabled. Edit the editorial source files in GitHub instead.

Without the two provider connections the site still works, but it shows direct flight searches and an explicit empty external-interest state. No test fares or test popularity data are installed.

## Flight prices

The planner's Search flights form uses the Skyscanner create/poll API when the production key is present. Quotes retain the requested currency and total traveller count across polling. Search sessions expire after 15 minutes. The provider's internal token stays on the server.

Prices are returned by the provider for the requested route and dates. An API key alone does not verify provider coverage or pricing accuracy. Complete a real future-date search after connecting the account. No paid booking is performed by this app.

Official documentation:
- https://developers.skyscanner.net/docs/flights-live-prices/overview
- https://developers.skyscanner.net/docs/flights-live-prices/quick-start

## External interest

Supply an authorized HTTPS JSON feed using docs/INTEREST_FEED.md. There is no Google Trends scraper or hidden unauthenticated endpoint. A licensed provider or your own authorized normalization service must provide comparable hippo-specific measurements.

After adding its URL and optional token, run Actions > Refresh hippo data. The external chart shows the imported source, methodology link, measurement date, missing animals and refresh status. A failed refresh preserves the last successful snapshot. Changing the source or measurement method requires a deliberate dataset migration.

Google's API access information: https://developers.google.com/search/apis/trends

## Check the live connections

Set HIPPO_SITE_URL in your terminal to the deployed HTTPS address, then run:

    npm run connections:check

To require an enabled flight connection and a persisted external-interest snapshot:

    npm run connections:check -- --require-data

This checks configuration and the stored snapshot. It does not consume a paid flight search or claim to verify a fare. Use the planner to test an actual flight search.

## Local use

Copy .dev.vars.example to .dev.vars and fill only the connections you have. Follow README.md for dependency installation, the build and the three local migrations. Never commit the filled file.

The original private ChatGPT Site and its linked daily automation are unchanged by preparing this package. GitHub/Cloudflare hosting is a separate deployment that you activate yourself.

Cloudflare's GitHub guide: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
GitHub Pages scope: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
