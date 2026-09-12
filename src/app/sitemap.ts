import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://phonelaptops.co.ke";
  const staticPages = ["", "/laptops", "/desktops", "/phones", "/iphones", "/tablets", "/wearables", "/storage", "/laptop-bags", "/laptop-parts", "/phone-parts", "/accessories", "/gaming", "/deals", "/new-arrivals", "/best-sellers", "/delivery", "/contact", "/compare"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() as Date })),
    ...PRODUCTS.map((p) => ({ url: `${base}/${p.category}/${p.slug}`, lastModified: new Date() as Date })),
  ];
}
