---
applyTo: "scripts/fetch/**"
---

# Job-Board Fetcher Conventions

Each fetcher module must:

1. Export a **single default async function**: `export async function fetch(): Promise<Job[]>`
2. Import the shared `Job` type from `../../types.ts`
3. Return an **empty array** (never throw) when the board is unreachable — log the error to `console.error`
4. Set a **User-Agent** header that mimics a real browser; never send credentials in the request
5. Respect a **rate-limit delay** of at least 1 second between paginated requests (`await delay(1000)`)
6. Include these fields on every `Job` object:

```ts
{
  id: string          // stable hash: sha256(title + company + url).slice(0,16)
  source: string      // board name, e.g. "justjoin.it"
  title: string
  company: string
  url: string
  location: string    // "Remote" if remote
  postedAt: string    // ISO-8601 date string
  description: string // full JD text (used for LLM scoring)
  salary?: string     // raw salary string if available
}
```

7. Filter out jobs matching deal-breaker patterns **before** returning (import `isDealBreaker` from `../../filters.ts`)
