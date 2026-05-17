import type { ScoredJob } from '../types.ts';

/** Renders a ranked Markdown report of scored jobs, highest score first. */
export function generateReport(jobs: ScoredJob[], date: string, threshold: number): string {
  // eslint-disable-next-line unicorn/no-array-sort
  const ranked = [...jobs].sort((a, b) => b.score - a.score);
  const above = ranked.filter((j) => j.score >= threshold);

  const lines: string[] = [
    `# Daily Job Report — ${date}`,
    '',
    `**Total fetched:** ${String(jobs.length)}  `,
    `**Above threshold (≥ ${String(threshold)}):** ${String(above.length)}`,
    '',
  ];

  if (above.length === 0) {
    lines.push('_No matches above threshold today._');
    return lines.join('\n');
  }

  lines.push(
    '| Score | Title | Company | Location | Salary | Source | Link |',
    '| ----- | ----- | ------- | -------- | ------ | ------ | ---- |',
  );
  for (const j of above) {
    const title = j.title.replaceAll('|', String.raw`\|`);
    const company = j.company.replaceAll('|', String.raw`\|`);
    lines.push(
      `| ${String(j.score)} | ${title} | ${company} | ${j.location} | ${j.salary ?? '—'} | ${j.source} | [open](${j.url}) |`,
    );
  }

  lines.push('', '## Details');
  for (const j of above) {
    lines.push(
      '',
      `### ${String(j.score)} — ${j.title} @ ${j.company}`,
      `- **Location:** ${j.location}`,
      `- **Salary:** ${j.salary ?? '—'}`,
      `- **Source:** ${j.source}`,
      `- **URL:** ${j.url}`,
      '',
      `> ${j.reasoning}`,
    );
  }

  return lines.join('\n');
}
