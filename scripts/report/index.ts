import type { ScoredJob } from '../types.ts';

/** Renders a ranked Markdown report of scored jobs, highest score first. */
export function generateReport(jobs: ScoredJob[], date: string, threshold: number): string {
  const ranked = [...jobs].sort((a, b) => b.score - a.score);
  const above = ranked.filter((j) => j.score >= threshold);

  const lines: string[] = [];
  lines.push(`# Daily Job Report — ${date}`);
  lines.push('');
  lines.push(`**Total fetched:** ${jobs.length}  `);
  lines.push(`**Above threshold (≥ ${threshold}):** ${above.length}`);
  lines.push('');

  if (above.length === 0) {
    lines.push('_No matches above threshold today._');
    return lines.join('\n');
  }

  lines.push('| Score | Title | Company | Location | Salary | Source | Link |');
  lines.push('| ----- | ----- | ------- | -------- | ------ | ------ | ---- |');
  for (const j of above) {
    const title = j.title.replace(/\|/g, '\\|');
    const company = j.company.replace(/\|/g, '\\|');
    lines.push(
      `| ${j.score} | ${title} | ${company} | ${j.location} | ${j.salary ?? '—'} | ${j.source} | [open](${j.url}) |`,
    );
  }

  lines.push('');
  lines.push('## Details');
  for (const j of above) {
    lines.push('');
    lines.push(`### ${j.score} — ${j.title} @ ${j.company}`);
    lines.push(`- **Location:** ${j.location}`);
    lines.push(`- **Salary:** ${j.salary ?? '—'}`);
    lines.push(`- **Source:** ${j.source}`);
    lines.push(`- **URL:** ${j.url}`);
    lines.push('');
    lines.push(`> ${j.reasoning}`);
  }

  return lines.join('\n');
}
