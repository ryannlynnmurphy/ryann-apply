import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

function truncate(str: string, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) : str;
}

function cleanText(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

function parseGreenhouse($: cheerio.CheerioAPI) {
  const title = cleanText(
    $("h1.app-title").first().text() || $("h1").first().text(),
  );
  const company = cleanText($(".company-name").first().text());
  const location = cleanText($(".location").first().text());
  const description = cleanText(
    ($("#content").text() || $(".content").text()).slice(0, 4000),
  );
  return { title, company, location, description };
}

function parseLever($: cheerio.CheerioAPI) {
  const title = cleanText($("h2").first().text());
  const company = cleanText(
    $(".posting-categories .sort-by-team").first().text(),
  );
  const location = cleanText(
    $(".posting-categories .sort-by-location").first().text(),
  );
  const description = cleanText(
    $(".section-wrapper .content").text().slice(0, 4000),
  );
  return { title, company, location, description };
}

function parseGeneric($: cheerio.CheerioAPI) {
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const title = cleanText(
    ogTitle || $("h1").first().text() || $("title").text(),
  );

  const company = cleanText(
    $('meta[property="og:site_name"]').attr("content") || "",
  );

  const ogDesc = $('meta[property="og:description"]').attr("content") || "";
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const bodyText = $("main").text() || $("body").text() || "";
  const description = cleanText(
    ogDesc || metaDesc || bodyText.slice(0, 2000),
  );

  const location = "";
  return { title, company, location, description };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${res.status}` },
        { status: 500 },
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let parsed: {
      title: string;
      company: string;
      location: string;
      description: string;
    };

    const lowerUrl = url.toLowerCase();
    let applyTier: "one-click" | "guided";

    if (lowerUrl.includes("greenhouse.io")) {
      parsed = parseGreenhouse($);
      applyTier = "one-click";
    } else if (lowerUrl.includes("lever.co")) {
      parsed = parseLever($);
      applyTier = "one-click";
    } else {
      parsed = parseGeneric($);
      applyTier = "guided";
    }

    return NextResponse.json({
      title: truncate(parsed.title, 200),
      company: truncate(parsed.company, 100),
      location: truncate(parsed.location, 100),
      description: truncate(parsed.description, 4000),
      applyTier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to parse job: ${message}` },
      { status: 500 },
    );
  }
}
