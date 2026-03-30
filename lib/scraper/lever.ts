import * as cheerio from "cheerio";
import { v4 as uuid } from "uuid";
import { Job } from "@/lib/types";
import { categorizeTitle } from "./greenhouse";

const LEVER_BOARDS = [
  "https://jobs.lever.co/mistral",
  "https://jobs.lever.co/superannotate",
  "https://jobs.lever.co/get-vocal-pbc",
  "https://jobs.lever.co/alltrails",
  "https://jobs.lever.co/thedispatch",
  "https://jobs.lever.co/djeholdings",
  "https://jobs.lever.co/cloudwalk",
  "https://jobs.lever.co/nphub",
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

  $(".posting").each((_, el) => {
    const anchor = $(el).find("a.posting-title");
    const title = anchor.find("h5").text().trim();
    if (!title || !matchesKeywords(title)) return;

    const url = anchor.attr("href") || "";
    const locationText = $(el)
      .find(".posting-categories .sort-by-location")
      .text()
      .trim();
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

export async function scrapeLever(): Promise<Partial<Job>[]> {
  const results: Partial<Job>[] = [];

  for (const board of LEVER_BOARDS) {
    try {
      const jobs = await scrapeBoard(board);
      results.push(...jobs);
    } catch {
      // skip silently on failure
    }
  }

  return results;
}
