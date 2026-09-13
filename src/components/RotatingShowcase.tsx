"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, MessageCircle, PackageCheck, Truck } from "lucide-react";
import type { ProductT } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Price } from "@/components/ui";
import { WHATSAPP_NUMBER, cn, discountPct, kes, savings, whatsappLink } from "@/lib/utils";

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

// Saruk-style merchandised hero: a controllable, autoplaying deal carousel
// (deterministic daily order from the server — no client reshuffle, so no
// hydration mismatch or surprise picks) plus a side stack with the single
// best discount ("Deal of the Day") and service shortcuts.
// Every slide deep-links to its product; all promo copy is DOM text (SEO).
export function HeroCarousel({ slides }: { slides: ProductT[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [paused, count]);

  if (count === 0) return null;
  const active = slides[index]!;
  const pct = discountPct(active.price, active.compareAtPrice);
  const save = savings(active.price, active.compareAtPrice);
  const low = active.stockStatus === "LOW_STOCK" || (active.stockQty > 0 && active.stockQty <= 8);
  const out = active.stockStatus === "OUT_OF_STOCK";

  // Best % off among in-stock slides → side "Deal of the Day" card.
  const dealOfDay = [...slides]
    .filter((p) => p.stockStatus !== "OUT_OF_STOCK")
    .sort((a, b) => (discountPct(b.price, b.compareAtPrice) ?? -1) - (discountPct(a.price, a.compareAtPrice) ?? -1))[0];
  const dealPct = dealOfDay ? discountPct(dealOfDay.price, dealOfDay.compareAtPrice) : null;

  return (
    <div
      className="grid grid-cols-5 gap-3"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured deals"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Main slide — real product photo, price + scarcity, deep-link CTA. */}
      <div className="card col-span-5 overflow-hidden !border-white/10 !bg-white/5 p-3 backdrop-blur sm:col-span-3">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ink-900">
          <Image
            key={active.id}
            src={active.images[0].url}
            alt={active.images[0].alt || active.name}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/60 to-transparent" />
          {pct !== null ? (
            <span className="absolute left-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-[11px] font-extrabold text-white">
              -{pct}%{save !== null ? ` • SAVE ${kes(save)}` : ""}
            </span>
          ) : (
            <span className="absolute left-2 top-2 rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-extrabold text-white">
              {active.isNew ? "NEW ARRIVAL" : "FEATURED"}
            </span>
          )}
          {count > 1 && (
            <>
              <span className="absolute right-2 top-2 rounded-lg bg-ink-950/80 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
                {index + 1}/{count}
              </span>
              <div className="absolute inset-y-0 left-1 flex items-center">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous deal"
                  className="grid h-8 w-8 place-items-center rounded-full bg-ink-950/70 text-white backdrop-blur transition hover:bg-ink-950"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-1 flex items-center">
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next deal"
                  className="grid h-8 w-8 place-items-center rounded-full bg-ink-950/70 text-white backdrop-blur transition hover:bg-ink-950"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>

        <div aria-live="polite">
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-brand-300">
            {active.brand} • {active.categoryLabel}
          </p>
          <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-white">
            <Link href={`/${active.category}/${active.slug}`} className="hover:underline">
              {active.name}
            </Link>
          </p>
          <Price price={active.price} compareAt={active.compareAtPrice} size="sm" className="mt-1 [&>span:first-child]:!text-white" />
          <p className={cn("mt-1.5 text-[11px] font-bold", low ? "text-amber-300" : "text-emerald-300")}>
            {out ? "Out of stock — ask for restock date" : low ? `Only ${active.stockQty} left — order today` : "In stock • Same-day Nairobi dispatch"}
          </p>
          <div className="mt-2.5 flex gap-2">
            <Link href={`/${active.category}/${active.slug}`} className="btn-primary flex-1 !py-2.5 text-xs">
              Buy Now
            </Link>
            <a
              href={whatsappLink(`Hello PhoneLaptops! Is the ${active.name} (${kes(active.price)}) in stock?`, WHATSAPP_NUMBER)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ask about ${active.name} on WhatsApp`}
              className="grid w-11 place-items-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {count > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5" role="tablist" aria-label="Choose deal">
            {slides.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Deal ${i + 1}: ${s.brand} ${s.categoryLabel}`}
                onClick={() => go(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-white/25 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side stack — mirrors Saruk's side banners: urgency + service. */}
      <div className="col-span-5 flex gap-3 sm:col-span-2 sm:flex-col">
        {dealOfDay && (
          <Link
            href={`/${dealOfDay.category}/${dealOfDay.slug}`}
            className="card group flex-1 overflow-hidden !border-amber-300/30 !bg-gradient-to-br !from-amber-400/15 !to-transparent p-3 backdrop-blur transition hover:!border-amber-300/60"
          >
            <p className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              <Flame className="h-3.5 w-3.5" /> Deal of the day
            </p>
            <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-lg bg-ink-900">
              <Image
                src={dealOfDay.images[0].url}
                alt={dealOfDay.images[0].alt || dealOfDay.name}
                fill
                sizes="300px"
                className="object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {dealPct !== null && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  -{dealPct}%
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-bold leading-snug text-white">{dealOfDay.name}</p>
            <p className="mt-1 text-sm font-extrabold text-white">{kes(dealOfDay.price)}</p>
            <span className="mt-2 block rounded-lg bg-amber-400 py-2 text-center text-[11px] font-extrabold text-ink-950 transition group-hover:bg-amber-300">
              Grab this deal
            </span>
          </Link>
        )}
        <div className="card hidden flex-1 flex-col justify-center gap-2 !border-white/10 !bg-white/5 p-3 backdrop-blur sm:flex">
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-white">
            <Truck className="h-4 w-4 text-accent" /> Same-day Nairobi
          </p>
          <p className="text-[11px] leading-snug text-slate-300">Order before 4pm. M-Pesa or pay on delivery.</p>
          <div className="flex gap-2">
            <Link href="/delivery" className="flex-1 rounded-lg bg-white/10 py-2 text-center text-[11px] font-bold text-white hover:bg-white/20">
              Delivery info
            </Link>
            <Link href="/track-order" className="flex-1 rounded-lg bg-white/10 py-2 text-center text-[11px] font-bold text-white hover:bg-white/20">
              Track order
            </Link>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-300" /> 1-yr warranty • <Link href="/warranty" className="font-bold text-slate-200 underline">Learn more</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Back-compat alias (Hero used this before the carousel switch).
export function HeroFeatures({ pool, initial }: { pool: ProductT[]; initial: ProductT[] }) {
  const slides = initial.length >= 2 ? initial : [...initial, ...pool].slice(0, 4);
  return <HeroCarousel slides={slides.slice(0, 4)} />;
}
