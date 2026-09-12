"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface AdT {
  title: string;
  image: string;
  link: string;
}

// Full-width (WIDE) image ad above the breadcrumb / page content,
// between homepage sections, or SQUARE ads for sidebars
// (e.g. below "Still deciding?" on the PDP).
// Resolved server-side: exact PRODUCT/CATEGORY/HOMEPAGE match wins, else GLOBAL.
// Managed from /admin → Ads & Banners (AdSlot model).
export default function AdSlot({
  placement,
  target = "all",
  format = "WIDE",
  index = 0,
  bare = false,
  className,
}: {
  placement: "HOMEPAGE" | "CATEGORY" | "PRODUCT";
  target?: string;
  format?: "WIDE" | "SQUARE";
  index?: number;
  bare?: boolean;
  className?: string;
}) {
  const [ad, setAd] = useState<AdT | null>(null);

  useEffect(() => {
    let live = true;
    fetch(
      `/api/ads?placement=${placement}&target=${encodeURIComponent(target)}&format=${format}&index=${index}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (live) setAd(d.ad ?? null);
      })
      .catch(() => null);
    return () => {
      live = false;
    };
  }, [placement, target, format, index]);

  if (!ad) return null;

  const inner = (
    <a
      href={ad.link}
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
