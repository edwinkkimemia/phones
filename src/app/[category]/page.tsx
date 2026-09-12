import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ShopClient from "@/components/ShopClient";
import AdSlot from "@/components/AdSlot";
import { PRODUCTS, CATEGORIES } from "@/data/catalog";

const TITLES: Record<string, { title: string; subtitle: string; desc: string }> = {
  laptops: { title: "Laptops in Kenya", subtitle: "Business • Student • Gaming • Pro", desc: "Business, student, gaming and professional laptops with genuine warranty." },
  desktops: { title: "Desktops in Kenya", subtitle: "Towers • Mini PCs • All-in-One", desc: "Office towers, mini PCs and all-in-one desktops with genuine warranty." },
  storage: { title: "Storage in Kenya", subtitle: "SSDs • HDDs • Flash Drives", desc: "Internal SSDs, external hard drives, flash drives and memory cards." },
  "laptop-bags": { title: "Laptop Bags in Kenya", subtitle: "Backpacks • Messengers • Sleeves", desc: "Padded, anti-theft and water-resistant bags for 13 to 17-inch laptops." },
  "laptop-parts": { title: "Laptop Parts in Kenya", subtitle: "RAM • Chargers • Upgrades", desc: "Genuine RAM, chargers and upgrade parts for all major laptop brands." },
  "phone-parts": { title: "Phone Parts in Kenya", subtitle: "Screens • Batteries • Tools", desc: "Original phone screens, batteries, charging parts and professional repair tools." },
  phones: { title: "Smartphones in Kenya", subtitle: "Samsung • Xiaomi • Tecno • Infinix", desc: "Popular smartphones with 5G, big batteries and great cameras." },
  iphones: { title: "Find Your Next iPhone", subtitle: "Brand New & Certified Pre-Owned", desc: "Latest iPhone models and trusted previous generations. Condition always clearly labelled." },
  tablets: { title: "Tablets in Kenya", subtitle: "Work • Study • Entertainment", desc: "iPads and Android tablets for work, school and family." },
  wearables: { title: "Wearables in Kenya", subtitle: "Smartwatches • Fitness Bands", desc: "Smartwatches and fitness bands with health tracking, GPS and Bluetooth calling." },
  accessories: { title: "Accessories", subtitle: "Chargers • Audio • Bags • Hubs", desc: "Chargers, bags, mice, keyboards, headphones, cables and more." },
  gaming: { title: "Gaming Zone", subtitle: "Laptops • Keyboards • Peripherals", desc: "Gaming laptops, accessories and peripherals." },
  deals: { title: "Today's Tech Deals", subtitle: "Flash • Clearance • Bundles", desc: "Limited offers backed by real stock. When it's gone, it's gone." },
  "new-arrivals": { title: "Just Landed", subtitle: "New this week", desc: "The newest tech to hit our shelves." },
  "best-sellers": { title: "What Kenya Is Buying", subtitle: "Social proof", desc: "Best-selling products based on actual orders." },
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
      {params.category === "iphones" && (
        <div className="bg-ink-950 text-white">
          <div className="container-x py-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">iPhone Store Kenya</p>
            <h1 className="font-display mt-2 text-3xl font-extrabold sm:text-4xl">Find Your Next iPhone</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Every iPhone is clearly labelled <strong>Brand New</strong> or <strong>Pre-Owned</strong> — with storage,
              colour, battery health and warranty shown upfront. Never any ambiguity.
            </p>
            <div className="mt-4 flex gap-2 text-xs font-bold">
              <span className="rounded-lg bg-white/10 px-3 py-1.5">✓ Brand New (Sealed)</span>
              <span className="rounded-lg bg-white/10 px-3 py-1.5">✓ Certified Pre-Owned</span>
              <span className="rounded-lg bg-white/10 px-3 py-1.5">✓ Warranty Included</span>
            </div>
          </div>
        </div>
      )}
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
