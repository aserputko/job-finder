/**
 * LinkedIn fetcher — STUB.
 * LinkedIn's job APIs require OAuth or an authenticated session cookie.
 * Returns an empty array until proper auth is wired in.
 *
 * TODO: implement via either:
 *   - LinkedIn Jobs API (requires partner approval), or
 *   - authenticated session cookie (LI_AT) passed via env var, or
 *   - a 3rd-party proxy like ScrapingBee / Bright Data.
 */
import type { Job } from '../types.ts';

export function fetch(): Promise<Job[]> {
  console.warn('[linkedin] fetcher is a stub — returns []. See TODO in scripts/fetch/linkedin.ts');
  return Promise.resolve([]);
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const j = await fetch();
  console.log(JSON.stringify(j, undefined, 2));
}
