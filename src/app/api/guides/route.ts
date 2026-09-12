import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

const slim = {
  id: true, slug: true, title: true, description: true, cover: true,
  updated: true, readMins: true, keywords: true, published: true,
  views: true, createdAt: true, updatedAt: true,
};

// Public: published list (?slug= for one). Admin: ?all=1 (includes drafts).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = sp.get("slug");
  try {
    if (slug) {
      const guide = await prisma.guide.findUnique({ where: { slug } });
      if (guide && guide.published) {
        // best-effort view count
        prisma.guide.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => null);
        return NextResponse.json({ guide });
      }
      // Drafts are visible to admins (edit page).
      const session = await getServerSession(authOptions);
      if (guide && (session as { role?: string } | null)?.role === "ADMIN") {
        return NextResponse.json({ guide });
      }
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    if (sp.get("all") === "1") {
      const denied = await requireAdmin();
      if (denied) return denied;
      const guides = await prisma.guide.findMany({
        orderBy: { updatedAt: "desc" },
        select: slim,
      });
      return NextResponse.json({ guides });
    }
    const guides = await prisma.guide.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: slim,
    });
    return NextResponse.json({ guides });
  } catch {
    return NextResponse.json({ guides: [], guide: null });
  }
}

const Section = z.object({ h: z.string().min(1), body: z.string().min(1) });

const Body = z.object({
  title: z.string().min(4),
  slug: z.string().optional(),
  description: z.string().min(20),
  cover: z.string().url().optional().or(z.literal("")),
  intro: z.string().min(50),
  sections: z.array(Section).min(1),
  relatedSlugs: z.array(z.string()).default([]),
  faqs: z.array(z.tuple([z.string(), z.string()])).default([]),
  keywords: z.array(z.string()).default([]),
  readMins: z.number().int().min(1).default(5),
  updated: z.string().default(""),
  published: z.boolean().default(false),
});

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Title, description (20+), intro (50+) and at least one section required." }, { status: 400 });
  const d = parsed.data;
  try {
    const guide = await prisma.guide.create({
      data: {
        ...d,
        slug: d.slug?.trim() ? slugify(d.slug) : `${slugify(d.title)}-${Date.now().toString(36)}`,
        cover: d.cover || null,
        relatedSlugs: d.relatedSlugs.map((s) => slugify(s)).filter(Boolean),
        keywords: d.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean),
        updated: d.updated.trim() || new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" }),
      },
    });
    return NextResponse.json({ guide });
  } catch {
    return NextResponse.json({ error: "A guide with that slug may already exist." }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = Body.partial().extend({ id: z.string() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { id, ...d } = parsed.data;
  try {
    const guide = await prisma.guide.update({
      where: { id },
      data: {
        ...d,
        ...(d.slug ? { slug: slugify(d.slug) } : {}),
        ...(d.cover !== undefined ? { cover: d.cover || null } : {}),
        ...(d.relatedSlugs ? { relatedSlugs: d.relatedSlugs.map((s) => slugify(s)).filter(Boolean) } : {}),
        ...(d.keywords ? { keywords: d.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean) } : {}),
      },
    });
    return NextResponse.json({ guide });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.guide.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
