import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ShopClient from "@/components/ShopClient";
import AdSlot from "@/components/AdSlot";
import PageHero from "@/components/PageHero";
import CrossSell, { CROSS_SELL, DEFAULT_CROSS_SELL } from "@/components/CrossSell";
import ExploreCategories, { exploreProducts } from "@/components/ExploreCategories";
import { PRODUCTS, CATEGORIES } from "@/data/catalog";
import type { ProductT } from "@/types";
import { getLiveCategory } from "@/lib/catalog-server";

export const dynamicParams = true;

interface CatMeta {
  title: string;
  subtitle: string;
  desc: string;
  hero: { eyebrow: string; heading: string; blurb: string; badges: [string, string, string] };
}

const TITLES: Record<string, CatMeta> = {
  laptops: {
    title: "Laptops in Kenya", subtitle: "Business • Student • Gaming • Pro",
    desc: "Business, student, gaming and professional laptops with genuine warranty.",
    hero: { eyebrow: "Laptop Store Kenya", heading: "Find Your Perfect Laptop", blurb: "Business, student, gaming and professional machines — every spec verified, every unit sealed with warranty. Tell us your budget and use-case and we'll match you in minutes.", badges: ["✓ Sealed & Genuine", "✓ 8GB–16GB+ RAM", "✓ Warranty Included"] },
  },
  desktops: {
    title: "Desktops in Kenya", subtitle: "Towers • Mini PCs • All-in-One",
    desc: "Office towers, mini PCs and all-in-one desktops with genuine warranty.",
    hero: { eyebrow: "Desktop Store Kenya", heading: "Power for Office & Studio", blurb: "Office towers, space-saving mini PCs and all-in-ones — more performance per shilling than any laptop. Ideal for offices, studios and cyber cafés.", badges: ["✓ Office Ready", "✓ Wi-Fi + Windows 11", "✓ Warranty Included"] },
  },
  storage: {
    title: "Storage in Kenya", subtitle: "SSDs • HDDs • Flash Drives",
    desc: "Internal SSDs, external hard drives, flash drives and memory cards.",
    hero: { eyebrow: "Storage Store Kenya", heading: "Never Run Out of Space", blurb: "NVMe SSDs that make old laptops feel new, rugged external drives for backup, and pocket flash drives — all genuine with manufacturer warranties up to 5 years.", badges: ["✓ Genuine Brands", "✓ Up to 5-Yr Warranty", "✓ Free Fit Advice"] },
  },
  "laptop-bags": {
    title: "Laptop Bags in Kenya", subtitle: "Backpacks • Messengers • Sleeves",
    desc: "Padded, anti-theft and water-resistant bags for 13 to 17-inch laptops.",
    hero: { eyebrow: "Carry in Style", heading: "Laptop Bags That Protect", blurb: "Padded compartments, anti-theft pockets and water-resistant fabrics — sized honestly for 13 to 17-inch machines, built for Nairobi commutes.", badges: ["✓ Padded Compartments", "✓ Anti-Theft Options", "✓ Water-Resistant"] },
  },
  "laptop-parts": {
    title: "Laptop Parts in Kenya", subtitle: "RAM • Chargers • Upgrades",
    desc: "Genuine RAM, chargers and upgrade parts for all major laptop brands.",
    hero: { eyebrow: "Genuine Spares", heading: "Original Laptop Parts", blurb: "Original-spec RAM, batteries, chargers and screens for HP, Lenovo, Dell and more. Send your model on WhatsApp — we confirm fit free before you pay.", badges: ["✓ Original Spec", "✓ Free Fit Check", "✓ 6-Month Warranty"] },
  },
  "phone-parts": {
    title: "Phone Parts in Kenya", subtitle: "Screens • Batteries • Tools",
    desc: "Original phone screens, batteries, charging parts and professional repair tools.",
    hero: { eyebrow: "Repair, Don't Replace", heading: "Original Phone Parts", blurb: "Original AMOLED screens, zero-cycle batteries and pro toolkits — with free fitting advice and Nairobi fitting on request. Fix it for a fraction of a new phone.", badges: ["✓ Original Quality", "✓ 100% Battery Health", "✓ Fitting Available"] },
  },
  phones: {
    title: "Phones in Kenya", subtitle: "Samsung • Xiaomi • Tecno • Infinix",
    desc: "Popular smartphones with 5G, big batteries and great cameras.",
    hero: { eyebrow: "Phone Store Kenya", heading: "Phones Kenyans Love", blurb: "Samsung, Xiaomi, Tecno, Infinix and more — 5G-ready, big batteries, great cameras. Sealed stock with 1-year warranty at honest Kenyan prices.", badges: ["✓ Sealed & Genuine", "✓ 5G Ready", "✓ 1-Year Warranty"] },
  },
  iphones: {
    title: "Find Your Next iPhone", subtitle: "Brand New & Certified Pre-Owned",
    desc: "Latest iPhone models and trusted previous generations. Condition always clearly labelled.",
    hero: { eyebrow: "iPhone Store Kenya", heading: "Find Your Next iPhone", blurb: "Every iPhone is clearly labelled Brand New or Pre-Owned — with storage, colour, battery health and warranty shown upfront. Never any ambiguity.", badges: ["✓ Brand New (Sealed)", "✓ Certified Pre-Owned", "✓ Warranty Included"] },
  },
  tablets: {
    title: "Tablets in Kenya", subtitle: "Work • Study • Entertainment",
    desc: "iPads and Android tablets for work, school and family.",
    hero: { eyebrow: "Tablet Store Kenya", heading: "Work, Study & Play", blurb: "iPads and Android tablets for e-learning, campus, office and family entertainment — with kid-safe picks and keyboard-ready options.", badges: ["✓ iPad & Android", "✓ E-Learning Ready", "✓ Warranty Included"] },
  },
  wearables: {
    title: "Wearables in Kenya", subtitle: "Smartwatches • Fitness Bands",
    desc: "Smartwatches and fitness bands with health tracking, GPS and Bluetooth calling.",
    hero: { eyebrow: "Wearables Store Kenya", heading: "Smartwatches for Every Wrist", blurb: "Track health, take calls and leave the phone behind — from Kenya's favourite budget watches to flagship Galaxy Watch with LTE.", badges: ["✓ Heart & SpO2 Tracking", "✓ BT Calling", "✓ 1-Year Warranty"] },
  },
  accessories: {
    title: "Accessories", subtitle: "Chargers • Audio • Bags • Hubs",
    desc: "Chargers, bags, mice, keyboards, headphones, cables and more.",
    hero: { eyebrow: "Complete Your Setup", heading: "Accessories That Last", blurb: "Original chargers, booming audio, precision mice and rugged cables from Anker, JBL, Logitech and more — the small things, done properly.", badges: ["✓ Original Brands", "✓ Fast Charging", "✓ Warranty Included"] },
  },
  gaming: {
    title: "Gaming Zone", subtitle: "Laptops • Keyboards • Peripherals",
    desc: "Gaming laptops, accessories and peripherals.",
    hero: { eyebrow: "Gaming Zone Kenya", heading: "Gear Up. Game Hard.", blurb: "RTX gaming laptops, mechanical keyboards and pro peripherals — high refresh rates, real thermals, honest frames-per-shilling.", badges: ["✓ RTX Graphics", "✓ 144Hz Displays", "✓ Warranty Included"] },
  },
  deals: {
    title: "Today's Tech Deals", subtitle: "Flash • Clearance • Bundles",
    desc: "Limited offers backed by real stock. When it's gone, it's gone.",
    hero: { eyebrow: "Limited Offers", heading: "Today's Tech Deals", blurb: "Flash deals, clearance and bundles at genuinely lower prices — backed by real stock counts. When it's gone, it's gone.", badges: ["✓ Real Discounts", "✓ Live Stock Counts", "✓ M-Pesa Checkout"] },
  },
  "new-arrivals": {
    title: "Just Landed", subtitle: "New this week",
    desc: "The newest tech to hit our shelves.",
    hero: { eyebrow: "Fresh Stock", heading: "Just Landed", blurb: "The newest tech to hit our shelves — latest generations, first in Kenya. New arrivals move fast, so don't sleep on them.", badges: ["✓ Latest Generations", "✓ Sealed Stock", "✓ First in Kenya"] },
  },
  "best-sellers": {
    title: "What Kenya Is Buying", subtitle: "Social proof",
    desc: "Best-selling products based on actual orders.",
    hero: { eyebrow: "Crowd Favourites", heading: "What Kenya Is Buying", blurb: "Ranked by real orders from real customers across Kenya — the safest shortcut to a purchase you won't regret.", badges: ["✓ Real Order Data", "✓ Verified Reviews", "✓ Tried & Tested"] },
  },
};

