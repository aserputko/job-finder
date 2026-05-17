import type { Job } from '../types.ts';
import { fetch as fetchDjinni } from './djinni.ts';
import { fetch as fetchDou } from './dou.ts';
import { fetch as fetchJustjoin } from './justjoin.ts';
import { fetch as fetchLinkedin } from './linkedin.ts';
// import { fetch as fetchNoFluffJobs } from './nofluffjobs.ts';

export const FETCHERS = {
  // nofluffjobs: fetchNoFluffJobs,
  'justjoin.it': fetchJustjoin,
  djinni: fetchDjinni,
  dou: fetchDou,
  linkedin: fetchLinkedin,
} as const;

/** Runs every registered fetcher in parallel and concatenates results. */
export async function runAllFetchers(): Promise<Job[]> {
  const results = await Promise.allSettled(
    Object.entries(FETCHERS).map(async ([name, fn]) => {
      const jobs = await fn();
      console.log(`[${name}] fetched ${String(jobs.length)} jobs`);
      return jobs;
    }),
  );

  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
