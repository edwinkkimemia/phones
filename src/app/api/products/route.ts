import { NextResponse } from "next/server";
import { z } from "zod";
import { PRODUCTS } from "@/data/catalog";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const deal = searchParams.get("deal");

  try {
    const items = await prisma.product.findMany({
      where: {
        ...(category ? { category: { slug: category } } : {}),
        ...(deal ? { isDeal: true } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { images: true, brand: true, category: true },
      take: 60,
    });
    return NextResponse.json({ source: "db", count: items.length, products: items });
  } catch {
    // Fallback to static catalog (dev / build without DB)
    let list = PRODUCTS;
    if (category) list = list.filter((p) => p.category === category);
    if (deal) list = list.filter((p) => p.isDeal);
    if (q) list = list.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q));
    return NextResponse.json({ source: "static", count: list.length, products: list });
  }
}

// ---- Admin: create product (DB required) ----
const CreateBody = z.object({
  name: z.string().min(3),
  brand: z.string().optional(),
  category: z.string().optional(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  stockQty: z.number().int().min(0).default(0),
  description: z.string().default(""),
  tagline: z.string().optional(),
  condition: z.enum(["NEW", "PRE_OWNED", "REFURBISHED"]).default("NEW"),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).max(8).optional(),
  specs: z.array(z.object({ group: z.string().default("General"), key: z.string().min(1), value: z.string().min(1) })).max(30).optional(),
  isDeal: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  const d = parsed.data;
  try {
    const [brand, category] = await Promise.all([
      d.brand ? prisma.brand.upsert({ where: { slug: slugify(d.brand) }, update: {}, create: { slug: slugify(d.brand), name: d.brand } }) : null,
      d.category ? prisma.category.upsert({ where: { slug: slugify(d.category) }, update: {}, create: { slug: slugify(d.category), name: d.category } }) : null,
    ]);
    const p = await prisma.product.create({
      data: {
        slug: `${slugify(d.name)}-${Date.now().toString(36)}`,
        name: d.name,
        tagline: d.tagline,
        description: d.description || d.name,
        condition: d.condition as never,
        price: d.price,
        compareAtPrice: d.compareAtPrice ?? null,
        stockQty: d.stockQty,
        stockStatus: d.stockQty <= 0 ? "OUT_OF_STOCK" : d.stockQty <= 8 ? "LOW_STOCK" : "IN_STOCK",
        brandId: brand?.id,
        categoryId: category?.id,
        isDeal: !!d.isDeal,
        isNew: d.isNew ?? true,
        isFeatured: !!d.isFeatured,
        seoTitle: `${d.name} Price in Kenya | PhoneLaptops`,
        seoDescription: `Buy ${d.name} in Kenya. Genuine, warranty included, M-Pesa payments, delivery across Kenya.`,
        images: {
          create: [...(d.images ?? []), ...(d.image ? [d.image] : [])].map((url, i) => ({
            url,
            alt: d.name,
            sortOrder: i,
          })),
        },
        specs: d.specs?.length
          ? { create: d.specs.map((s) => ({ group: s.group || "General", key: s.key, value: s.value })) }
          : undefined,
      },
    });
    return NextResponse.json({ product: p });
  } catch {
    return NextResponse.json({ error: "Database unavailable — try again." }, { status: 503 });
  }
}

// ---- Admin: quick update (price / stock / flags) ----
const UpdateBody = z.object({
  id: z.string(),
  name: z.string().min(3).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(["NEW", "PRE_OWNED", "REFURBISHED"]).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().int().positive().optional(),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  stockQty: z.number().int().min(0).optional(),
  isDeal: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = UpdateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { id, category, brand, ...d } = parsed.data;
  try {
    const [cat, br] = await Promise.all([
      category !== undefined
        ? category
          ? prisma.category.upsert({ where: { slug: slugify(category) }, update: {}, create: { slug: slugify(category), name: category } })
          : null
        : undefined,
      brand !== undefined
        ? brand
          ? prisma.brand.upsert({ where: { slug: slugify(brand) }, update: {}, create: { slug: slugify(brand), name: brand } })
          : null
        : undefined,
    ]);
    const p = await prisma.product.update({
      where: { id },
      data: {
        ...d,
        ...(cat !== undefined ? { categoryId: cat?.id ?? null } : {}),
        ...(br !== undefined ? { brandId: br?.id ?? null } : {}),
        ...(typeof d.stockQty === "number"
          ? { stockStatus: d.stockQty <= 0 ? "OUT_OF_STOCK" : d.stockQty <= 8 ? "LOW_STOCK" : "IN_STOCK" }
          : {}),
      } as never,
    });
    return NextResponse.json({ product: p });
  } catch {
    return NextResponse.json({ error: "Update failed — is the database connected?" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
