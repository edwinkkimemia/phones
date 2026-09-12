import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/data/catalog";
import type { CategoryT } from "@/types";
import type { ProductT, CategorySlug } from "@/types";

export interface CategoryWithCount extends CategoryT {
  id: string;
  productCount: number;
}

// All categories: live DB rows first, static catalog as fallback/offline.
export async function getCategories(): Promise<CategoryWithCount[]> {
  try {
    const rows = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((c) => ({
        id: c.id,
        slug: c.slug as CategorySlug,
        name: c.name,
        tagline: c.tagline ?? "",
        description: c.description ?? "",
        image: c.image ?? CATEGORIES.find((s) => s.slug === c.slug)?.image ?? "",
        count: c._count.products,
        productCount: c._count.products,
      }));
    }
  } catch {
    /* offline — use static catalog */
  }
  return CATEGORIES.map((c) => ({ ...c, id: c.slug, productCount: c.count }));
}

export function toProductT(p: {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  condition: string;
  stockQty: number;
  stockStatus: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured: boolean;
  isDeal: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  brand?: { name: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  images?: { url: string; alt?: string | null }[];
  specs?: { group: string; key: string; value: string }[];
}): ProductT {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name ?? "Generic",
    brandSlug: p.brand?.slug ?? "generic",
    category: (p.category?.slug ?? "accessories") as CategorySlug,
    categoryLabel: p.category?.name ?? "Accessories",
    tagline: p.tagline ?? "",
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    condition: p.condition as ProductT["condition"],
    stockQty: p.stockQty,
    stockStatus: p.stockStatus as ProductT["stockStatus"],
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    isFeatured: p.isFeatured,
    isDeal: p.isDeal,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    images: (p.images ?? []).map((i) => ({ url: i.url, alt: i.alt ?? p.name })),
    specs: (p.specs ?? []).map((s) => ({ group: s.group, key: s.key, value: s.value })),
    seoTitle: p.seoTitle ?? `${p.name} Price in Kenya | PhoneLaptops`,
    seoDescription: p.seoDescription ?? p.description.slice(0, 160),
  };
}

// Full data for an admin-created category slug (unknown to the static
// TITLES map). Returns null when the slug exists nowhere.
export async function getLiveCategory(slug: string): Promise<{
  meta: { title: string; subtitle: string; desc: string };
  hero: { eyebrow: string; heading: string; blurb: string; badges: [string, string, string] };
  image?: string;
  items: ProductT[];
} | null> {
  try {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: { images: true, specs: true, brand: true, category: true },
        },
      },
    });
    if (!cat) return null;
    return {
      meta: {
        title: `${cat.name} in Kenya`,
        subtitle: cat.tagline ?? "",
        desc: cat.description ?? "",
      },
      hero: {
        eyebrow: `${cat.name} Kenya`,
        heading: cat.name,
        blurb:
          cat.description ??
          `Shop ${cat.name.toLowerCase()} at competitive Kenyan prices with warranty and M-Pesa checkout.`,
        badges: ["✓ Genuine Stock", "✓ M-Pesa Checkout", "✓ Warranty Included"],
      },
      image: cat.image ?? undefined,
      items: cat.products.map((p) =>
        toProductT({
          ...p,
          brand: p.brand,
          category: p.category ?? { name: cat.name, slug: cat.slug },
        })
      ),
    };
  } catch {
    return null;
  }
}
