import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Article } from "@/models/Article";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isPro = (session as any)?.subscription?.plan === "pro";
  await connectToDatabase();

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);

  const prefs = (session as any)?.preferences || {};
  const preferredCats: string[] = Array.isArray(prefs.categories) && prefs.categories.length ? prefs.categories : [];
  const preferredSources: string[] = Array.isArray(prefs.sources) && prefs.sources.length ? prefs.sources : [];

  const filter: any = {};
  if (preferredCats.length) filter.categories = { $in: preferredCats };
  if (preferredSources.length) filter.sourceName = { $in: preferredSources };

  const docs = await Article.find(filter).sort({ publishedAt: -1 }).limit(limit).lean();

  const articles = docs.map((a: any) => {
    const base = {
      id: a._id.toString(),
      title: a.title,
      source: a.sourceName,
      image: a.image || null,
      time: a.publishedAt || a.createdAt,
      categories: a.categories || [],
    };
    if (isPro) {
      return { ...base, summary: a.summary || "", url: a.url, limited: false };
    }
    const desc: string = a.summary || "";
    const short = desc ? (desc.length > 100 ? desc.slice(0, 100) + "…" : desc) : "Subscribe to read more";
    return { ...base, summary: short, url: null, limited: true };
  });

  return NextResponse.json({ articles, limited: !isPro });
}
