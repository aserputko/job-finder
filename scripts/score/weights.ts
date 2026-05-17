export const WEIGHTS = {
  techStack: 0.4,
  seniority: 0.2,
  location: 0.15,
  compensation: 0.15,
  industry: 0.1,
} as const;

export const WEIGHTS_DESCRIPTION = `
Scoring weights (sum to 1.0):
- tech-stack overlap (React / TypeScript / Node.js / NestJS / AWS): ${String(WEIGHTS.techStack * 100)}%
- seniority fit (Senior / Lead): ${String(WEIGHTS.seniority * 100)}%
- location & remote policy: ${String(WEIGHTS.location * 100)}%
- compensation match (>= target): ${String(WEIGHTS.compensation * 100)}%
- industry / deal-breakers: ${String(WEIGHTS.industry * 100)}%
`.trim();
