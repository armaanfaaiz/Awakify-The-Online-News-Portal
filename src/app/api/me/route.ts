import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session as any).user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const u = await User.findById((session as any).user.id).select("name email roles subscription preferences createdAt updatedAt").lean();
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user: u });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session as any).user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const update: any = {};
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (body.preferences && typeof body.preferences === "object") {
    update.preferences = {};
    if (Array.isArray(body.preferences.categories)) update.preferences.categories = body.preferences.categories;
    if (Array.isArray(body.preferences.regions)) update.preferences.regions = body.preferences.regions;
    if (Array.isArray(body.preferences.sources)) update.preferences.sources = body.preferences.sources;
    if (typeof body.preferences.language === "string") update.preferences.language = body.preferences.language;
  }
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }
  await connectToDatabase();
  const updated = await User.findByIdAndUpdate((session as any).user.id, { $set: update }, { new: true })
    .select("name email roles subscription preferences createdAt updatedAt")
    .lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user: updated });
}
