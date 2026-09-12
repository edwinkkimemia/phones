"use client";
import { useMemo, useState } from "react";
import type { ProductT } from "@/types";
import ProductCard from "@/components/ProductCard";
import { kes } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "selling" | "rating";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "selling", label: "Best Selling" },
  { key: "rating", label: "Highest Rated" },
];

export default function ShopClient({
  products,
  filters,
  title,
  subtitle,
}: {
  products: ProductT[];
  filters: { brands: string[]; maxPrice: number };
  title: string;
  subtitle: string;
}) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [brand, setBrand] = useState<string>("All");
  const [max, setMax] = useState<number>(filters.maxPrice);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const items = useMemo(() => {
    let list = [...products];
    if (brand !== "All") list = list.filter((p) => p.brand === brand);
    list = list.filter((p) => p.price <= max);
    if (inStockOnly) list = list.filter((p) => p.stockStatus !== "OUT_OF_STOCK");
    if (dealsOnly) list = list.filter((p) => p.isDeal);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "selling":
        list.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
        break;
      default:
        list.sort((a, b) => Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false));
    }
    return list;
  }, [products, brand, max, inStockOnly, dealsOnly, sort]);

  const panel = (
    <div className="space-y-5">
      <div>
        <p className="label">Brand</p>
        <div className="flex flex-wrap gap-1.5">
          {["All", ...filters.brands].map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                brand === b
                  ? "border-ink-950 bg-ink-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Max price — {kes(max)}</p>
        <input
          type="range"
          min={10000}
          max={filters.maxPrice}
          step={1000}
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          className="w-full accent-blue-700"
        />
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>KES 10,000</span>
          <span>{kes(filters.maxPrice)}</span>
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold">
        In stock only
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-blue-700" />
      </label>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold">
        Deals only
        <input type="checkbox" checked={dealsOnly} onChange={(e) => setDealsOnly(e.target.checked)} className="h-4 w-4 accent-blue-700" />
      </label>
      <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-900">
        <p className="font-bold">Need help choosing?</p>
        <p className="mt-1">Chat with a specialist on WhatsApp — we reply in minutes.</p>
        <a
          href="https://wa.me/254715135141?text=Hello%20PhoneLaptops!%20Help%20me%20choose."
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block rounded-lg bg-mpesa px-3 py-2 font-bold text-white"
        >
          Talk to an Expert
        </a>
      </div>
    </div>
  );

  return (
    <div className="container-x py-8 md:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{subtitle}</p>
      <h1 className="section-title mt-1">{title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost !py-2 text-xs lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <p className="text-sm text-slate-500">{items.length} products</p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="input ml-auto !w-auto !rounded-full text-xs font-bold"
          aria-label="Sort"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={`lg:block ${showFilters ? "block" : "hidden"}`}>
          <div className="card p-4 lg:sticky lg:top-36">{panel}</div>
        </aside>
        <div>
          {items.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="font-bold">No products match those filters</p>
              <p className="mt-1 text-sm text-slate-500">Try widening the price range or clearing the brand filter.</p>
              <button onClick={() => { setBrand("All"); setMax(filters.maxPrice); setInStockOnly(false); setDealsOnly(false); }} className="btn-ghost mt-4 text-xs">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
