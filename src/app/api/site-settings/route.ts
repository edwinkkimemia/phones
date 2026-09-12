import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SITE_DEFAULTS, SITE_FIELDS } from "@/lib/site-settings";

const VALID_KEYS = new Set(SITE_FIELDS.map((f) => f.key));

// Must stay dynamic: a statically-optimized route handler serves GET only (PUT → 405).
export const dynamic = "force-dynamic";

function isAdmin(session: unknown): boolean {
  return (session as { role?: string } | null)?.role === "ADMIN";
}

// Public: merged settings map (defaults + DB overrides).
export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...SITE_DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ settings: SITE_DEFAULTS });
  }
}

// Admin: upsert settings.
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const Body = z.object({ settings: z.record(z.string(), z.string().max(500)) });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  const entries = Object.entries(parsed.data.settings).filter(([k]) => VALID_KEYS.has(k));
  try {
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
    return NextResponse.json({ ok: true, updated: entries.length });
  } catch {
    return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
  }
}
