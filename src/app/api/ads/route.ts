import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/ads?placement=CATEGORY|PRODUCT|GLOBAL&target=slug&format=WIDE|SQUARE&index=0
// Exact match wins; falls back to GLOBAL. `index` picks the nth candidate (for stacked slots).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placement = (searchParams.get("placement") ?? "GLOBAL").toUpperCase();
  const target = searchParams.get("target") ?? "all";
  const format = (searchParams.get("format") ?? "WIDE").toUpperCase();
  const index = Math.max(0, Number(searchParams.get("index") ?? 0) || 0);

  const dedup = <T extends { id: string }>(list: (T | undefined)[]): T[] => {
    const seen = new Set<string>();
    return list.filter((x): x is T => !!x && !seen.has(x.id) && (seen.add(x.id), true));
  };

  // Admin list view
  if (searchParams.get("list") === "all") {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
      const ads = await prisma.adSlot.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
      return NextResponse.json({ source: "db", ads });
    } catch {
      return NextResponse.json({ source: "db", ads: [] });
    }
  }

  try {
    const now = new Date();
    const ads = await prisma.adSlot.findMany({
      where: {
        active: true,
        format: format as never,
        OR: [
          { placement: "GLOBAL" as never },
          { placement: placement as never, target },
          { placement: placement as never, target: "all" },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    const live = ads.filter(
      (a) =>
        (!a.startsAt || a.startsAt <= now) && (!a.endsAt || a.endsAt >= now)
    );
    const exact = live.find((a) => a.placement === placement && a.target === target);
    const wildcard = live.find((a) => a.placement === placement && a.target === "all");
    const global = live.find((a) => a.placement === "GLOBAL");
    const candidates = dedup([exact, wildcard, global]);
    if (candidates.length > 0)
      return NextResponse.json({ source: "db", ad: candidates[index % candidates.length] });
    return NextResponse.json({ source: "db", ad: null });
  } catch {
    return NextResponse.json({ source: "db", ad: null });
  }
}

// Admin: list all slots
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const Body = z.object({
    title: z.string().min(3),
    image: z.string().url(),
    link: z.string().min(1),
    placement: z.enum(["GLOBAL", "HOMEPAGE", "CATEGORY", "PRODUCT"]),
    target: z.string().min(1),
    format: z.enum(["WIDE", "SQUARE"]).default("WIDE"),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad data" }, { status: 400 });
  try {
    const ad = await prisma.adSlot.create({ data: { ...parsed.data, placement: parsed.data.placement as never, format: parsed.data.format as never } });
    return NextResponse.json({ ad });
  } catch {
    return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.adSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const Body = z.object({
    id: z.string(),
    active: z.boolean().optional(),
    title: z.string().min(3).optional(),
    image: z.string().url().optional(),
    link: z.string().min(1).optional(),
    placement: z.enum(["GLOBAL", "HOMEPAGE", "CATEGORY", "PRODUCT"]).optional(),
    target: z.string().min(1).optional(),
    format: z.enum(["WIDE", "SQUARE"]).optional(),
    sortOrder: z.number().int().optional(),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad update" }, { status: 400 });
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id, startsAt, endsAt, ...d } = parsed.data;
  try {
    const ad = await prisma.adSlot.update({
      where: { id },
      data: {
        ...d,
        placement: d.placement as never | undefined,
        format: d.format as never | undefined,
        ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : null } : {}),
        ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : null } : {}),
      },
    });
    return NextResponse.json({ ad });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
