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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: "PhoneLaptops.co.ke",
    slogan: "Latest Tech. Honest Prices. Delivered.",
    url: SITE,
    logo: `${SITE}/logo.png`,
    image: `${SITE}/logo.png`,
    email: "support@phonelaptops.co.ke",
    telephone: "+254715135141",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Moi Avenue",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    sameAs: [
      "https://facebook.com/phonelaptopske",
      "https://instagram.com/phonelaptopske",
      "https://x.com/phonelaptopske",
      "https://youtube.com/@phonelaptopske",
      "https://tiktok.com/@phonelaptopske",
    ],
    paymentAccepted: ["M-Pesa", "Credit Card", "Cash on Delivery"],
    priceRange: "KES 2,499 - KES 189,999",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NAME,
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(faqs: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export { SITE, NAME };
