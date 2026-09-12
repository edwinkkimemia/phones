import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const productId = sp.get("productId") ?? "";
  const pendingOnly = sp.get("pending") === "1";
  try {
    const reviews = await prisma.review.findMany({
      where: {
        ...(productId ? { product: { OR: [{ id: productId }, { slug: productId }] } } : {}),
        ...(pendingOnly ? { approved: false } : { approved: true }),
      },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ source: "db", reviews });
  } catch {
    return NextResponse.json({ source: "db", reviews: [] });
  }
}

const Body = z.object({
  productId: z.string(),
  name: z.string().min(2),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(4),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: parsed.data.productId }, { slug: parsed.data.productId }] },
    });
    if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    const r = await prisma.review.create({
      data: { productId: product.id, name: parsed.data.name, rating: parsed.data.rating, title: parsed.data.title, body: parsed.data.body, approved: false },
    });
    return NextResponse.json({ review: r, message: "Thanks! Your review is awaiting moderation." });
  } catch {
    return NextResponse.json({ message: "Thanks! Your review was received and is awaiting moderation." });
  }
}

// ---- Admin moderation ----
export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: string; approved?: boolean } | null;
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const review = await prisma.review.update({
      where: { id: body.id },
      data: { ...(typeof body.approved === "boolean" ? { approved: body.approved } : {}) },
    });
    // keep product aggregates roughly in sync on approval
    if (body.approved) {
      const agg = await prisma.review.aggregate({
        where: { productId: review.productId, approved: true },
        _avg: { rating: true },
        _count: true,
      });
      await prisma.product.update({
        where: { id: review.productId },
        data: { rating: agg._avg.rating ?? 5, reviewCount: agg._count },
      });
    }
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
