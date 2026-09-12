import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
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
    // NOTE: update:{} is deliberate — this seed runs on every deploy and
    // must never overwrite prices, stock or flags changed in /admin.
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
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

  // Delivery zones (configurable via admin in production).
  // Stable ids + upsert so re-seeding on deploy never duplicates or
  // overwrites admin-edited fees.
  const zones = [
    { id: "zone-nairobi-cbd", county: "Nairobi", town: "Nairobi CBD & environs", fee: 250, eta: "Same-day / Next-day" },
    { id: "zone-westlands", county: "Nairobi", town: "Westlands / Kilimani / Karen", fee: 300, eta: "Same-day" },
    { id: "zone-mombasa", county: "Mombasa", town: "Mombasa", fee: 450, eta: "1–2 days" },
    { id: "zone-kisumu", county: "Kisumu", town: "Kisumu", fee: 450, eta: "1–2 days" },
    { id: "zone-nakuru", county: "Nakuru", town: "Nakuru", fee: 400, eta: "1–2 days" },
    { id: "zone-eldoret", county: "Uasin Gishu", town: "Eldoret", fee: 400, eta: "1–2 days" },
    { id: "zone-thika", county: "Kiambu", town: "Thika", fee: 350, eta: "Next-day" },
    { id: "zone-other", county: "Other", town: "Other towns (G4S / Fargo)", fee: 500, eta: "2–3 days" },
  ];
  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: z.id },
      update: {},
      create: z,
    }).catch(() => null);
  }

  // One-time remap: legacy "smartphones" slug is now "phones".
  try {
    const phones = await prisma.category.findUnique({ where: { slug: "phones" } });
    const legacy = await prisma.category.findUnique({ where: { slug: "smartphones" } });
    if (phones && legacy) {
      await prisma.product.updateMany({ where: { categoryId: legacy.id }, data: { categoryId: phones.id } });
      await prisma.category.delete({ where: { id: legacy.id } });
      console.log("Remapped legacy smartphones category → phones.");
    }
  } catch {
    /* fresh DB — nothing to remap */
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
      {
        title: "Everything tech, one trusted store — shop all departments",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
        link: "/deals",
        placement: "HOMEPAGE" as never,
        target: "above-footer",
        format: "WIDE" as never,
        sortOrder: 0,
      },
    ];
    for (const a of demoAds) {
      // update:{} — ads are owned in /admin after first seed; redeploys must not clobber them.
      await prisma.adSlot.upsert({
        where: { id: `demo-${a.target}-${a.placement}-${a.format}` },
        update: {},
        create: { id: `demo-${a.target}-${a.placement}-${a.format}`, ...a },
      });
    }
    console.log(`Seeded ${demoAds.length} ad slots.`);
  } catch (e) {
    console.log("Skipping ad slots (run prisma migrate first).");
  }

  // Per-category banners so every category page shows its own creative
  try {
    const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
    const catAds: { slug: string; title: string; image: string }[] = [
      { slug: "laptops", title: "Laptop deals from KES 42,999", image: img("photo-1496181133206-80ce9b88a853") },
      { slug: "desktops", title: "Desktops for office & studio", image: img("photo-1547082299-de196ea013d6") },
      { slug: "iphones", title: "iPhone 17 Pro — now in stock", image: img("photo-1592750475338-74b7b21085ab") },
      { slug: "phones", title: "Phones & iPhones Kenyans love", image: img("photo-1511707171634-5f897ff02aa9") },
      { slug: "tablets", title: "Tablets for work, study & play", image: img("photo-1544244015-0df4b3ffc6b0") },
      { slug: "wearables", title: "Smartwatches from KES 5,999", image: img("photo-1579586337278-3befd40fd17a") },
      { slug: "storage", title: "Storage upgrades from KES 2,499", image: img("photo-1597872200969-2b65d56bd16b") },
      { slug: "laptop-bags", title: "Padded, anti-theft laptop bags", image: img("photo-1491637639811-60e2756cc1c7") },
      { slug: "laptop-parts", title: "Genuine RAM, batteries & chargers", image: img("photo-1518770660439-4636190af475") },
      { slug: "phone-parts", title: "Original screens & batteries", image: img("photo-1601784551446-20c9e07cdbdb") },
      { slug: "accessories", title: "Chargers, audio & more from KES 2,499", image: img("photo-1572569511254-d8f925fe2cbb") },
      { slug: "gaming", title: "Gaming rigs & peripherals", image: img("photo-1593305841991-05c297ba4575") },
      { slug: "deals", title: "Today's Tech Deals — save up to 20%", image: img("photo-1607083206869-4c7672e72a8a") },
      { slug: "new-arrivals", title: "Just landed — the newest tech", image: img("photo-1592750475338-74b7b21085ab") },
      { slug: "best-sellers", title: "What Kenya is buying right now", image: img("photo-1511707171634-5f897ff02aa9") },
    ];
    for (const c of catAds) {
      await prisma.adSlot.upsert({
        where: { id: `cat-${c.slug}` },
        update: {},
        create: {
          id: `cat-${c.slug}`,
          title: c.title,
          image: c.image,
          link: `/${c.slug}`,
          placement: "CATEGORY" as never,
          target: c.slug,
          format: "WIDE" as never,
          sortOrder: 0,
        },
      });
    }
    console.log(`Seeded ${catAds.length} category ads.`);
  } catch {
    console.log("Skipping category ads (run prisma migrate first).");
  }

  // Live promo codes (validated at checkout — no hardcoded demo codes)
  for (const pc of [
    { code: "TECH10", type: "PERCENTAGE", value: 10, minSubtotal: 10000 },
    { code: "FLAT500", type: "FIXED", value: 500, minSubtotal: 5000 },
  ]) {
    // update:{} — promos are owned in /admin (toggles, usage counts survive redeploys).
    await prisma.promoCode.upsert({
      where: { code: pc.code },
      update: {},
      create: { code: pc.code, type: pc.type as never, value: pc.value, minSubtotal: pc.minSubtotal, active: true },
    }).catch(() => null);
  }
  console.log("Seeded promo codes.");

  // Admin login (email + password). Set ADMIN_EMAIL / ADMIN_PASSWORD env vars;
  // defaults below must be changed after first login.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@phonelaptops.co.ke";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" as never },
    create: { name: "Store Admin", email: adminEmail, passwordHash, role: "ADMIN" as never },
  }).catch(() => console.log("Skipping admin user (run prisma migrate first)."));
  console.log(`Admin login ready: ${adminEmail}${process.env.ADMIN_PASSWORD ? "" : " (default password — change it!)"}`);

  // Site settings defaults (editable from /admin → Settings)
  const { SITE_DEFAULTS } = await import("../src/lib/site-settings");
  for (const [key, value] of Object.entries(SITE_DEFAULTS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    }).catch(() => null);
  }
  console.log("Seeded site settings.");

  // Blog posts (update:{} — editors own them after first seed).
  const { BLOG_POSTS } = await import("../src/data/blog-posts");
  for (const b of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {},
      create: { ...b, published: true },
    }).catch(() => null);
  }
  console.log(`Seeded ${BLOG_POSTS.length} blog posts.`);

  // Buying guides (update:{} — editors own them after first seed).
  const { GUIDES } = await import("../src/data/guides");
  for (const g of GUIDES) {
    await prisma.guide.upsert({
      where: { slug: g.slug },
      update: {},
      create: {
        slug: g.slug,
        title: g.title,
        description: g.description,
        cover: g.cover ?? null,
        intro: g.intro,
        sections: g.sections as never,
        relatedSlugs: g.relatedSlugs,
        faqs: g.faqs as never,
        keywords: g.keywords,
        readMins: g.readMins,
        updated: g.updated,
        published: true,
      },
    }).catch(() => null);
  }
  console.log(`Seeded ${GUIDES.length} guides.`);

  // Single source of truth top-up: guarantees every default ad exists with a
  // distinct id (older inline blocks reused one id for two squares).
  // update:{} — never overwrites admin edits.
  const { ALL_DEFAULT_ADS } = await import("../src/data/default-ads");
  let ensured = 0;
  for (const a of ALL_DEFAULT_ADS) {
    await prisma.adSlot.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        title: a.title,
        image: a.image,
        link: a.link,
        placement: a.placement as never,
        target: a.target,
        format: a.format as never,
        sortOrder: a.sortOrder,
      },
    }).then(() => ensured++).catch(() => null);
  }
  console.log(`Ensured ${ensured}/${ALL_DEFAULT_ADS.length} default ads.`);
}

main().finally(() => prisma.$disconnect());
