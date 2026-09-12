import { prisma } from "@/lib/prisma";

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover?: string | null;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogFull extends BlogListItem {
  body: string;
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

// Server-side reads (blog pages). Never fetch HTTP to own domain —
// NEXT_PUBLIC_SITE_URL may point elsewhere and break prerendering.
export async function getPublishedPosts(): Promise<BlogListItem[]> {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, slug: true, title: true, excerpt: true, cover: true,
        tags: true, views: true, createdAt: true, updatedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogFull | null> {
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.published) return null;
    prisma.blogPost
      .update({ where: { slug }, data: { views: { increment: 1 } } })
      .catch(() => null);
    return post;
  } catch {
    return null;
  }
}
