import { PrismaClient } from "@prisma/client";
import { PRODUCTS, CATEGORIES, BRANDS } from "../src/data/catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PhoneLaptops.co.ke…");

  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, tagline: c.tagline, description: c.description, image: c.image },
      create: { slug: c.slug, name: c.name, tagline: c.tagline, description: c.description, image: c.image },
    });
  }
  for (const b of BRANDS) {
    const slug = b.toLowerCase();
    await prisma.brand.upsert({
      where: { slug },
      update: { name: b },
      create: { slug, name: b },
    });
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    const brand = await prisma.brand.findUnique({ where: { slug: p.brandSlug } });
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        condition: p.condition as never,
        stockQty: p.stockQty,
        stockStatus: p.stockStatus as never,
        rating: p.rating,
        reviewCount: p.reviewCount,
        soldCount: p.soldCount,
        isFeatured: !!p.isFeatured,
        isDeal: !!p.isDeal,
        isNew: !!p.isNew,
        isBestSeller: !!p.isBestSeller,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        categoryId: category?.id,
        brandId: brand?.id,
      },
      create: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        condition: p.condition as never,
        stockQty: p.stockQty,
        stockStatus: p.stockStatus as never,
        rating: p.rating,
        reviewCount: p.reviewCount,
        soldCount: p.soldCount,
        isFeatured: !!p.isFeatured,
        isDeal: !!p.isDeal,
        isNew: !!p.isNew,
        isBestSeller: !!p.isBestSeller,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        categoryId: category?.id,
        brandId: brand?.id,
        images: { create: p.images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) },
        specs: { create: p.specs.map((s) => ({ group: s.group, key: s.key, value: s.value })) },
      },
    });
  }

  // Delivery zones (configurable via admin in production)
  const zones = [
    { county: "Nairobi", town: "Nairobi CBD & environs", fee: 250, eta: "Same-day / Next-day" },
    { county: "Nairobi", town: "Westlands / Kilimani / Karen", fee: 300, eta: "Same-day" },
    { county: "Mombasa", town: "Mombasa", fee: 450, eta: "1–2 days" },
    { county: "Kisumu", town: "Kisumu", fee: 450, eta: "1–2 days" },
    { county: "Nakuru", town: "Nakuru", fee: 400, eta: "1–2 days" },
    { county: "Uasin Gishu", town: "Eldoret", fee: 400, eta: "1–2 days" },
    { county: "Kiambu", town: "Thika", fee: 350, eta: "Next-day" },
    { county: "Other", town: "Other towns (G4S / Fargo)", fee: 500, eta: "2–3 days" },
  ];
  for (const z of zones) {
    await prisma.deliveryZone.create({ data: z }).catch(() => null);
  }

  console.log(`Seeded ${PRODUCTS.length} products, ${CATEGORIES.length} categories, ${BRANDS.length} brands.`);

  // Demo full-width image ads (shown above breadcrumbs on PDP / category pages)
  try {
    const demoAds = [
      {
        title: "Today's Tech Deals — Save up to 20%",
        image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1600&q=80",
        link: "/deals",
        placement: "GLOBAL" as never,
        target: "all",
        format: "WIDE" as never,
        sortOrder: 0,
      },
      {
        title: "Laptop deals from KES 42,999",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80",
        link: "/laptops",
        placement: "CATEGORY" as never,
        target: "laptops",
        format: "WIDE" as never,
        sortOrder: 0,
      },
      {
        title: "iPhone 17 Pro — now in stock",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=80",
        link: "/iphones/iphone-17-pro-256gb",
        placement: "CATEGORY" as never,
        target: "iphones",
        format: "WIDE" as never,
        sortOrder: 0,
      },
      {
        title: "M-Pesa deals — pay on delivery available",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        link: "/deals",
        placement: "GLOBAL" as never,
        target: "all",
        format: "SQUARE" as never,
        sortOrder: 0,
      },
      {
        title: "Complete your setup — accessories from KES 2,499",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80",
        link: "/accessories",
        placement: "GLOBAL" as never,
        target: "all",
        format: "SQUARE" as never,
        sortOrder: 1,
      },
      {
        title: "New iPhones have landed — shop the 17 series",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=80",
        link: "/iphones",
        placement: "HOMEPAGE" as never,
        target: "below-hero",
        format: "WIDE" as never,
        sortOrder: 0,
      },
      {
        title: "Storage upgrades from KES 2,499 — SSDs, HDDs & more",
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1600&q=80",
        link: "/storage",
        placement: "HOMEPAGE" as never,
        target: "below-deals",
        format: "WIDE" as never,
        sortOrder: 0,
      },
    ];
    for (const a of demoAds) {
      await prisma.adSlot.upsert({
        where: { id: `demo-${a.target}-${a.placement}-${a.format}` },
        update: { ...a },
        create: { id: `demo-${a.target}-${a.placement}-${a.format}`, ...a },
      });
    }
    console.log(`Seeded ${demoAds.length} ad slots.`);
  } catch (e) {
    console.log("Skipping ad slots (run prisma migrate first).");
  }
}

main().finally(() => prisma.$disconnect());
