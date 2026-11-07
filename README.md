# Hippo World Tour

Version 1.6.0. A professional-looking, mildly unreasonable hippo fan site that runs on GitHub Pages.

The account repository's `main` branch contains the ready-built website at its root. GitHub Pages should use **Deploy from a branch → main → /(root)**. See [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md) for controls, build commands and news updates.

## Included

- Seven sourced profiles with archive images and clear visiting notes.
- An interactive twelve-question personality quiz with seven fictional matches, trait charts, friend comparisons and downloadable result cards.
- A map, destination comparison and a roughly 6,350-word original hippo field guide.
- Trip planning, personal budget allowances, day notes, checklists, JSON/calendar export and printing.
- A personal visit/watch passport, birthday calendar and official watch links.
- A dated news bulletin with filters and saved stories. A daily GitHub workflow can refresh attributed headlines while retaining previous data on failures.
- Clearly labelled sample statistics and separate activity saved only on the current device.
- Date-specific flight-provider searches, with current prices checked on the provider.

The browser entry is `web/main.tsx`. No shared analytics database or private live-fare API is required. Demo statistics are invented sample counts, visibly labelled. Animal homes, viewing guidance and source dates are factual editorial content, not demo data.

## Local development

Use Node.js 24:

```sh
npx pnpm@11.25.0 install --frozen-lockfile
npm run dev
```

```sh
npm test
npm run typecheck
npm run build
npm run publish:files
```

The last command copies `dist/` into the repository root for branch-based Pages hosting. Commit the generated files with your source changes. `npm start` previews the built website.

See [docs/QUIZ.md](docs/QUIZ.md), [docs/MEDIA_CREDITS.md](docs/MEDIA_CREDITS.md) and [docs/VALIDATION_1_6.md](docs/VALIDATION_1_6.md). The existing private Site and its maintenance automation are separate and were not changed by this GitHub Pages conversion.
