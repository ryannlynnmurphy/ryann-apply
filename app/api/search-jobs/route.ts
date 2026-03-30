import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import type { Job } from "@/lib/types";

interface SearchResult {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  remote: boolean;
  salary?: string;
}

async function fetchWithTimeout(
  url: string,
  opts: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function searchRemotive(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=20`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = data.jobs || [];
    return jobs.map((j: Record<string, unknown>) => ({
      title: String(j.title || ""),
      company: String(j.company_name || ""),
      location: String(j.candidate_required_location || "Remote"),
      url: String(j.url || ""),
      description: String(j.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
      remote: true,
      salary: j.salary ? String(j.salary) : undefined,
    }));
  } catch {
    return [];
  }
}

async function searchArbeitnow(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const data = await res.json();
    const jobs = data.data || [];
    return jobs.slice(0, 20).map((j: Record<string, unknown>) => ({
      title: String(j.title || ""),
      company: String(j.company_name || ""),
      location: String(j.location || ""),
      url: String(j.url || ""),
      description: String(j.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
      remote: Boolean(j.remote),
      salary: undefined,
    }));
  } catch {
    return [];
  }
}

function toJob(result: SearchResult): Job {
  // Infer category from title
  const titleLower = result.title.toLowerCase();
  let category = "General";
  if (/engineer|developer|software|frontend|backend|fullstack|devops/.test(titleLower)) {
    category = "Engineering";
  } else if (/design|ux|ui|graphic|creative/.test(titleLower)) {
    category = "Design";
  } else if (/product|manager|program|project/.test(titleLower)) {
    category = "Product";
  } else if (/market|growth|seo|content|social/.test(titleLower)) {
    category = "Marketing";
  } else if (/writer|editor|copy|commun/.test(titleLower)) {
    category = "Writing";
  } else if (/data|analy|science|machine|ai|ml/.test(titleLower)) {
    category = "Data";
  } else if (/ops|operations|coordinator|admin/.test(titleLower)) {
    category = "Operations";
  } else if (/sales|business dev|account/.test(titleLower)) {
    category = "Sales";
  }

  return {
    id: uuid(),
    title: result.title,
    company: result.company,
    location: result.location,
    remote: result.remote,
    salary: result.salary,
    url: result.url,
    source: "scraped",
    category,
    description: result.description,
    requirements: [],
    matchScore: 0,
    whyYou: [],
    applyTier: "guided",
    status: "new",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location } = body as {
      query: string;
      location?: string;
    };

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    const searchQuery = location
      ? `${query} ${location}`
      : query;

    // Search multiple sources in parallel
    const [remotiveResults, arbeitnowResults] = await Promise.all([
      searchRemotive(query),
      searchArbeitnow(searchQuery),
    ]);

    // Combine and deduplicate by URL
    const allResults = [...remotiveResults, ...arbeitnowResults];
    const seen = new Set<string>();
    const uniqueResults: SearchResult[] = [];
    for (const result of allResults) {
      if (result.url && !seen.has(result.url)) {
        seen.add(result.url);
        uniqueResults.push(result);
      }
    }

    // Filter by location if specified
    let filtered = uniqueResults;
    if (location) {
      const locLower = location.toLowerCase();
      if (locLower === "remote") {
        filtered = uniqueResults.filter((r) => r.remote);
      } else {
        filtered = uniqueResults.filter(
          (r) =>
            r.location.toLowerCase().includes(locLower) ||
            r.remote
        );
      }
    }

    const jobs: Job[] = filtered.map(toJob);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Job search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
