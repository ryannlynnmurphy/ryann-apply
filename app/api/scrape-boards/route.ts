import { NextResponse } from "next/server";
import { scrapeAllBoards } from "@/lib/scraper";
import { DEFAULT_PROFILE } from "@/lib/profile";

export async function POST() {
  try {
    const jobs = await scrapeAllBoards(new Set(), DEFAULT_PROFILE);
    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown scraper error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
