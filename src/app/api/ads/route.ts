import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/ads?placement=CATEGORY|PRODUCT|GLOBAL&target=slug&category=cat&format=WIDE|SQUARE&index=0
// Tiered: exact → wildcard → parent CATEGORY (for product pages) → GLOBAL.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placement = (searchParams.get("placement") ?? "GLOBAL").toUpperCase();
  const target = (searchParams.get("target") ?? "all").trim().toLowerCase() || "all";
  const category = (searchParams.get("category") ?? "").trim().toLowerCase();
  const format = (searchParams.get("format") ?? "WIDE").toUpperCase();
  const index = Math.max(0, Number(searchParams.get("index") ?? 0) || 0);

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
    // All matching ads, tiered: exact target → wildcard → parent
    // category (so products inherit their category's banners) → global.
    // findMany is already sortOrder-ordered, so priority holds within tiers.
    const candidates = [
      ...live.filter((a) => a.placement === placement && a.target === target),
      ...live.filter((a) => a.placement === placement && a.target === "all"),
      ...(category
        ? live.filter((a) => a.placement === "CATEGORY" && a.target === category)
        : []),
      ...(category
        ? live.filter((a) => a.placement === "CATEGORY" && a.target === "all")
        : []),
      ...live.filter((a) => a.placement === "GLOBAL"),
    ];
    const slim = (a: (typeof candidates)[number]) => ({
      id: a.id, title: a.title, placement: a.placement, target: a.target, link: a.link,
    });
    if (candidates.length > 0) {
      return NextResponse.json({
        source: "db",
        ad: candidates[index % candidates.length],
        candidates: candidates.map(slim),
      });
    }
    return NextResponse.json({ source: "db", ad: null, candidates: [] });
  } catch {
    return NextResponse.json({ source: "db", ad: null });
  }
}

// Admin: list all slots
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  // Restore missing defaults (idempotent). Known default ids are also
  // re-enabled — custom ads are never touched.
  if (new URL(req.url).searchParams.get("restore") === "1") {
    const { ALL_DEFAULT_ADS } = await import("@/data/default-ads");
    try {
      for (const a of ALL_DEFAULT_ADS) {
        await prisma.adSlot.upsert({
          where: { id: a.id },
          update: { active: true },
          create: { ...a, placement: a.placement as never, format: a.format as never },
        });
      }
      const count = await prisma.adSlot.count();
      return NextResponse.json({ ok: true, restored: ALL_DEFAULT_ADS.length, total: count });
    } catch {
      return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
    }
  }
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
  // Normalize target: slugs are lowercase — "Laptops" must still match "laptops".
  parsed.data.target = parsed.data.target.trim().toLowerCase() || "all";
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
  if (typeof d.target === "string") d.target = d.target.trim().toLowerCase() || "all";
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
