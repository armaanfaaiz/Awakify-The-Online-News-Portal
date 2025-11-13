import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session as any).user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const u = await User.findById((session as any).user.id).select("subscription").lean<IUser | null>();
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subscription: u.subscription });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session as any).user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const allowedPlans = new Set(["free", "pro", "enterprise"]);
  const allowedStatus = new Set(["active", "expired", "canceled"]);

  const update: any = {};
  if (body.plan) {
    if (!allowedPlans.has(body.plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    update["subscription.plan"] = body.plan;
  }
  if (body.status) {
    if (!allowedStatus.has(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    update["subscription.status"] = body.status;
  }
  if (body.expiresAt !== undefined) {
    const date = body.expiresAt ? new Date(body.expiresAt) : null;
    if (date && isNaN(date.getTime())) return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
    update["subscription.expiresAt"] = date;
  }
  if (body.canceledAt !== undefined) {
    const date = body.canceledAt ? new Date(body.canceledAt) : null;
    if (date && isNaN(date.getTime())) return NextResponse.json({ error: "Invalid canceledAt" }, { status: 400 });
    update["subscription.canceledAt"] = date;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await User.findByIdAndUpdate((session as any).user.id, { $set: update }, { new: true })
    .select("subscription")
    .lean<IUser | null>();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subscription: updated.subscription });
}
