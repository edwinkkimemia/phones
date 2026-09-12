"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductT } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Price } from "@/components/ui";
import { kes, savings } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Homepage product grid: SSR paints the server order (no hydration
// mismatch), then reshuffles on mount so every refresh shows new picks.
export function ShuffleGrid({ items, count = 4 }: { items: ProductT[]; count?: number }) {
  const [shown, setShown] = useState(() => items.slice(0, count));
  useEffect(() => {
    setShown(shuffle(items).slice(0, count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {shown.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// The two hero feature cards: server picks for first paint,
// fresh random pair on every load.
export function HeroFeatures({ pool, initial }: { pool: ProductT[]; initial: ProductT[] }) {
  const [pair, setPair] = useState<ProductT[]>(() =>
    initial.length >= 2 ? initial.slice(0, 2) : [...initial, ...pool].slice(0, 2)
  );
  useEffect(() => {
    const picks = shuffle(pool.filter((p) => p.stockStatus !== "OUT_OF_STOCK"));
    if (picks.length >= 2) setPair(picks.slice(0, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [heroMain, second] = pair.length >= 2 ? pair : [...pair, ...pool].slice(0, 2);
  if (!heroMain || !second) return null;
  const save = savings(heroMain.price, heroMain.compareAtPrice);

  return (
    <div className="grid grid-cols-5 gap-3">
      <div className="card col-span-3 overflow-hidden !border-white/10 !bg-white/5 p-3 backdrop-blur">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image src={heroMain.images[0].url} alt={heroMain.name} fill className="object-cover" priority />
          {save !== null ? (
            <span className="absolute left-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-[11px] font-extrabold text-white">
              SAVE {kes(save)}
            </span>
          ) : (
            <span className="absolute left-2 top-2 rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-extrabold text-white">
              FEATURED
            </span>
          )}
        </div>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-brand-300">
          {heroMain.brand} • {heroMain.categoryLabel}
        </p>
        <p className="truncate text-sm font-bold">{heroMain.name}</p>
        <Price price={heroMain.price} compareAt={heroMain.compareAtPrice} size="sm" className="mt-1 [&_span]:!text-white" />
        <Link href={`/${heroMain.category}/${heroMain.slug}`} className="btn-primary mt-3 w-full !py-2.5 text-xs">
          Buy Now
        </Link>
      </div>
      <div className="col-span-2 flex flex-col gap-3">
        <div className="card float-y flex-1 overflow-hidden !border-white/10 !bg-white/5 p-3 backdrop-blur">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <Image src={second.images[0].url} alt={second.name} fill className="object-cover" />
          </div>
          <p className="mt-2 truncate text-[11px] font-bold text-brand-300">
            {second.isNew ? "NEW • " : ""}{second.brand} {second.categoryLabel}
          </p>
          <p className="text-xs font-bold">{kes(second.price)}</p>
          <Link
            href={`/${second.category}/${second.slug}`}
            className="mt-2 block rounded-lg bg-white/10 py-2 text-center text-[11px] font-bold hover:bg-white/20"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
