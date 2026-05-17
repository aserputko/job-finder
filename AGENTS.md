# findjob — Agent Instructions

Personal job-search automation toolkit. See [README.md](README.md) for full project goals, search criteria, and planned structure.

## Project Status

Bootstrapping. No `package.json` yet. The folder structure described in README.md is **planned, not yet created**.

## Architecture

```
scripts/fetch/     → one TypeScript module per job board (LinkedIn, NoFluffJobs, JustJoin.IT, Djinni, DOU)
scripts/score/     → LLM-based match scoring (OpenAI or Anthropic, configured via env)
scripts/report/    → daily Markdown + JSON report generator
scripts/build-cv.ts → Markdown → PDF using md-to-pdf or Pandoc
cv/                → master CV and cover letter (Markdown); tailored variants and PDFs are gitignored
data/jobs/         → raw JSON from scrapers, one file per day, gitignored
data/reports/      → ranked daily Markdown reports
.github/workflows/ → GitHub Actions daily cron
```

## Conventions

- **Language**: TypeScript (strict mode) throughout `scripts/`.
- **Runtime**: Node.js; no Bun/Deno unless explicitly decided.
- **One file per job board**: each fetcher in `scripts/fetch/<board>.ts` exports a single `fetch(): Promise<Job[]>` function.
- **Shared types**: define `Job`, `ScoredJob`, `CandidateProfile` in `scripts/types.ts`; import everywhere.
- **LLM calls**: wrap in `scripts/score/llm.ts`; model and API key come from env vars (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`).
- **No personal data in code**: full CV text lives in `cv/master.md` (gitignored); load at runtime via `fs.readFile`.
- **Scoring threshold**: default `70/100`; overridable via `SCORE_THRESHOLD` env var.
- **Date-stamped output**: jobs saved to `data/jobs/YYYY-MM-DD.json`; reports to `data/reports/YYYY-MM-DD.md`.
- **Deduplication**: use `(title + company + url)` hash to skip already-seen postings.

## Deal-breakers (filter before scoring)

Automatically reject any job where the description matches:

- No remote / on-site only
- Gambling / betting industry

## Privacy Rules

- `cv/master.md`, `cv/cover-letter.md`, `cv/tailored/`, `cv/build/`, `data/jobs/`, raw scraped data → all gitignored.
- Never hardcode personal contact details or salary expectations in committed files.
- Secrets (API keys) → `.env` only (gitignored); provide `.env.example` with placeholder values.

## Build & Run (once scaffolded)

```bash
npm install
npm run fetch          # run all scrapers → data/jobs/YYYY-MM-DD.json
npm run score          # score today's jobs → data/reports/YYYY-MM-DD.md
npm run report         # alias: fetch + score in sequence
npm run build:cv       # cv/master.md → cv/build/cv.pdf
```

## GitHub Actions

`.github/workflows/daily-fetch.yml` runs on `schedule: cron: '0 7 * * *'` (07:00 UTC daily).  
Secrets required: `LLM_API_KEY`.

## Key Design Decisions

- **LLM provider abstraction**: keep provider-agnostic so we can swap OpenAI ↔ Anthropic by changing env vars.
- **Markdown-first CV**: single source of truth in `cv/master.md`; tailored versions are copies with targeted edits.
- **No DB**: JSON files are sufficient; avoids infrastructure overhead for a personal tool.
- **Score weights**: tech-stack 40%, seniority 20%, location 15%, compensation 15%, industry 10% — defined in `scripts/score/weights.ts`.
