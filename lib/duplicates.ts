import type { Job } from "./types";

/**
 * Check if a job is likely a duplicate of an existing job.
 * Matches on same company (case-insensitive) + similar title.
 */
export function findDuplicate(
  newJob: { company: string; title: string },
  existingJobs: Job[]
): Job | null {
  const newCompany = newJob.company.toLowerCase().trim();
  const newTitle = newJob.title.toLowerCase().trim();

  for (const existing of existingJobs) {
    const existingCompany = existing.company.toLowerCase().trim();
    const existingTitle = existing.title.toLowerCase().trim();

    if (existingCompany !== newCompany) continue;

    // Exact title match
    if (existingTitle === newTitle) return existing;

    // Fuzzy: one title contains the other, or high word overlap
    if (existingTitle.includes(newTitle) || newTitle.includes(existingTitle)) {
      return existing;
    }

    // Word overlap check
    const newWords = new Set(newTitle.split(/\s+/));
    const existingWords = existingTitle.split(/\s+/);
    const overlap = existingWords.filter((w) => newWords.has(w)).length;
    const similarity = overlap / Math.max(newWords.size, existingWords.length);
    if (similarity >= 0.6) return existing;
  }

  return null;
}
