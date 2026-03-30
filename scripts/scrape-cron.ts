import { scrapeAllBoards } from "../lib/scraper";
import { DEFAULT_PROFILE } from "../lib/profile";
import fs from "fs";
import path from "path";

const RESULTS_FILE = path.join(__dirname, "..", "public", "scraped-jobs.json");

async function main() {
  console.log(`[${new Date().toISOString()}] Starting job scrape...`);

  // Load existing scraped jobs
  let existingJobs: any[] = [];
  try {
    const raw = fs.readFileSync(RESULTS_FILE, "utf-8");
    existingJobs = JSON.parse(raw);
  } catch {
    // File doesn't exist yet or is invalid — start fresh
    existingJobs = [];
  }

  // Build set of existing URLs for deduplication
  const existingUrls = new Set<string>(
    existingJobs.map((job: any) => job.url).filter(Boolean)
  );

  // Scrape all boards
  const newJobs = await scrapeAllBoards(existingUrls, DEFAULT_PROFILE);

  // Merge new jobs with existing
  const merged = [...existingJobs, ...newJobs];

  // Ensure public directory exists
  const publicDir = path.dirname(RESULTS_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(merged, null, 2));

  console.log(
    `Found ${newJobs.length} new job(s). Total: ${merged.length} job(s).`
  );
}

main().catch(console.error);
