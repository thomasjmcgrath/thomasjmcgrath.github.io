# Hippo World Tour on GitHub Pages

Version 1.6.0 is a static website. The main branch includes a ready-built `index.html`, assets and twenty direct page routes, so the existing GitHub Pages branch source can serve it immediately. It requires no Cloudflare account, application server or private flight API key.

## Hosting controls

In this repository, open Settings → Pages. Keep **Deploy from a branch**, **main**, **/(root)**. Save only if those controls differ. Leave the existing domain and HTTPS controls as configured. A root `CNAME` should contain your own configured domain only. This release does not change DNS records.

The `Update and publish Hippo World Tour` workflow checks, builds and commits generated website files. On manual and daily scheduled runs it also refreshes the attributed news snapshot. After the commit, it explicitly requests a Pages build because commits made with the workflow token do not automatically trigger the normal Pages build. The workflow uses GitHub's repository token with contents and Pages write permissions. No personal access token is needed.

GitHub's existing `pages build and deployment` workflow performs the actual publication. A green test run alone does not mean the website was published. Review that Pages run and open its deployment URL.

## What works

- Seven credited animal profiles, searchable directory, local map, venue comparison and the complete field guide.
- The twelve-question personality quiz, all seven fictional matches, editable answers, traits, friend comparisons, safe archetype links and PNG cards.
- Browser-saved trip planning, route ordering, budget allowances, day notes, checklists, JSON/calendar exports and a print view.
- Passport visit/watch logs, sourced birthday anniversaries and official watch links.
- Source-dated news with filters and locally saved stories.
- A clearly labelled sample statistics mode and a separate chart of activity saved on the current device.
- Date-specific external flight searches. Current prices and reservations are checked with the provider.

The sample leaderboard is fictional demonstration data. It is not shared visitor analytics or a global ranking. Local events stay in the visitor's browser. External search-interest feeds and in-app live fares are not part of this edition.

## Source and generated files

The browser entry is `web/main.tsx`. `vite.pages.config.ts` builds it to `dist/`. `scripts/finalize-pages.mjs` writes direct page entry files. `scripts/publish-pages-files.mjs` copies the build to the branch root, retaining a `pages-generated.json` manifest so it can remove only obsolete generated files.

```sh
npx pnpm@11.25.0 install --frozen-lockfile
npm test
npm run typecheck
npm run build
npm run publish:files
```

Commit the changed source and generated files. The workflow also rebuilds after source pushes. Run `npm run dev` to develop locally, or `npm start` to preview the built site. This configuration targets the account repository root or a custom domain, rather than a repository subfolder URL.

## News refresh

The scheduled workflow runs at 14:30 UTC daily. Check Actions to confirm that it is enabled and running in your own repository. A manual run also checks the news sources.

`npm run news:refresh` checks only the configured public publisher allowlist. Requests have time and size limits and do not follow redirects. RSS headlines are attributed. Full article bodies are not copied into the feed. Failed retrievals preserve retained stories and last-success times. Changed automated headlines retain the previous version and add their proposed update to `reviewQueue` in `public/data/news.json`.

For editorial review, read the source article and inspect the queued payload. To approve a changed headline, update that item's retained fields deliberately, clear its `reviewRequired` marker and remove the matching review-queue entry. Commit the reviewed data. Do not use a news retrieval to rewrite an animal home or viewing guidance automatically.

The fixed animal and venue register stays in `lib/catalog.ts`. Edit it only after reviewing a supporting official source. External interest must still enter through an authorized feed if one is added later.

## Moving saved plans

Browser storage belongs to the domain where the visitor created it. Export trips or passport logs from the old site, then import them on the new domain. Their existing file formats remain compatible. Quiz progress and news bookmarks remain on their original browser origin.

The older server integrations remain in the source history and supporting files for reference. Active GitHub workflows use the static build. The former Cloudflare deployment and maintenance workflows are stored under `docs/optional-server/` and do not run.
