import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { summarizeWithGemini } from "@/lib/gemini";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const plan = (session as any)?.subscription?.plan || "free";
  if (!session?.user || plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required" }, { status: 402 });
  }

  const body = await request.json().catch(() => ({}));
  const text: string | undefined = body?.text;
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Invalid text. Provide some article text (>= 10 chars)." }, { status: 400 });
  }

  try {
    const summary = await summarizeWithGemini(text);
    return NextResponse.json({ summary });
  } catch (err: any) {
    const message = err?.message || "Summarization failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
