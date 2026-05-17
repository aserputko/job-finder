/**
 * DOU.ua fetcher.
 * Scrapes the public JavaScript vacancies listing.
 */
import { isDealBreaker } from '../filters.ts';
import type { Job } from '../types.ts';
import { delay, hashJob, httpGet } from '../utils.ts';

const BASE = 'https://jobs.dou.ua';
const LIST = `${BASE}/vacancies/?category=JavaScript&exp=5plus&remote`;

export async function fetch(): Promise<Job[]> {
  try {
    const res = await httpGet(LIST, { headers: { accept: 'text/html' } });
    if (!res.ok) {
      console.error(`[dou] HTTP ${String(res.status)}`);
      return [];
    }
    const html = await res.text();

    const jobs: Job[] = [];
    // Each vacancy is wrapped in <li class="l-vacancy ...">
    const itemRe = /<li[^>]*class="[^"]*l-vacancy[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    const titleRe = /<a[^>]*class="[^"]*vt[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
    const companyRe = /<a[^>]*class="[^"]*company[^"]*"[^>]*>([\s\S]*?)<\/a>/i;
    const salaryRe = /<span[^>]*class="[^"]*salary[^"]*"[^>]*>([\s\S]*?)<\/span>/i;
    const cityRe = /<span[^>]*class="[^"]*cities[^"]*"[^>]*>([\s\S]*?)<\/span>/i;

    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(html)) !== null) {
      const block = m[1] ?? '';
      const t = titleRe.exec(block);
      if (!t) continue;
      const url = t[1] ?? '';
      const title = (t[2] ?? '').replaceAll(/<[^>]+>/g, '').trim();
      const company = (companyRe.exec(block)?.[1] ?? 'Unknown').replaceAll(/<[^>]+>/g, '').trim();
      const salary = salaryRe
        .exec(block)?.[1]
        ?.replaceAll(/<[^>]+>/g, '')
        .trim();
      const cities = (cityRe.exec(block)?.[1] ?? '').replaceAll(/<[^>]+>/g, '').trim();
      const location = /remote/i.test(cities) ? 'Remote' : cities || 'Unknown';

      const job: Job = {
        id: hashJob({ title, company, url }),
        source: 'dou',
        title,
        company,
        url,
        location,
        postedAt: new Date().toISOString(),
        description: block
          .replaceAll(/<[^>]+>/g, ' ')
          .replaceAll(/\s+/g, ' ')
          .trim()
          .slice(0, 4000),
        salary,
      };

      if (!isDealBreaker(job)) jobs.push(job);
    }

    await delay(1000);
    return jobs;
  } catch (error) {
    console.error('[dou] fetch failed:', error);
    return [];
  }
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const j = await fetch();
  console.log(JSON.stringify(j, undefined, 2));
}
