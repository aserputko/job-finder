/**
 * Builds a Markdown CV into a PDF using md-to-pdf.
 *
 * Usage:
 *   tsx scripts/build-cv.ts                          # cv/master.md → cv/build/cv.pdf
 *   tsx scripts/build-cv.ts <input.md> [output.pdf]  # custom input/output
 *
 * When only an input is given, the output is written next to it with the same
 * basename and a `.pdf` extension (e.g. cv/tailored/Foo.md → cv/tailored/Foo.pdf).
 */
import { mdToPdf } from 'md-to-pdf';
import path from 'node:path';
import { PATHS } from './config.ts';
import { ensureDir } from './utils.ts';

const STYLESHEET = 'cv/style.css';

async function main(): Promise<void> {
  const [inputArg, outputArg] = process.argv.slice(2);

  const input = inputArg ?? PATHS.cvMaster;
  const output =
    outputArg ??
    (inputArg
      ? path.join(path.dirname(input), `${path.basename(input, path.extname(input))}.pdf`)
      : PATHS.cvBuild);

  await ensureDir(output);
  const pdf = await mdToPdf(
    { path: input },
    {
      dest: output,
      stylesheet: [STYLESHEET],
      pdf_options: {
        format: 'A4',
        margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
        printBackground: true,
      },
    },
  );
  if (!pdf) throw new Error('md-to-pdf returned no result');
  console.log(`CV → ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
