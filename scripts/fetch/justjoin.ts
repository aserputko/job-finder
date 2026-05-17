/**
 * JustJoin.IT fetcher.
 * Uses the public JSON endpoint that powers their frontend listing.
 */
import { isDealBreaker } from '../filters.ts';
import type { Job } from '../types.ts';
import { delay, hashJob, httpGet } from '../utils.ts';

const API =
  'https://api.justjoin.it/v2/user-panel/offers?categories[]=1&experienceLevels[]=senior&workplaces[]=remote';

interface JjitOffer {
  slug: string;
  title: string;
  companyName: string;
  city?: string;
  workplaceType?: string;
  remoteInterview?: boolean;
  publishedAt?: string;
  employmentTypes?: {
    type?: string;
    from?: number;
    to?: number;
    currency?: string;
  }[];
  requiredSkills?: string[];
  experienceLevel?: string;
  body?: string;
}

export async function fetch(): Promise<Job[]> {
  try {
    const res = await httpGet(API, {
      headers: { accept: 'application/json', version: '2' },
    });
    if (!res.ok) {
      console.error(`[justjoin] HTTP ${String(res.status)}`);
      return [];
    }
    const data = (await res.json()) as { data?: JjitOffer[] };
    const offers = data.data ?? [];

    const jobs: Job[] = [];
    for (const o of offers) {
      const url = `https://justjoin.it/offers/${o.slug}`;
      const title = o.title;
      const company = o.companyName;
      const isRemote = (o.workplaceType ?? '').toLowerCase() === 'remote';
      const location = isRemote ? 'Remote' : (o.city ?? 'Unknown');

      const salary = o.employmentTypes
        ?.map(
          (e) =>
            `${e.type ?? ''}: ${e.from?.toString() ?? ''}-${e.to?.toString() ?? ''} ${e.currency ?? ''}`,
        )
        .join('; ');

      const description = [
        `Experience: ${o.experienceLevel ?? ''}`,
        `Skills: ${(o.requiredSkills ?? []).join(', ')}`,
        o.body ?? '',
      ].join('\n');

      const job: Job = {
        id: hashJob({ title, company, url }),
        source: 'justjoin.it',
        title,
        company,
        url,
        location,
        postedAt: o.publishedAt ?? new Date().toISOString(),
        description,
        salary,
      };

      if (!isDealBreaker(job)) jobs.push(job);
    }

    await delay(1000);
    return jobs;
  } catch (error) {
    console.error('[justjoin] fetch failed:', error);
    return [];
  }
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const j = await fetch();
  console.log(JSON.stringify(j, undefined, 2));
}
