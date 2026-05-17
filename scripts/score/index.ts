import type { Job, ScoredJob } from '../types.ts';
import { delay, truncateToTokens } from '../utils.ts';
import { llm } from './llm.ts';
import { WEIGHTS_DESCRIPTION } from './weights.ts';

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 2000;

function buildPrompt(job: Job, cvText: string): string {
  const description = truncateToTokens(job.description, 2000);
  return `You are a strict technical recruiter. Score how well the job below matches the candidate.

${WEIGHTS_DESCRIPTION}

Return ONLY a JSON object with this exact shape:
{"score": <integer 0-100>, "reasoning": "<1-3 sentence justification>"}

=== CANDIDATE CV ===
${cvText}

=== JOB ===
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary ?? 'n/a'}
Source: ${job.source}
URL: ${job.url}

Description:
${description}
`;
}

function parseResponse(raw: string): { score: number; reasoning: string } {
  try {
    // Strip markdown code fences if present.
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned) as { score?: unknown; reasoning?: unknown };
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score ?? 0))));
    const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : '';
    return { score, reasoning };
  } catch {
    return { score: 0, reasoning: `Failed to parse LLM response: ${raw.slice(0, 200)}` };
  }
}

async function scoreOne(job: Job, cvText: string): Promise<ScoredJob> {
  const prompt = buildPrompt(job, cvText);
  const raw = await llm(prompt);
  const { score, reasoning } = parseResponse(raw);
  return { ...job, score, reasoning };
}

/** Scores jobs in batches of 5 with a 2-second delay between batches. */
export async function scoreJobs(jobs: Job[], cvText: string): Promise<ScoredJob[]> {
  const out: ScoredJob[] = [];

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const scored = await Promise.all(batch.map((j) => scoreOne(j, cvText)));
    out.push(...scored);
    console.log(
      `[score] ${String(Math.min(i + BATCH_SIZE, jobs.length))} / ${String(jobs.length)}`,
    );
    if (i + BATCH_SIZE < jobs.length) await delay(BATCH_DELAY_MS);
  }

  return out;
}
