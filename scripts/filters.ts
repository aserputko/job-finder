import type { Job } from './types.ts';

const NO_REMOTE_PATTERNS = [
  /\bon[-\s]?site\s+only\b/i,
  /\bno\s+remote\b/i,
  /\b100%\s+on[-\s]?site\b/i,
  /\bfully\s+on[-\s]?site\b/i,
  /\boffice[-\s]?only\b/i,
];

const GAMBLING_PATTERNS = [
  /\bgambling\b/i,
  /\bbetting\b/i,
  /\bcasino\b/i,
  /\bigaming\b/i,
  /\bsportsbook\b/i,
];

/**
 * Returns true if the job matches a deal-breaker pattern and should be filtered
 * before scoring. Checks both location and description.
 */
export function isDealBreaker(job: Job): boolean {
  const haystack = `${job.location}\n${job.description}`;

  if (GAMBLING_PATTERNS.some((p) => p.test(haystack))) {
    return true;
  }

  // If the role explicitly says no-remote AND the location is not remote, reject.
  const locationLooksRemote = /\bremote\b/i.test(job.location);
  if (!locationLooksRemote && NO_REMOTE_PATTERNS.some((p) => p.test(haystack))) {
    return true;
  }

  return false;
}
