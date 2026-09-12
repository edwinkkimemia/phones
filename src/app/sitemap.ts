import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/catalog";
import { getPublishedGuides } from "@/lib/guides";
import { getCategories } from "@/lib/catalog-server";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://phonelaptops.co.ke";
  const now = new Date();
  const staticPages = ["", "/laptops", "/desktops", "/phones", "/iphones", "/tablets", "/wearables", "/storage", "/laptop-bags", "/laptop-parts", "/phone-parts", "/accessories", "/gaming", "/deals", "/new-arrivals", "/best-sellers", "/guides", "/blog", "/delivery", "/contact", "/compare"];
  const known = new Set(staticPages);
  let extra: string[] = [];
  try {
    const cats = await getCategories();
    extra = cats.map((c) => `/${c.slug}`).filter((p) => !known.has(p));
  } catch {
    /* static list only */
  }
  let blogUrls: { url: string; lastModified: Date }[] = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    blogUrls = posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt }));
  } catch {
    /* no posts yet */
  }
  let guideUrls: { url: string; lastModified: Date }[] = [];
  try {
    const guides = await getPublishedGuides();
    guideUrls = guides.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: g.updatedAt }));
  } catch {
    /* no guides yet */
  }
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...staticPages
      .filter((p) => p !== "")
      .map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...extra.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...guideUrls.map((g) => ({ ...g, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...blogUrls.map((b) => ({ ...b, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...PRODUCTS.map((p) => ({ url: `${base}/${p.category}/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
