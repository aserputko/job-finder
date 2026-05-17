/**
 * Entry point for `npm run score`.
 * Reads today's fetched jobs, scores them with the LLM against cv/master.md,
 * and writes a ranked Markdown report to data/reports/YYYY-MM-DD.md.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PATHS, SCORE_THRESHOLD } from './config.ts';
import { generateReport } from './report/index.ts';
import { scoreJobs } from './score/index.ts';
import type { Job } from './types.ts';
import { ensureDir, todayIso } from './utils.ts';

async function main(): Promise<void> {
  const date = todayIso();
  const jobsPath = join(PATHS.jobsDir, `${date}.json`);
  const reportPath = join(PATHS.reportsDir, `${date}.md`);

  let jobs: Job[];
  try {
    jobs = JSON.parse(await readFile(jobsPath, 'utf8')) as Job[];
  } catch (err) {
    console.error(`Cannot read ${jobsPath}. Run \`npm run fetch\` first.`, err);
    process.exit(1);
  }

  let cvText: string;
  try {
    cvText = await readFile(PATHS.cvMaster, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${PATHS.cvMaster}. Create it from the template.`, err);
    process.exit(1);
  }

  console.log(`Scoring ${jobs.length} jobs...`);
  const scored = await scoreJobs(jobs, cvText);

  const md = generateReport(scored, date, SCORE_THRESHOLD);
  await ensureDir(reportPath);
  await writeFile(reportPath, md, 'utf8');

  // Also persist the scored JSON for later analysis.
  const jsonPath = reportPath.replace(/\.md$/, '.json');
  await writeFile(jsonPath, JSON.stringify(scored, null, 2), 'utf8');

  console.log(`Report → ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
