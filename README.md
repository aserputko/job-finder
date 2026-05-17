# findjob

Personal job-search automation and application toolkit for **Andrii Serputko** — Senior Full Stack Engineer / Technical Lead.

## Project Goals

1. **Find a new role** — Senior Full Stack Engineer, Technical Lead / Engineering Lead, or Frontend-heavy (React) positions.
2. **Maintain tailored application materials** — keep a master CV and cover letter in Markdown, and generate per-application variants.
3. **Automate daily job discovery** — fetch open opportunities from selected boards, score them against my experience/skills with an LLM, and surface matches above a configurable threshold.

## Candidate Profile (summary)

- **Name:** Andrii Serputko
- **Title:** Full Stack Engineer | Technical Lead (15+ years)
- **Location:** Warsaw, Poland
- **Languages:** English (B2), Ukrainian (Native)
- **Availability:** Immediately
- **Core stack:** React, TypeScript, Node.js / NestJS, AWS, Azure DevOps, PostgreSQL, MongoDB, Docker, Kubernetes
- **Strengths:** scalable React apps, microservices & serverless, CI/CD, mentoring, architecture
- Full CV: `~/Documents/CV/Andrii_Serputko_CV_2025.pdf` (gitignored)

## Search Criteria

| Criterion           | Value                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| Target roles        | Senior Full Stack Engineer, Tech Lead / Engineering Lead, Senior React Eng. |
| Location            | Remote (EU) or Remote (Worldwide)                                           |
| Employment type     | Full-time permanent **or** B2B contract                                     |
| Target compensation | ~ **$5,000 USD / month** (net, B2B equivalent)                              |
| Tech stack focus    | React + Node.js / NestJS + TypeScript                                       |
| Industries          | SaaS / B2B, AI / ML, E-commerce, DefTech (no strong preference otherwise)   |
| Working languages   | English, Ukrainian                                                          |
| Deal-breakers       | No-remote roles, gambling industry                                          |

### Job Sources (daily fetch)

- [LinkedIn Jobs](https://www.linkedin.com/jobs/)
- [NoFluffJobs](https://nofluffjobs.com/)
- [JustJoin.IT](https://justjoin.it/)
- [Djinni](https://djinni.co/jobs/)
- [DOU](https://jobs.dou.ua/)

## Match Scoring

Each fetched job is scored by an LLM against the candidate profile. Scoring dimensions:

- **Tech-stack overlap** (React / TS / Node / NestJS / AWS) — weight 40%
- **Seniority fit** (Senior / Lead) — weight 20%
- **Location & remote policy** — weight 15%
- **Compensation match** (≥ target) — weight 15%
- **Industry / deal-breakers** — weight 10%

Output: `score` ∈ [0, 100]. **All matches above the threshold** (default `70`) are surfaced in the daily report.

## Repository Structure (planned)

```
findjob/
├── README.md                  # this file
├── .gitignore                 # excludes personal data & secrets
├── cv/
│   ├── master.md              # master CV in Markdown
│   ├── cover-letter.md        # base cover letter template
│   ├── tailored/              # per-application variants (gitignored)
│   └── build/                 # generated PDFs (gitignored)
├── scripts/                   # Node.js + TypeScript automation
│   ├── fetch/                 # one scraper per job board
│   ├── score/                 # LLM-based match scoring
│   ├── report/                # daily Markdown / JSON report generator
│   └── build-cv.ts            # Markdown → PDF
├── data/
│   ├── jobs/YYYY-MM-DD.json   # raw fetched jobs per day (gitignored)
│   └── reports/YYYY-MM-DD.md  # ranked daily report
└── .github/workflows/
    └── daily-fetch.yml        # GitHub Actions cron (daily)
```

## Tech Stack (automation)

- **Runtime:** Node.js + TypeScript
- **Scheduler:** GitHub Actions (daily cron)
- **Storage:** JSON + Markdown files in repo
- **Scoring:** LLM API (OpenAI / Anthropic — configurable via env)
- **CV build:** Markdown → PDF (e.g., `md-to-pdf` or Pandoc)

## Workflow

1. **Daily cron** triggers `scripts/fetch/*` → collects new postings from each board.
2. **Deduplicate** against `data/jobs/*.json` history.
3. **Score** each new job via LLM using `cv/master.md` as context.
4. **Generate report** at `data/reports/YYYY-MM-DD.md` with all jobs above threshold.
5. **Manual review** → for selected jobs, generate a tailored CV + cover letter into `cv/tailored/`.

## Privacy

Personal data (full CV, contact info, tailored applications, raw scraped data) is **gitignored**. Only templates, scripts, and aggregated/anonymized reports are committed.

## Status

🚧 Bootstrapping — initial scaffolding in progress.
