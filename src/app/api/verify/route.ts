import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { summarizeWithGemini } from "@/lib/gemini";

const NEWS_EVERYTHING = "https://newsapi.org/v2/everything";

async function fetchNewsContext(query: string) {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [] as any[];
  const url = `${NEWS_EVERYTHING}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5`;
  try {
    const res = await fetch(url, { headers: { "X-Api-Key": key }, next: { revalidate: 300 } });
    if (!res.ok) return [] as any[];
    const data = await res.json();
    const arts = Array.isArray(data?.articles) ? data.articles.slice(0, 5) : [];
    return arts.map((a: any) => ({
      title: a?.title || "",
      description: a?.description || "",
      source: a?.source?.name || "",
      publishedAt: a?.publishedAt || "",
      url: a?.url || "",
    }));
  } catch {
    return [] as any[];
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const plan = (session as any)?.subscription?.plan || "free";
  if (!session?.user || plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required" }, { status: 402 });
  }

  const body = await request.json().catch(() => ({}));
  const query: string = (body?.query || "").toString();
  const extra: string = (body?.context || "").toString();
  if (!query || query.length < 6) {
    return NextResponse.json({ error: "Provide a claim or question (>= 6 chars)." }, { status: 400 });
  }

  const sources = await fetchNewsContext(query);
  const sourcesText = sources
    .map((s: { title: string; description: string; source: string; publishedAt: string; url: string }, i: number) =>
      `(${i + 1}) ${s.title}\n${s.description}\nSource: ${s.source} | ${s.publishedAt} | ${s.url}`
    )
    .join("\n\n");

  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "").trim();
  if (!key) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  const prompt = `You are a strict fact-checker. Given a user claim and recent news snippets, answer with a verdict.
- Output JSON with fields: verdict (true|false|uncertain), confidence (0-100), reasoning (<=120 words), cited (array of URLs from provided list only).

Claim: ${query}
Extra context (optional): ${extra || "-"}
News snippets (may be partial or outdated):\n${sourcesText || "(none)"}
`;

  try {
    const text: string = await summarizeWithGemini(prompt);
    let raw = text || "";
    // Extract fenced JSON if present
    const fence = raw.match(/```json[\r\n]+([\s\S]*?)```/i) || raw.match(/```[\r\n]+([\s\S]*?)```/);
    if (fence && fence[1]) raw = fence[1];
    // If still mixed, try to capture first JSON object
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch {
      const objMatch = raw.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { parsed = JSON.parse(objMatch[0]); } catch {}
      }
    }
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json({
        verdict: "uncertain",
        confidence: 40,
        reasoning: raw || "Could not parse model response.",
        sources,
      });
    }
    return NextResponse.json({ ...parsed, sources });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Verification failed" }, { status: 502 });
  }
}
