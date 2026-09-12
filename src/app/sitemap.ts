import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/catalog";
import { GUIDES } from "@/data/guides";
import { getCategories } from "@/lib/catalog-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://phonelaptops.co.ke";
  const now = new Date();
  const staticPages = ["", "/laptops", "/desktops", "/phones", "/iphones", "/tablets", "/wearables", "/storage", "/laptop-bags", "/laptop-parts", "/phone-parts", "/accessories", "/gaming", "/deals", "/new-arrivals", "/best-sellers", "/guides", "/delivery", "/contact", "/compare"];
  const known = new Set(staticPages);
  let extra: string[] = [];
  try {
    const cats = await getCategories();
    extra = cats.map((c) => `/${c.slug}`).filter((p) => !known.has(p));
  } catch {
    /* static list only */
  }
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...staticPages
      .filter((p) => p !== "")
      .map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...extra.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...PRODUCTS.map((p) => ({ url: `${base}/${p.category}/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
