import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProduct } from "@/data/catalog";

// Admin: full product detail (DB first, static catalog fallback).
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const key = decodeURIComponent(params.id);
  try {
    const p = await prisma.product.findFirst({
      where: { OR: [{ id: key }, { slug: key }] },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specs: true,
        variants: true,
        brand: true,
        category: true,
      },
    });
    if (p) return NextResponse.json({ source: "db", product: p });
  } catch {
    /* fall through */
  }
  const s = getProduct(key);
  if (!s) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ source: "static", product: s, readonly: true });
}
