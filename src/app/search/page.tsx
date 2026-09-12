"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, POPULAR_SEARCHES } from "@/data/catalog";

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function score(name: string, q: string): number {
  const n = norm(name);
  const query = norm(q);
  if (!query) return 0;
  if (n.includes(query)) return 100;
  const words = query.split(" ").filter(Boolean);
  let s = 0;
  for (const w of words) {
    if (n.includes(w)) s += 20;
    // cheap typo tolerance: prefix match of length>=4
    if (w.length >= 4 && n.split(" ").some((t) => t.startsWith(w.slice(0, 4)))) s += 5;
  }
  // "under 100k" price hint
  const m = query.match(/under\s+(\d+)\s*k/);
  return s;
}

function SearchBody() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const m = norm(q).match(/under\s+(\d+)\s*k/);
    let list = PRODUCTS.map((p) => ({ p, s: score(`${p.brand} ${p.name} ${p.tagline}`, q) })).filter((x) => x.s > 0);
    if (m) {
      const cap = Number(m[1]) * 1000;
      list = list.filter((x) => x.p.price <= cap);
    }
    return list.sort((a, b) => b.s - a.s).map((x) => x.p);
  }, [q]);

  const brands = [...new Set(results.map((r) => r.brand))];

  return (
    <div className="container-x py-8 md:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Search</p>
      <h1 className="section-title mt-1">
        {q ? <>Results for “{q}”</> : "Search PhoneLaptops"}
      </h1>
      {q && (
        <p className="mt-1 text-sm text-slate-500">
          {results.length} result{results.length === 1 ? "" : "s"}
          {brands.length > 0 && <> • Brands: {brands.join(", ")}</>}
        </p>
      )}
      {!q && (
        <div className="card mt-6 p-5">
          <p className="label">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="chip hover:border-brand-300 hover:bg-brand-50">
                {s}
              </Link>
            ))}
          </div>
          <p className="label mt-5">Try</p>
          <p className="text-sm text-slate-500">“HP laptop 16GB” • “iPhone 15” • “Samsung S25” • “gaming laptop under 100k”</p>
        </div>
      )}
      {q && results.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-bold">No matches for “{q}”</p>
          <p className="mt-1 text-sm text-slate-500">Check spelling, try a brand (“HP”, “Samsung”) or a shorter term (“iPhone”, “charger”).</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.slice(0, 5).map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="chip">{s}</Link>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchBody />
    </Suspense>
  );
}
