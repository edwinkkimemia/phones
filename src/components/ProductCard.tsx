"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, GitCompareArrows, ShoppingCart } from "lucide-react";
import type { ProductT } from "@/types";
import { Price, Rating, StockBadge, ConditionBadge } from "@/components/ui";
import { useCart, useWishlist, useCompare } from "@/lib/store";
import { toast } from "@/components/toast";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }: { product: ProductT }) {
  const add = useCart((s) => s.add);
  const { toggle: toggleWish, has } = useWishlist();
  const wished = has(product.id);
  const compareToggle = useCompare((s) => s.toggle);
  const compareIds = useCompare((s) => s.ids);
  const inCompare = compareIds.includes(product.id);

  const url = `/${product.category}/${product.slug}`;

  return (
    <div className="card group relative flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-pop">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link href={url} aria-label={product.name}>
          <Image
            src={product.images[0]?.url ?? ""}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          <ConditionBadge condition={product.condition} />
          {product.isNew && (
            <span className="w-fit rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              New
            </span>
          )}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            onClick={() => {
              toggleWish(product.id);
              toast(wished ? "Removed from wishlist" : "Saved to wishlist", product.name);
            }}
            aria-label="Wishlist"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow transition active:scale-90",
              wished ? "text-red-600" : "text-slate-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-current")} />
          </button>
          <button
            onClick={() => {
              compareToggle(product.id);
              toast("Compare updated", "View up to 4 products on the Compare page.");
            }}
            aria-label="Compare"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow transition active:scale-90",
              inCompare ? "text-brand-600" : "text-slate-500 hover:text-brand-600"
            )}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>
        <Link
          href={url}
          className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-2 rounded-xl bg-ink-950/90 py-2.5 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100 md:inline-flex"
        >
          <Eye className="h-4 w-4" /> Quick View
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            {product.brand}
          </span>
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <Link href={url} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900 hover:text-brand-700">
          {product.name}
        </Link>
        <p className="hidden truncate text-xs text-slate-500 sm:block">{product.tagline}</p>
        <StockBadge status={product.stockStatus} qty={product.stockQty} />
        <Price price={product.price} compareAt={product.compareAtPrice} size="md" />
        <div className="mt-auto flex gap-2 pt-2">
          <button
            onClick={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                image: product.images[0]?.url ?? "",
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                qty: 1,
              });
              toast("Added to cart", product.name);
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:border-ink-950 hover:bg-ink-950 hover:text-white active:scale-[.98]"
          >
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
          <Link
            href={`/checkout?buy=${product.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 active:scale-[.98]"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
