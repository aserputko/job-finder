export interface Job {
  /** sha256(title + company + url).slice(0, 16) */
  id: string;
  /** Job board identifier, e.g. "justjoin.it" */
  source: string;
  title: string;
  company: string;
  url: string;
  /** "Remote" if fully remote, otherwise city/country */
  location: string;
  /** ISO-8601 date string */
  postedAt: string;
  /** Full job description text (used for LLM scoring) */
  description: string;
  /** Raw salary string if available */
  salary?: string;
}

export interface ScoredJob extends Job {
  score: number;
  reasoning: string;
}

export interface CandidateProfile {
  name: string;
  title: string;
  location: string;
  languages: string[];
  techStack: string[];
  targetRoles: string[];
  targetSalaryUsd: number;
  dealBreakers: string[];
  /** Full CV markdown text */
  cvText: string;
}
