/**
 * NoFluffJobs fetcher.
 * Uses the public search API used by their own frontend.
 * Filters: senior fullstack/frontend roles, remote.
 */
import { isDealBreaker } from '../filters.ts';
import type { Job } from '../types.ts';
import { delay, hashJob, httpGet } from '../utils.ts';

const API = 'https://nofluffjobs.com/api/posting';

interface NfjPosting {
  id: string;
  title: string;
  name?: string;
  url?: string;
  posted?: number;
  location?: {
    places?: {
      city?: string;
      country?: { code?: string };
      remote?: boolean;
    }[];
  };
  salary?: { from?: number; to?: number; currency?: string; type?: string };
  technology?: string;
  seniority?: string[];
  category?: string;
  requirements?: { musts?: string[]; nices?: string[] };
}

export async function fetch(): Promise<Job[]> {
  try {
    const res = await httpGet(API, { headers: { accept: 'application/json' } });
    if (!res.ok) {
      console.error(`[nofluffjobs] HTTP ${String(res.status)}`);
      return [];
    }
    const data = (await res.json()) as { postings?: NfjPosting[] };
    const postings = data.postings ?? [];

    const jobs: Job[] = [];
    for (const p of postings) {
      const isRemote = p.location?.places?.some((pl) => pl.remote) ?? false;
      const cities = p.location?.places?.map((pl) => pl.city).filter(Boolean) ?? [];
      const location = isRemote ? 'Remote' : cities.join(', ') || 'Unknown';

      const url = `https://nofluffjobs.com/job/${p.url ?? p.id}`;
      const title = p.title;
      const company = p.name ?? 'Unknown';

      const description = [
        `Seniority: ${(p.seniority ?? []).join(', ')}`,
        `Technology: ${p.technology ?? ''}`,
        `Category: ${p.category ?? ''}`,
        `Musts: ${(p.requirements?.musts ?? []).join(', ')}`,
        `Nices: ${(p.requirements?.nices ?? []).join(', ')}`,
      ].join('\n');

      const salary = p.salary
        ? `${p.salary.from?.toString() ?? ''}-${p.salary.to?.toString() ?? ''} ${p.salary.currency ?? ''} ${p.salary.type ?? ''}`.trim()
        : undefined;

      const job: Job = {
        id: hashJob({ title, company, url }),
        source: 'nofluffjobs',
        title,
        company,
        url,
        location,
        postedAt: p.posted ? new Date(p.posted).toISOString() : new Date().toISOString(),
        description,
        salary,
      };

      if (!isDealBreaker(job)) jobs.push(job);
    }

    await delay(1000);
    return jobs;
  } catch (error) {
    console.error('[nofluffjobs] fetch failed:', error);
    return [];
  }
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const j = await fetch();
  console.log(JSON.stringify(j, undefined, 2));
}
