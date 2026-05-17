---
applyTo: "scripts/score/**"
---

# LLM Scoring Conventions

- **Score range**: integer 0–100. Return `{ score: number, reasoning: string }`.
- **Prompt** must include: candidate profile summary (from `cv/master.md`) + full job description.
- **Weights** are defined in `scripts/score/weights.ts` — do not hardcode them in prompts.
- **Provider abstraction**: call `llm()` from `./llm.ts`, never call OpenAI/Anthropic SDK directly in scoring logic.
- **Token budget**: truncate job descriptions to 2000 tokens before sending; append `[truncated]` if cut.
- **Batch scoring**: process jobs in batches of 5 with a 2-second delay between batches.
- **Threshold**: import `SCORE_THRESHOLD` from `../../config.ts`; default is `70`.
