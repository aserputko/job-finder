/**
 * Builds cv/master.md into cv/build/cv.pdf using md-to-pdf.
 */
import { mdToPdf } from 'md-to-pdf';
import { PATHS } from './config.ts';
import { ensureDir } from './utils.ts';

async function main(): Promise<void> {
  await ensureDir(PATHS.cvBuild);
  const pdf = await mdToPdf({ path: PATHS.cvMaster }, { dest: PATHS.cvBuild });
  if (!pdf) throw new Error('md-to-pdf returned no result');
  console.log(`CV → ${PATHS.cvBuild}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
