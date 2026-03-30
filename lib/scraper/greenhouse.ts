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
  // Embed-format boards
  "https://boards.greenhouse.io/embed/job_board?for=openai",
  "https://boards.greenhouse.io/embed/job_board?for=figma",
  "https://boards.greenhouse.io/embed/job_board?for=notion",
  "https://boards.greenhouse.io/embed/job_board?for=vercel",
  "https://boards.greenhouse.io/embed/job_board?for=stripe",
  "https://boards.greenhouse.io/embed/job_board?for=duolingo",
  "https://boards.greenhouse.io/embed/job_board?for=elevenlabs",
  "https://boards.greenhouse.io/embed/job_board?for=runway",
  "https://boards.greenhouse.io/embed/job_board?for=stability",
  "https://boards.greenhouse.io/embed/job_board?for=huggingface",
  "https://boards.greenhouse.io/embed/job_board?for=cohere",
  "https://boards.greenhouse.io/embed/job_board?for=replicate",
  "https://boards.greenhouse.io/embed/job_board?for=midjourney",
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
  "intern",
  "coordinator",
  "specialist",
  "analyst",
  "trainee",
  "program",
  "editorial",
  "narrative",
  "design",
  "ux writing",
  "conversation design",
  "technical writing",
  "documentation",
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

function isEmbedBoard(boardUrl: string): boolean {
  return boardUrl.includes("/embed/job_board?for=");
}

function companyFromUrl(boardUrl: string): string {
  if (isEmbedBoard(boardUrl)) {
    const url = new URL(boardUrl);
    return url.searchParams.get("for") || "unknown";
  }
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
  const embed = isEmbedBoard(boardUrl);

  // Embed boards use div.opening with span.location; standard boards use .opening with .location
  const selector = embed ? "div.opening" : ".opening";

  $(selector).each((_, el) => {
    const anchor = $(el).find("a");
    const title = anchor.text().trim();
    if (!title || !matchesKeywords(title)) return;

    let url = anchor.attr("href") || "";
    if (url.startsWith("/")) {
      const base = new URL(boardUrl);
      url = `${base.origin}${url}`;
    }

    const locationText = embed
      ? $(el).find("span.location").text().trim()
      : $(el).find(".location").text().trim();
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

export interface ScrapeResult {
  jobs: Partial<Job>[];
  boardsScanned: number;
  boardsFailed: number;
}

export async function scrapeGreenhouse(): Promise<ScrapeResult> {
  const results: Partial<Job>[] = [];
  let boardsScanned = 0;
  let boardsFailed = 0;

  for (const board of GREENHOUSE_BOARDS) {
    try {
      const jobs = await scrapeBoard(board);
      results.push(...jobs);
      boardsScanned++;
    } catch (err) {
      boardsFailed++;
      console.error(`Greenhouse scrape failed for ${board}:`, err);
    }
  }

  return { jobs: results, boardsScanned, boardsFailed };
}
