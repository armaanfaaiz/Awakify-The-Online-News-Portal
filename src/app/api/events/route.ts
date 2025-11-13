import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/models/Event";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const body = await request.json().catch(() => ({}));
  const type = body?.type;
  const articleId = body?.articleId;
  if (!type || !articleId || !["view", "click"].includes(type)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await connectToDatabase();
  await Event.create({
    userId: (session as any)?.user?.id || null,
    articleId,
    type,
  });
  return NextResponse.json({ success: true });
}
