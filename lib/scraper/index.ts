import { Job, Profile } from "@/lib/types";
import { scoreJob } from "@/lib/scorer";
import { scrapeGreenhouse } from "./greenhouse";
import { scrapeLever } from "./lever";

export interface ScrapeAllResult {
  jobs: Job[];
  count: number;
  boardsScanned: number;
  boardsFailed: number;
}

export async function scrapeAllBoards(
  existingJobUrls: Set<string>,
  profile: Profile
): Promise<ScrapeAllResult> {
  const [greenhouseResult, leverResult] = await Promise.all([
    scrapeGreenhouse(),
    scrapeLever(),
  ]);

  const combined = [...greenhouseResult.jobs, ...leverResult.jobs];
  const boardsScanned = greenhouseResult.boardsScanned + leverResult.boardsScanned;
  const boardsFailed = greenhouseResult.boardsFailed + leverResult.boardsFailed;

  const deduplicated = combined.filter(
    (job) => job.url && !existingJobUrls.has(job.url)
  );

  const scored = deduplicated.map((job) => {
    const fullJob = job as Job;
    fullJob.matchScore = scoreJob(fullJob, profile);
    return fullJob;
  });

  return { jobs: scored, count: scored.length, boardsScanned, boardsFailed };
}
