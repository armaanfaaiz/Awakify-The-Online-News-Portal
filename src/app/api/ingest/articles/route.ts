import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Source } from "@/models/Source";
import { categorize } from "@/lib/categorize";
import crypto from "crypto";

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json().catch(() => ({}));
  const items: any[] = Array.isArray(body?.articles) ? body.articles : [];
  if (!items.length) return NextResponse.json({ error: "No articles" }, { status: 400 });

  let created = 0;
  let skipped = 0;

  for (const a of items) {
    const title: string = a.title || "";
    const url: string = a.url || "";
    const sourceName: string = a.sourceName || a.source || "";
    const sourceDomain: string = (a.sourceDomain || (new URL(url).hostname)).replace(/^www\./, "");
    const image: string | null = a.image || null;
    const publishedAt = a.publishedAt ? new Date(a.publishedAt) : null;
    const summary: string = a.summary || a.description || "";
    const content: string = a.content || "";

    if (!title || !url || !sourceName) { skipped++; continue; }

    const fingerprint = crypto.createHash("sha1").update(`${sourceDomain}|${title}`).digest("hex");

    const categories = categorize(`${title}\n${summary}\n${content}`);

    try {
      await Source.updateOne(
        { domain: sourceDomain },
        { $setOnInsert: { name: sourceName, domain: sourceDomain } },
        { upsert: true }
      );

      const existing = await Article.findOne({ fingerprint }).select("_id");
      if (existing) { skipped++; continue; }

      await Article.create({
        title,
        url,
        sourceName,
        sourceDomain,
        image,
        publishedAt,
        summary,
        content,
        categories,
        fingerprint,
      });
      created++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ created, skipped });
}
