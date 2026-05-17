import 'dotenv/config';

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const LLM_PROVIDER = env('LLM_PROVIDER', 'openai') as 'openai' | 'anthropic';
export const LLM_MODEL = env('LLM_MODEL', 'gpt-4o-mini');
export const LLM_API_KEY = env('LLM_API_KEY', '');
export const SCORE_THRESHOLD = Number(env('SCORE_THRESHOLD', '70'));

export const SOURCES = ['nofluffjobs', 'justjoin.it', 'djinni', 'dou', 'linkedin'] as const;

export type Source = (typeof SOURCES)[number];

export const PATHS = {
  jobsDir: 'data/jobs',
  reportsDir: 'data/reports',
  cvMaster: 'cv/master.md',
  cvBuild: 'cv/build/cv.pdf',
} as const;
