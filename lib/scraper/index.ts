import { Job, Profile } from "@/lib/types";
import { scoreJob } from "@/lib/scorer";
import { scrapeGreenhouse } from "./greenhouse";
import { scrapeLever } from "./lever";

export async function scrapeAllBoards(
  existingJobUrls: Set<string>,
  profile: Profile
): Promise<Job[]> {
  const [greenhouseResults, leverResults] = await Promise.all([
    scrapeGreenhouse(),
    scrapeLever(),
  ]);

  const combined = [...greenhouseResults, ...leverResults];

  const deduplicated = combined.filter(
    (job) => job.url && !existingJobUrls.has(job.url)
  );

  const scored = deduplicated.map((job) => {
    const fullJob = job as Job;
    fullJob.matchScore = scoreJob(fullJob, profile);
    return fullJob;
  });

  return scored;
}
