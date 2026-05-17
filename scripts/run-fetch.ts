/**
 * Entry point for `npm run fetch`.
 * Runs every registered fetcher, deduplicates against historical job ids,
 * and writes today's batch to data/jobs/YYYY-MM-DD.json.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PATHS } from './config.ts';
import { runAllFetchers } from './fetch/index.ts';
import type { Job } from './types.ts';
import { ensureDir, todayIso } from './utils.ts';

async function loadKnownIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  try {
    const files = await readdir(PATHS.jobsDir);
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      try {
        const data = JSON.parse(await readFile(join(PATHS.jobsDir, f), 'utf8')) as Job[];
        for (const j of data) ids.add(j.id);
      } catch {
        // ignore corrupt file
      }
    }
  } catch {
    // jobsDir doesn't exist yet — fine
  }
  return ids;
}

async function main(): Promise<void> {
  const date = todayIso();
  const known = await loadKnownIds();
  const all = await runAllFetchers();

  const seen = new Set<string>();
  const unique = all.filter((j) => {
    if (known.has(j.id) || seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });

  const outPath = join(PATHS.jobsDir, `${date}.json`);
  await ensureDir(outPath);
  await writeFile(outPath, JSON.stringify(unique, null, 2), 'utf8');

  console.log(`Fetched ${all.length} jobs (${unique.length} new) → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
