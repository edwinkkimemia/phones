import type { Metadata } from "next";
import type { ProductT } from "@/types";

const SITE = "https://phonelaptops.co.ke";
const NAME = "PhoneLaptops.co.ke";

export function productMetadata(p: ProductT): Metadata {
  const url = `${SITE}/${p.category}/${p.slug}`;
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: p.seoTitle,
      description: p.seoDescription,
      url,
      type: "website",
      images: [{ url: p.images[0]?.url ?? "", alt: p.name }],
    },
  };
}

export function productJsonLd(p: ProductT) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p.brand },
    description: p.seoDescription,
    image: p.images.map((i) => i.url),
    sku: p.slug,
    offers: {
      "@type": "Offer",
      url: `${SITE}/${p.category}/${p.slug}`,
      priceCurrency: "KES",
      price: p.price,
      availability:
        p.stockStatus === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition:
        p.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/RefurbishedCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export { SITE, NAME };
