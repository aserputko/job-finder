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
      console.error(`[djinni] HTTP ${String(res.status)}`);
      return [];
    }
    const html = await res.text();

    const jobs: Job[] = [];
    // Each posting is rendered as <div id="job-item-{id}" class="job-item ...">
    // Split HTML into per-job blocks using the id attribute as a delimiter.
    const idRe = /id="job-item-(\d+)"/g;
    const positions: Array<{ start: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = idRe.exec(html)) !== null) {
      positions.push({ start: m.index });
    }

    const hrefRe = /href="(\/jobs\/[^"]+)"/i;
    const titleRe = /<h2[^>]*class="[^"]*job-item__position[^"]*"[^>]*>([\s\S]*?)<\/h2>/i;
    const companyRe = /<span[^>]*class="[^"]*text-gray-800[^"]*"[^>]*>([\s\S]*?)<\/span>/i;
    const salaryRe =
      /<span[^>]*class="[^"]*text-body-tertiary fw-medium[^"]*"[^>]*data-toggle="tooltip"[^>]*>([\s\S]*?)<\/span>/i;

    for (let i = 0; i < positions.length; i++) {
      const start = positions[i].start ?? 0;
      const end = positions[i + 1]?.start ?? html.length;
      const block = html.slice(start, end);

      const href = hrefRe.exec(block)?.[1] ?? '';
      const title = (titleRe.exec(block)?.[1] ?? '').replaceAll(/<[^>]+>/g, '').trim();
      if (!href || !title) continue;

      const url = href.startsWith('http') ? href : `${BASE}${href}`;
      const company = (companyRe.exec(block)?.[1] ?? 'Unknown').replaceAll(/<[^>]+>/g, '').trim();
      const salary = salaryRe
        .exec(block)?.[1]
        ?.replaceAll(/<[^>]+>/g, '')
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
    console.error('[djinni] fetch failed:', error);
    return [];
  }
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const j = await fetch();
  console.log(JSON.stringify(j, undefined, 2));
}
