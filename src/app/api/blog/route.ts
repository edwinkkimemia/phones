import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

const slim = {
  id: true, slug: true, title: true, excerpt: true, cover: true,
  tags: true, published: true, views: true, createdAt: true, updatedAt: true,
};

// Public: published list (?slug= for one). Admin: ?all=1 (includes drafts).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const slug = sp.get("slug");
  try {
    if (slug) {
      const post = await prisma.blogPost.findUnique({ where: { slug } });
      if (post && post.published) {
        // best-effort view count
        prisma.blogPost.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => null);
        return NextResponse.json({ post });
      }
      // Drafts are visible to admins (edit page).
      const session = await getServerSession(authOptions);
      if (post && (session as { role?: string } | null)?.role === "ADMIN") {
        return NextResponse.json({ post });
      }
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (sp.get("all") === "1") {
      const denied = await requireAdmin();
      if (denied) return denied;
      const posts = await prisma.blogPost.findMany({
        orderBy: { updatedAt: "desc" },
        select: slim,
      });
      return NextResponse.json({ posts });
    }
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: slim,
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [], post: null });
  }
}

const Body = z.object({
  title: z.string().min(4),
  slug: z.string().optional(),
  excerpt: z.string().min(20),
  cover: z.string().url().optional().or(z.literal("")),
  body: z.string().min(100),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Title, excerpt (20+) and body (100+) required." }, { status: 400 });
  const d = parsed.data;
  try {
    const post = await prisma.blogPost.create({
      data: {
        ...d,
        slug: d.slug?.trim() ? slugify(d.slug) : `${slugify(d.title)}-${Date.now().toString(36)}`,
        cover: d.cover || null,
        seoTitle: d.seoTitle || `${d.title} | PhoneLaptops.co.ke`,
        seoDescription: d.seoDescription || d.excerpt.slice(0, 160),
      },
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "A post with that slug may already exist." }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = Body.partial().extend({ id: z.string() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const { id, ...d } = parsed.data;
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...d,
        ...(d.slug ? { slug: slugify(d.slug) } : {}),
        ...(d.cover !== undefined ? { cover: d.cover || null } : {}),
      },
    });
    return NextResponse.json({ post });
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
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
