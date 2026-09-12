import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ShopClient from "@/components/ShopClient";
import AdSlot from "@/components/AdSlot";
import { PRODUCTS, CATEGORIES } from "@/data/catalog";

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
    title: "Smartphones in Kenya", subtitle: "Samsung • Xiaomi • Tecno • Infinix",
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

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const t = TITLES[params.category];
  if (!t) return {};
  return {
    title: `${t.title} — Best Prices in Kenya`,
    description: t.desc,
    alternates: { canonical: `https://phonelaptops.co.ke/${params.category}` },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const meta = TITLES[params.category];
  if (!meta) notFound();

  let items = PRODUCTS;
  if (params.category === "deals") items = PRODUCTS.filter((p) => p.isDeal);
  else if (params.category === "new-arrivals") items = PRODUCTS.filter((p) => p.isNew).concat(PRODUCTS.slice(0, 4));
  else if (params.category === "best-sellers") items = [...PRODUCTS].sort((a, b) => b.soldCount - a.soldCount);
  else if (params.category === "phones")
    items = PRODUCTS.filter((p) => p.category === "smartphones" || p.category === "iphones");
  else items = PRODUCTS.filter((p) => p.category === params.category);

  const brands = [...new Set(items.map((p) => p.brand))];
  const maxPrice = Math.max(...items.map((p) => p.price), 50000);

  const cat = CATEGORIES.find((c) => c.slug === params.category);

  return (
    <>
      <div className="bg-ink-950 text-white">
        <div className="container-x py-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{meta.hero.eyebrow}</p>
          <h1 className="font-display mt-2 text-3xl font-extrabold sm:text-4xl">{meta.hero.heading}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            {meta.hero.blurb}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            {meta.hero.badges.map((b) => (
              <span key={b} className="rounded-lg bg-white/10 px-3 py-1.5">{b}</span>
            ))}
          </div>
        </div>
      </div>
      <nav className="container-x flex items-center gap-1.5 pt-5 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{meta.title}</span>
      </nav>
      <AdSlot placement="CATEGORY" target={params.category} />
      <ShopClient products={items} filters={{ brands, maxPrice }} title={cat?.name ? `${cat.name} — ${meta.title}` : meta.title} subtitle={meta.subtitle} />
    </>
  );
}
