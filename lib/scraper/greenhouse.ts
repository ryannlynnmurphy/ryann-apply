import * as cheerio from "cheerio";
import { v4 as uuid } from "uuid";
import { Job } from "@/lib/types";

const GREENHOUSE_BOARDS = [
  "https://boards.greenhouse.io/anthropic",
  "https://boards.greenhouse.io/thenewyorktimes",
  "https://boards.greenhouse.io/outlier",
  "https://job-boards.greenhouse.io/outlierai",
  "https://job-boards.greenhouse.io/labelbox",
  "https://job-boards.greenhouse.io/10alabs",
  "https://job-boards.eu.greenhouse.io/wonderstudios",
];

const KEYWORDS = [
  "creative",
  "writer",
  "copywriter",
  "content",
  "community",
  "social media",
  "fellow",
  "junior",
  "entry",
  "associate",
  "ai",
  "safety",
  "red team",
  "developer relations",
];

export function categorizeTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("safety") || t.includes("red team")) return "ai-safety";
  if (t.includes("copy") || t.includes("writer") || t.includes("editorial"))
    return "copywriting";
  if (t.includes("community") || t.includes("social")) return "community";
  if (t.includes("developer relation") || t.includes("devrel")) return "devrel";
  if (t.includes("fellow")) return "fellowship";
  return "general";
}

function matchesKeywords(title: string): boolean {
  const t = title.toLowerCase();
  return KEYWORDS.some((kw) => t.includes(kw));
}

function companyFromUrl(boardUrl: string): string {
  const parts = new URL(boardUrl).pathname.split("/").filter(Boolean);
  return parts[0] || "unknown";
}

async function scrapeBoard(boardUrl: string): Promise<Partial<Job>[]> {
  const res = await fetch(boardUrl, {
    headers: { "User-Agent": "RyannApply/1.0" },
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const company = companyFromUrl(boardUrl);
  const jobs: Partial<Job>[] = [];

  $(".opening").each((_, el) => {
    const anchor = $(el).find("a");
    const title = anchor.text().trim();
    if (!title || !matchesKeywords(title)) return;

    let url = anchor.attr("href") || "";
    if (url.startsWith("/")) {
      const base = new URL(boardUrl);
      url = `${base.origin}${url}`;
    }

    const locationText = $(el).find(".location").text().trim();
    const remote =
      /remote/i.test(locationText) || /anywhere/i.test(locationText);

    jobs.push({
      id: uuid(),
      title,
      company,
      location: locationText,
      remote,
      url,
      source: "scraped",
      category: categorizeTitle(title),
      description: "",
      requirements: [],
      matchScore: 0,
      whyYou: [],
      applyTier: "one-click",
      status: "new",
    });
  });

  return jobs;
}

export async function scrapeGreenhouse(): Promise<Partial<Job>[]> {
  const results: Partial<Job>[] = [];

  for (const board of GREENHOUSE_BOARDS) {
    try {
      const jobs = await scrapeBoard(board);
      results.push(...jobs);
    } catch {
      // skip silently on failure
    }
  }

  return results;
}
