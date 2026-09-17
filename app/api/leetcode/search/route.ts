import { NextRequest, NextResponse } from "next/server";

function extractLeetCodeUrls(html: string): string[] {
  const urls: string[] = [];

  const googleUrlRegex =
    /\/url\?q=(https?:\/\/leetcode\.com\/problems\/[^&"<>]+)/gi;

  let match;

  while ((match = googleUrlRegex.exec(html)) !== null) {
    urls.push(decodeURIComponent(match[1]));
  }

  const directUrlRegex =
    /https?:\/\/(?:www\.)?leetcode\.com\/problems\/[a-zA-Z0-9_-]+\/?/gi;

  while ((match = directUrlRegex.exec(html)) !== null) {
    urls.push(match[0]);
  }

  return [...new Set(urls)];
}

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const query = `${topic} site:leetcode.com/problems/`;

    const googleUrl =
      `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;

    console.log("Searching Google:", query);

    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/150.0.0.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

        "Accept-Language": "en-US,en;q=0.9",
      },

      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Google status:", response.status);

      return NextResponse.json(
        { error: `Google returned ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    console.log("Google HTML length:", html.length);

    const urls = extractLeetCodeUrls(html);

    console.log("LeetCode URLs found:", urls);

    if (urls.length === 0) {
      return NextResponse.json(
        {
          error: "No LeetCode problem found",
          query,
        },
        { status: 404 }
      );
    }

    const firstUrl = urls[0];

    return NextResponse.json({
      url: firstUrl,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
