import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Stable 16-char id for deduplication: sha256(title + company + url). */
export function hashJob(input: { title: string; company: string; url: string }): string {
  return createHash('sha256')
    .update(`${input.title}|${input.company}|${input.url}`)
    .digest('hex')
    .slice(0, 16);
}

/**
 * Rough token truncation (~4 chars per token). Appends "[truncated]" if cut.
 * Cheap heuristic — avoids pulling in a tokenizer dependency.
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n[truncated]';
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/** Wrapper around fetch with a realistic UA and JSON helper. */
export async function httpGet(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('user-agent')) headers.set('user-agent', DEFAULT_USER_AGENT);
  return fetch(url, { ...init, headers });
}
