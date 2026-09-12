import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/data/catalog";
import { slugify } from "@/lib/utils";

function isAdmin(session: unknown): boolean {
  return (session as { role?: string } | null)?.role === "ADMIN";
}

// Public category list (DB first, catalog fallback).
export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ source: "db", categories: cats });
  } catch {
    return NextResponse.json({
      source: "static",
      categories: CATEGORIES.map((c, i) => ({
        id: c.slug, slug: c.slug, name: c.name, tagline: c.tagline,
        description: c.description, image: c.image, sortOrder: i,
        _count: { products: 0 },
      })),
    });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const Body = z.object({
    name: z.string().min(2),
    tagline: z.string().optional(),
    description: z.string().optional(),
    image: z.string().url().optional().or(z.literal("")),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  try {
    const cat = await prisma.category.create({
      data: {
        slug: slugify(parsed.data.name),
        name: parsed.data.name,
        tagline: parsed.data.tagline,
        description: parsed.data.description,
        image: parsed.data.image || null,
      },
    });
    return NextResponse.json({ category: cat });
  } catch {
    return NextResponse.json({ error: "A category with that name may already exist." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${count} product(s) still use this category. Reassign them first.` },
        { status: 400 }
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
