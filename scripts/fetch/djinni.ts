/**
 * Djinni fetcher.
 * Lightweight HTML scrape of the public listing page.
 * No auth required for the browse view.
 */
import { isDealBreaker } from '../filters.ts';
import type { Job } from '../types.ts';
import { delay, hashJob, httpGet } from '../utils.ts';

const BASE = 'https://djinni.co';
const LIST = `${BASE}/jobs/?primary_keyword=JavaScript&primary_keyword=Fullstack&primary_keyword=Node.js&primary_keyword=React.js&exp_level=5y&exp_level=lead&employment=remote`;

export async function fetch(): Promise<Job[]> {
  try {
    const res = await httpGet(LIST, { headers: { accept: 'text/html' } });
    if (!res.ok) {
      console.error(`[djinni] HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();

    const jobs: Job[] = [];
    // Each posting is rendered as <li class="list-jobs__item ..."> with an <a class="job-item__title-link" href="/jobs/123/">
    const itemRe = /<li[^>]*class="[^"]*list-jobs__item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    const titleRe =
      /<a[^>]*class="[^"]*job-item__title-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
    const companyRe = /<a[^>]*class="[^"]*mr-2[^"]*"[^>]*>([\s\S]*?)<\/a>/i;
    const salaryRe = /<span[^>]*class="[^"]*public-salary-item[^"]*"[^>]*>([\s\S]*?)<\/span>/i;

    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(html)) !== null) {
      const block = m[1] ?? '';
      const t = titleRe.exec(block);
      if (!t) continue;
      const href = t[1] ?? '';
      const title = (t[2] ?? '').replace(/<[^>]+>/g, '').trim();
      const url = href.startsWith('http') ? href : `${BASE}${href}`;
      const company = (companyRe.exec(block)?.[1] ?? 'Unknown').replace(/<[^>]+>/g, '').trim();
      const salary = salaryRe
        .exec(block)?.[1]
        ?.replace(/<[^>]+>/g, '')
        .trim();

      const job: Job = {
        id: hashJob({ title, company, url }),
        source: 'djinni',
        title,
        company,
        url,
        location: 'Remote',
        postedAt: new Date().toISOString(),
        description: block
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000),
        salary,
      };

      if (!isDealBreaker(job)) jobs.push(job);
    }

    await delay(1000);
    return jobs;
  } catch (err) {
    console.error('[djinni] fetch failed:', err);
    return [];
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetch().then((j) => console.log(JSON.stringify(j, null, 2)));
}
