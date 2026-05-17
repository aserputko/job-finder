---
description: "Add a new job board scraper. Use when: adding a new fetcher, new job board, new source, new scraper."
---

# Add a New Job Board Fetcher

Create a new fetcher for the job board described below.

## Board Details

Board name: {{boardName}}
Base URL: {{baseUrl}}
API or HTML scraping: {{apiOrScrape}}
Notes: {{notes}}

## Instructions

1. Create `scripts/fetch/{{boardName}}.ts` following the conventions in `.github/instructions/fetchers.instructions.md`.
2. Add a named export to `scripts/fetch/index.ts` so the runner picks it up automatically.
3. Add the board name to the `sources` array in `scripts/config.ts`.
4. Write a brief JSDoc comment at the top of the file explaining the board and any auth requirements.
5. Test locally: `npx ts-node scripts/fetch/{{boardName}}.ts` should print a non-empty JSON array.
