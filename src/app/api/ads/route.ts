import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/ads?placement=CATEGORY|PRODUCT|BLOG|GUIDES|GLOBAL&target=slug&category=cat&format=WIDE|SQUARE&index=0&seed=visitor-id
// Tiered: exact → wildcard → parent CATEGORY (for product pages) → GLOBAL.
// When several ads share the winning tier, ?seed= rotates which one each
// visitor sees (stable per visitor, uniform across visitors) instead of
// serving the same creative to everyone.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placement = (searchParams.get("placement") ?? "GLOBAL").toUpperCase();
  const target = (searchParams.get("target") ?? "all").trim().toLowerCase() || "all";
  const category = (searchParams.get("category") ?? "").trim().toLowerCase();
  const format = (searchParams.get("format") ?? "WIDE").toUpperCase();
  const index = Math.max(0, Number(searchParams.get("index") ?? 0) || 0);
  const seed = (searchParams.get("seed") ?? "").trim().slice(0, 64);

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
    // NOTE: the parent-CATEGORY rows must be fetched here too — the tiering
    // below filters this result set, so product pages only inherit their
    // category's banners when those rows are included in the query.
    const ads = await prisma.adSlot.findMany({
      where: {
        active: true,
        format: format as never,
        OR: [
          { placement: "GLOBAL" as never },
          { placement: placement as never, target },
          { placement: placement as never, target: "all" },
          ...(category
            ? [
                { placement: "CATEGORY" as never, target: category },
                { placement: "CATEGORY" as never, target: "all" },
              ]
            : []),
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    const live = ads.filter(
      (a) =>
        (!a.startsAt || a.startsAt <= now) && (!a.endsAt || a.endsAt >= now)
    );
    // Tiers in priority order: exact target → wildcard → parent
    // category (so products inherit their category's banners) → global.
    // findMany is already sortOrder-ordered, so priority holds within tiers.
    const tiers = [
      live.filter((a) => a.placement === placement && a.target === target),
      live.filter((a) => a.placement === placement && a.target === "all"),
      ...(category
        ? [
            live.filter((a) => a.placement === "CATEGORY" && a.target === category),
            live.filter((a) => a.placement === "CATEGORY" && a.target === "all"),
          ]
        : []),
      live.filter((a) => a.placement === "GLOBAL"),
    ];
    // Rotation: the winning (first non-empty) tier is rotated per visitor so
    // N ads for one slot split traffic instead of everyone seeing ad #1.
    // Priority is preserved — lower tiers only fill stacked slots the winner
    // can't fill. Without ?seed= the order is exactly today's priority order.
    const winIdx = tiers.findIndex((t) => t.length > 0);
    let offset = 0;
    let display: typeof live = [];
    if (winIdx >= 0) {
      const winner = tiers[winIdx];
      if (seed && winner.length > 1) {
        offset = hashSeed(`${seed}:${placement}:${target}:${format}`) % winner.length;
      }
      const seen = new Set<string>();
      for (const a of [...winner.slice(offset), ...winner.slice(0, offset)]) {
        seen.add(a.id);
        display.push(a);
      }
      for (const tier of tiers) {
        for (const a of tier) {
          if (!seen.has(a.id)) {
            seen.add(a.id);
            display.push(a);
          }
        }
      }
    }
    const candidates = display;
    const slim = (a: (typeof candidates)[number]) => ({
      id: a.id, title: a.title, placement: a.placement, target: a.target, link: a.link,
    });
    // No wrap-around: slot N only renders when N distinct ads match.
    // A lone ad can never leak across slots/pages it wasn't targeted at.
    if (index < candidates.length) {
      return NextResponse.json({
        source: "db",
        ad: candidates[index],
        candidates: candidates.map(slim),
        rotation: seed ? { offset } : null,
      });
    }
    return NextResponse.json({ source: "db", ad: null, candidates: candidates.map(slim), rotation: seed ? { offset } : null });
  } catch {
    return NextResponse.json({ source: "db", ad: null });
  }
}

// Stable per-visitor hash (djb2) → uniform rotation offset.
function hashSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// Server-side creative check: HEAD the image URL (falling back to a
// ranged GET for hosts that reject HEAD). Definitive HTTP failures (4xx/5xx)
// reject the save; network-level uncertainty allows it — the admin form's
// browser probe is the authoritative load test.
async function verifyImageUrl(url: string): Promise<{ ok: boolean; status?: number }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
    if (!res.ok && (res.status === 403 || res.status === 405)) {
      res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        redirect: "follow",
        signal: ctrl.signal,
      });
    }
    if (res.ok) return { ok: true };
    // Definitive failure only on client/server error responses.
    if (res.status >= 400) return { ok: false, status: res.status };
    return { ok: true };
  } catch {
    return { ok: true };
  } finally {
    clearTimeout(timer);
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
    placement: z.enum(["GLOBAL", "HOMEPAGE", "CATEGORY", "PRODUCT", "BLOG", "GUIDES"]),
    target: z.string().min(1),
    format: z.enum(["WIDE", "SQUARE"]).default("WIDE"),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ad data" }, { status: 400 });
  // Normalize target: slugs are lowercase — "Laptops" must still match "laptops".
  parsed.data.target = parsed.data.target.trim().toLowerCase() || "all";
  const check = await verifyImageUrl(parsed.data.image);
  if (!check.ok)
    return NextResponse.json(
      { error: `That image URL doesn't load (HTTP ${check.status ?? "error"}) — fix the link or upload a creative.` },
      { status: 400 }
    );
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
    placement: z.enum(["GLOBAL", "HOMEPAGE", "CATEGORY", "PRODUCT", "BLOG", "GUIDES"]).optional(),
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
  if (typeof d.image === "string") {
    const check = await verifyImageUrl(d.image);
    if (!check.ok)
      return NextResponse.json(
        { error: `That image URL doesn't load (HTTP ${check.status ?? "error"}) — fix the link or upload a creative.` },
        { status: 400 }
      );
  }
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