export function generateStaticParams() {
  return Object.keys(TITLES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const t = TITLES[params.category];
  if (t) {
    return {
      title: `${t.title} — Best Prices in Kenya`,
      description: t.desc,
      alternates: { canonical: `https://phonelaptops.co.ke/${params.category}` },
    };
  }
  const live = await getLiveCategory(params.category);
  if (!live) return {};
  return {
    title: `${live.meta.title} — Best Prices in Kenya`,
    description: live.meta.desc,
    alternates: { canonical: `https://phonelaptops.co.ke/${params.category}` },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const meta = TITLES[params.category];
  if (!meta) {
    // Admin-created slug? Resolve live from the database.
    const live = await getLiveCategory(params.category);
    if (!live) notFound();
    return <LiveCategoryPage slug={params.category} meta={live.meta} hero={live.hero} image={live.image} items={live.items} />;
  }

  let items = PRODUCTS;
  if (params.category === "deals") items = PRODUCTS.filter((p) => p.isDeal);
  else if (params.category === "new-arrivals") items = PRODUCTS.filter((p) => p.isNew).concat(PRODUCTS.slice(0, 4));
  else if (params.category === "best-sellers") items = [...PRODUCTS].sort((a, b) => b.soldCount - a.soldCount);
  else if (params.category === "phones")
    items = PRODUCTS.filter((p) => p.category === "phones" || p.category === "iphones");
  else items = PRODUCTS.filter((p) => p.category === params.category);

  const brands = [...new Set(items.map((p) => p.brand))];
  const maxPrice = Math.max(...items.map((p) => p.price), 50000);

  const cat = CATEGORIES.find((c) => c.slug === params.category);
  // Collection pages have no catalog image — give them their own backdrops.
  const heroImage =
    cat?.image ??
    ({
      deals: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1600&q=80",
      "new-arrivals": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=80",
      "best-sellers": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80",
    } as Record<string, string>)[params.category];

  return (
    <>
      <PageHero eyebrow={meta.hero.eyebrow} heading={meta.hero.heading} blurb={meta.hero.blurb} badges={[...meta.hero.badges]} image={heroImage} />
      <nav className="container-x flex items-center gap-1.5 pt-5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{meta.title}</span>
      </nav>
      <AdSlot placement="CATEGORY" target={params.category} />
      <ShopClient key={params.category} products={items} filters={{ brands, maxPrice }} title={cat?.name ? `${cat.name} — ${meta.title}` : meta.title} subtitle={meta.subtitle} />
      <CrossSell content={CROSS_SELL[params.category] ?? DEFAULT_CROSS_SELL} />
      <ExploreCategories
        currentSlug={params.category}
        currentLabel={cat?.name ?? meta.title}
        products={exploreProducts(PRODUCTS, params.category, params.category)}
        categories={CATEGORIES}
      />
    </>
  );
}

// Admin-created category slug: same layout, live data.
function LiveCategoryPage({
  slug,
  meta,
  hero,
  image,
  items,
}: {
  slug: string;
  meta: { title: string; subtitle: string; desc: string };
  hero: { eyebrow: string; heading: string; blurb: string; badges: [string, string, string] };
  image?: string;
  items: ProductT[];
}) {
  const brands = [...new Set(items.map((p) => p.brand))];
  const maxPrice = items.length > 0 ? Math.max(...items.map((p) => p.price)) : 50000;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} heading={hero.heading} blurb={hero.blurb} badges={[...hero.badges]} image={image} />
      <nav className="container-x flex items-center gap-1.5 pt-5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{meta.title}</span>
      </nav>
      <AdSlot placement="CATEGORY" target={slug} />
      <ShopClient key={slug} products={items} filters={{ brands, maxPrice }} title={meta.title} subtitle={meta.subtitle} />
      <CrossSell content={CROSS_SELL[slug] ?? DEFAULT_CROSS_SELL} />
      <ExploreCategories
        currentSlug={slug}
        currentLabel={meta.title}
        products={exploreProducts(PRODUCTS, slug, slug)}
        categories={CATEGORIES}
      />
    </>
  );
}
