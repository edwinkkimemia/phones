import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { PRODUCTS } from "@/data/catalog";
import { getProductBySlug } from "@/lib/catalog-server";
import { productMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

// Static slugs pre-render at build; admin/DB products and DB edits resolve
// at runtime. Revalidate often so rich-text description changes from /admin
// appear on the storefront without a redeploy.
export const dynamicParams = true;
export const revalidate = 60;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  return productMetadata(p);
}

export default async function ProductPage({ params }: { params: { category: string; slug: string } }) {
  const p = await getProductBySlug(params.slug);
  if (!p) notFound();
  const jsonLd = productJsonLd(p);
  const crumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://phonelaptops.co.ke/" },
    { name: p.categoryLabel, url: `https://phonelaptops.co.ke/${p.category}` },
    { name: p.name, url: `https://phonelaptops.co.ke/${p.category}/${p.slug}` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <ProductDetailClient key={p.slug} product={p} />
    </>
  );
}
