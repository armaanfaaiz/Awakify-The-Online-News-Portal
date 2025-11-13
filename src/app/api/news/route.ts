import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { categorize } from "@/lib/categorize";

const NEWSAPI_URL = "https://newsapi.org/v2/top-headlines";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "us";
  const category = searchParams.get("category") || "technology";
  const pageSize = searchParams.get("pageSize") || "12";
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing NEWSAPI_KEY" }, { status: 500 });
  }

  const url = `${NEWSAPI_URL}?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&pageSize=${encodeURIComponent(pageSize)}`;

  try {
    const session = await getServerSession(authOptions);
    const isPro = (session as any)?.subscription?.plan === "pro";
    const res = await fetch(url, {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `News API error ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const raw = Array.isArray(data.articles) ? data.articles : [];
    const articles = raw.map((a: any, i: number) => {
      const cats = categorize(`${a.title || ""}\n${a.description || ""}`);
      const base = {
        id: `${a.source?.id || "src"}-${i}`,
        title: a.title || "",
        source: a.source?.name || "",
        image: a.urlToImage || null,
        time: a.publishedAt || "",
        categories: cats,
      };
      if (isPro) {
        return {
          ...base,
          summary: a.description || "",
          url: a.url || "#",
          limited: false,
        };
      }
      // FREE users: no full news link and trimmed summary
      const desc: string = a.description || "";
      const short = desc ? (desc.length > 100 ? desc.slice(0, 100) + "…" : desc) : "Subscribe to read more";
      return {
        ...base,
        summary: short,
        url: null,
        limited: true,
      };
    });
    return NextResponse.json({ articles, limited: !isPro });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
