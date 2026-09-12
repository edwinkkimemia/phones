import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public: subscribe (email capture for deal alerts + discount popup).
export async function POST(req: Request) {
  const Body = z.object({
    email: z.string().email("Enter a valid email address."),
    source: z.string().max(40).optional(),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email" }, { status: 400 });
  }
  try {
    await prisma.newsletter.upsert({
      where: { email: parsed.data.email.toLowerCase().trim() },
      update: { active: true, source: parsed.data.source ?? "website" },
      create: { email: parsed.data.email.toLowerCase().trim(), source: parsed.data.source ?? "website" },
    });
    return NextResponse.json({ ok: true, message: "You're on the list! Watch your inbox for deal alerts." });
  } catch {
    return NextResponse.json({ error: "Subscription failed — try again." }, { status: 503 });
  }
}

// Admin: list subscribers.
export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session as { role?: string } | null)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const subs = await prisma.newsletter.findMany({ orderBy: { createdAt: "desc" }, take: 2000 });
    return NextResponse.json({ subscribers: subs });
  } catch {
    return NextResponse.json({ subscribers: [] });
  }
}
