import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { PRODUCTS, getProduct } from "@/data/catalog";
import { productMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ category: p.category, slug: p.slug }));
}

export function generateMetadata({ params }: { params: { category: string; slug: string } }): Metadata {
  const p = getProduct(params.slug);
  if (!p) return {};
  return productMetadata(p);
}

export default function ProductPage({ params }: { params: { category: string; slug: string } }) {
  const p = getProduct(params.slug);
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
