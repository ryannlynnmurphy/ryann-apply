import { NextRequest, NextResponse } from "next/server";

const EXPIRED_SIGNALS = [
  "no longer accepting",
  "position has been filled",
  "this job is no longer",
  "expired",
  "this position is closed",
  "no longer available",
  "this job has been closed",
  "this listing has expired",
  "job is closed",
  "no longer open",
];

type ValidationStatus = "active" | "expired" | "unknown";

interface ValidationResult {
  url: string;
  status: ValidationStatus;
}

async function validateUrl(url: string): Promise<ValidationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    // Try HEAD first
    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; JobValidator/1.0)" },
      });
    } catch {
      // Fall back to GET if HEAD fails
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; JobValidator/1.0)" },
      });
    }

    if (response.status === 404 || response.status === 410) {
      return { url, status: "expired" };
    }

    if (!response.ok) {
      return { url, status: "unknown" };
    }

    // For GET responses, check body for expired signals
    if (response.body) {
      try {
        const text = await response.text();
        const lower = text.toLowerCase();
        const hasExpiredSignal = EXPIRED_SIGNALS.some((signal) =>
          lower.includes(signal)
        );
        if (hasExpiredSignal) {
          // For Greenhouse/Lever, also check if there's no application form
          const isJobBoard =
            url.includes("greenhouse.io") || url.includes("lever.co");
          if (isJobBoard) {
            const hasForm =
              lower.includes("<form") ||
              lower.includes("application-form") ||
              lower.includes("apply-button");
            if (!hasForm) {
              return { url, status: "expired" };
            }
          }
          return { url, status: "expired" };
        }
      } catch {
        // If we can't read body (e.g., HEAD was used), just treat as active
      }
    }

    return { url, status: "active" };
  } catch {
    return { url, status: "unknown" };
  } finally {
    clearTimeout(timeout);
  }
}

async function validateBatch(urls: string[]): Promise<ValidationResult[]> {
  return Promise.all(urls.map(validateUrl));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = body.urls;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty urls array" },
        { status: 400 }
      );
    }

    // Process in batches of 5
    const results: ValidationResult[] = [];
    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5);
      const batchResults = await validateBatch(batch);
      results.push(...batchResults);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Job validation failed:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
