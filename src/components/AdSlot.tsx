"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface AdT {
  title: string;
  image: string;
  link: string;
}

// Full-width (WIDE) image ad above breadcrumbs / between sections,
// or SQUARE ads for sidebars (product + blog + guide pages).
// Resolved server-side: exact match wins, then parent category, then global.
// Falls back client-side to the admin's GLOBAL ads so a slot never stays
// empty when a global fallback exists.
// Managed from /admin → Ads & Banners (AdSlot model).
export default function AdSlot({
  placement,
  target = "all",
  category,
  format = "WIDE",
  index = 0,
  bare = false,
  className,
}: {
  placement: "HOMEPAGE" | "CATEGORY" | "PRODUCT" | "BLOG" | "GUIDES" | "GLOBAL";
  target?: string;
  category?: string;
  format?: "WIDE" | "SQUARE";
  index?: number;
  bare?: boolean;
  className?: string;
}) {
  const [ad, setAd] = useState<AdT | null>(null);
  const [badSrc, setBadSrc] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const qs = new URLSearchParams({ placement, target, format, index: String(index) });
    if (category) qs.set("category", category);
    fetch(`/api/ads?${qs.toString()}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (!live) return;
        if (d.ad) {
          setAd(d.ad);
          return;
        }
        // Explicit GLOBAL fallback to the ads set by admin (/admin → Ads & Banners).
        // The API already tiers GLOBAL last, but this guarantees a global creative
        // fills the slot even if placement filtering ever changes.
        if (placement !== "GLOBAL") {
          try {
            const gqs = new URLSearchParams({
              placement: "GLOBAL",
              target: "all",
              format,
              index: String(index),
            });
            const gr = await fetch(`/api/ads?${gqs.toString()}`);
            const gd = await gr.json();
            if (live) setAd(gd.ad ?? null);
          } catch {
            if (live) setAd(null);
          }
        } else {
          setAd(null);
        }
      })
      .catch(() => null);
    return () => {
      live = false;
    };
  }, [placement, target, category, format, index]);

  // No image (or a broken one) → render nothing instead of an empty frame.
  if (!ad || !ad.image || ad.image === badSrc) return null;

  const external = /^https?:\/\//i.test(ad.link);
  const inner = (
    <a
      href={ad.link}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,.06),0_8px_24px_-12px_rgba(16,24,40,.18)]",
        className
      )}
      aria-label={ad.title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ad.image}
        alt={ad.title}
        loading="lazy"
        onError={() => setBadSrc(ad.image)}
        className={cn(
          "w-full object-cover transition duration-500 group-hover:scale-[1.02]",
          format === "SQUARE" ? "aspect-square" : "h-28 sm:h-36 md:h-44"
        )}
      />
      <span className="absolute bottom-2 right-2 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
        Ad
      </span>
    </a>
  );

  if (bare || format === "SQUARE") return inner;
  return <div className="container-x pt-4 md:pt-6">{inner}</div>;
}
