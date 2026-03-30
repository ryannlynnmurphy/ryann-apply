import { NextRequest, NextResponse } from "next/server";
import { scrapeAllBoards } from "@/lib/scraper";
import { DEFAULT_PROFILE } from "@/lib/profile";

export async function POST(request: NextRequest) {
  try {
    let existingUrls: string[] = [];
    try {
      const body = await request.json();
      if (body?.existingUrls && Array.isArray(body.existingUrls)) {
        existingUrls = body.existingUrls;
      }
    } catch {
      // No body or invalid JSON -- use empty set (cron usage)
    }

    const result = await scrapeAllBoards(new Set(existingUrls), DEFAULT_PROFILE);
    return NextResponse.json({
      jobs: result.jobs,
      count: result.count,
      boardsScanned: result.boardsScanned,
      boardsFailed: result.boardsFailed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown scraper error";
    return NextResponse.json(
      { error: message, jobs: [], count: 0, boardsScanned: 0, boardsFailed: 0 },
      { status: 500 }
    );
  }
}
