import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { CategoryT, ProductT } from "@/types";

// Shared cross-category discovery panel: quick pills to other categories +
// a 4-product grid of top sellers from outside the current category.
// Pure render (no hooks/data fetching) so it works in server pages and
// inside client components alike.
export default function ExploreCategories({
  currentSlug,
  currentLabel,
  products,
  categories,
}: {
  currentSlug: string;
  currentLabel: string;
  products: ProductT[];
  categories: CategoryT[];
}) {
  const others = categories.filter((c) => c.slug !== currentSlug).slice(0, 6);
  if (products.length === 0 && others.length === 0) return null;
  return (
    <section className="container-x pb-10 md:pb-14">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Beyond {currentLabel}</p>
        <h2 className="section-title mt-1 !text-xl">Explore other categories</h2>
        <p className="mt-1 text-sm text-slate-500">
          Top-rated picks from across the store — bundle them with your {currentLabel.toLowerCase()} order in one delivery.
        </p>
        {others.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
        {products.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Top in-stock sellers outside `slug`, rotated deterministically by `salt`
// so every page surfaces a different but stable mix.
export function exploreProducts(all: ProductT[], slug: string, salt: string, count = 4): ProductT[] {
  const pool = all
    .filter((p) => p.category !== slug && p.stockStatus !== "OUT_OF_STOCK")
    .sort((a, b) => b.soldCount - a.soldCount);
  if (pool.length === 0) return pool;
  let h = 0;
  for (let i = 0; i < salt.length; i++) h = (Math.imul(h, 31) + salt.charCodeAt(i)) | 0;
  const off = Math.abs(h) % pool.length;
  return [...pool.slice(off), ...pool.slice(0, off)].slice(0, count);
}
