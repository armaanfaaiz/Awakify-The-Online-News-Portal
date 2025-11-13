import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { summarizeWithGemini } from "@/lib/gemini";

const domainScores: Record<string, number> = {
  "apnews.com": 90,
  "reuters.com": 92,
  "bbc.com": 88,
  "nytimes.com": 85,
};

function heuristicScore(url: string, title: string, content?: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const base = domainScores[host] ?? 60;
    const t = `${title} ${content || ""}`.toLowerCase();
    let penalty = 0;
    const bait = ["you won't believe", "shocking", "exposed", "miracle", "secret", "unbelievable", "fake"];
    for (const b of bait) if (t.includes(b)) penalty += 10;
    const score = Math.max(10, Math.min(100, base - penalty));
    const labels: string[] = [];
    if (penalty >= 10) labels.push("possible_clickbait");
    if ((domainScores[host] ?? 60) < 60) labels.push("low_domain_credibility");
    return { score, labels, host };
  } catch {
    return { score: 50, labels: ["unknown_domain"], host: "" };
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const isPro = (session as any)?.subscription?.plan === "pro";
  const body = await request.json().catch(() => ({}));
  const url: string = body?.url || "";
  const title: string = body?.title || "";
  const content: string | undefined = body?.content;
  if (!url || !title) return NextResponse.json({ error: "Missing url/title" }, { status: 400 });

  const heur = heuristicScore(url, title, content);
  let reasoning: string | undefined;

  if (isPro && content && process.env.GOOGLE_GEMINI_API_KEY) {
    try {
      const prompt = `Assess factuality and credibility of the following article in 3-5 bullet points with a short verdict at end.\n\nTitle: ${title}\nURL: ${url}\nContent: ${content}`;
      reasoning = await summarizeWithGemini(prompt);
    } catch {}
  }

  return NextResponse.json({
    credibilityScore: heur.score,
    labels: heur.labels,
    sourceDomain: heur.host,
    reasoning,
  });
}
