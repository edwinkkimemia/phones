"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  BadgeCheck,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Star,
} from "lucide-react";
import type { ProductT } from "@/types";
import { Price, Rating, StockBadge, ConditionBadge } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import AdSlot from "@/components/AdSlot";
import ShareButtons from "@/components/ShareButtons";
import ProductCard from "@/components/ProductCard";
import ExploreCategories, { exploreProducts } from "@/components/ExploreCategories";
import { CATEGORIES, PRODUCTS, REVIEWS } from "@/data/catalog";
import { useCart, useWishlist } from "@/lib/store";
import { toast } from "@/components/toast";
import { kes, productWhatsappMessage, whatsappLink } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ProductDetailClient({ product }: { product: ProductT }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState(1);
  const [liveReviews, setLiveReviews] = useState<{ name: string; rating: number; title?: string | null; body: string }[] | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.variants ?? []).map((v) => [v.name, v.options[1]?.value ?? v.options[0]?.value]))
  );
  const add = useCart((s) => s.add);
  const { toggle, has } = useWishlist();
  const wished = has(product.id);

  const variantLabel = useMemo(
    () => Object.entries(selected).map(([k, v]) => `${k}: ${v}`).join(" · "),
    [selected]
  );
  const delta = useMemo(() => {
    let d = 0;
    for (const v of product.variants ?? []) {
      const opt = v.options.find((o) => o.value === selected[v.name]);
      d += opt?.priceDelta ?? 0;
    }
    return d;
  }, [product.variants, selected]);

  const finalPrice = product.price + delta;
  // Gallery skips dead images automatically: a failed URL is dropped and the
  // next working image takes over, so one bad creative never blanks the page.
  const liveImages = useMemo(
    () => (product.images ?? []).filter((im) => im?.url && !failed[im.url]),
    [product.images, failed]
  );
  const current = liveImages.find((im) => im.url === imgUrl) ?? liveImages[0];
  const mainSrc = current?.url ?? "/logo.png";
  const markFailed = (url: string) => setFailed((f) => (f[url] ? f : { ...f, [url]: true }));
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  // Cross-category discovery: top sellers from *other* categories, rotated
  // per product so every page surfaces something different but stable.
  const explore = useMemo(
    () => exploreProducts(PRODUCTS.filter((p) => p.id !== product.id), product.category, product.id),
    [product.id, product.category]
  );

  const waUrl = whatsappLink(
    productWhatsappMessage(product.name, finalPrice, `https://phonelaptops.co.ke/${product.category}/${product.slug}`)
  );

  // Live verified reviews (falls back to featured reviews when none yet).
  useEffect(() => {
    let live = true;
    fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (live && Array.isArray(d.reviews) && d.reviews.length > 0) setLiveReviews(d.reviews.slice(0, 4));
      })
      .catch(() => null);
    return () => {
      live = false;
    };
  }, [product.id]);

  const doAdd = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: liveImages[0]?.url ?? product.images[0]?.url ?? "",
      price: finalPrice,
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice + delta : undefined,
      qty,
      variantLabel: variantLabel || undefined,
    });
    toast("Added to cart", `${product.name} × ${qty}`);
  };

  return (
    <>
    <AdSlot placement="PRODUCT" target={product.slug} category={product.category} />
    <div className="container-x py-6 md:py-10">
      <nav className="flex items-center gap-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/${product.category}`} className="hover:text-brand-700">{product.categoryLabel}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="card relative aspect-square overflow-hidden">
            <Image
              key={mainSrc}
              src={mainSrc}
              alt={current?.alt ?? product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
              onError={() => {
                if (current) markFailed(current.url);
              }}
            />
            <div className="absolute left-3 top-3 flex gap-1.5">
              <ConditionBadge condition={product.condition} />
              {product.isNew && (
                <span className="rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">New</span>
              )}
            </div>
          </div>
          {liveImages.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {liveImages.map((im) => (
                <button
                  key={im.url}
                  onClick={() => setImgUrl(im.url)}
                  className={cn("relative aspect-square overflow-hidden rounded-xl border-2", current?.url === im.url ? "border-brand-600" : "border-transparent")}
                >
                  <Image src={im.url} alt={im.alt} fill sizes="(max-width: 1024px) 25vw, 12vw" className="object-cover" onError={() => markFailed(im.url)} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{product.brand}</p>
          <h1 className="font-display mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Rating value={product.rating} count={product.reviewCount} />
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">{product.soldCount} sold</span>
          </div>
          <div className="mt-3">
            <StockBadge status={product.stockStatus} qty={product.stockQty} />
          </div>
          <Price price={finalPrice} compareAt={product.compareAtPrice ? product.compareAtPrice + delta : undefined} size="xl" className="mt-3" />

          {product.variants?.map((v) => (
            <div key={v.name} className="mt-4">
              <p className="label">{v.name}</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setSelected((s) => ({ ...s, [v.name]: o.value }))}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-bold transition",
                      selected[v.name] === o.value
                        ? "border-ink-950 bg-ink-950 text-white"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    )}
                  >
                    {o.value}
                    {o.priceDelta ? <span className="ml-1 text-xs opacity-70">{o.priceDelta > 0 ? "+" : ""}{kes(o.priceDelta)}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="card mt-5 space-y-2.5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment options</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <span className="rounded-xl bg-emerald-50 px-2 py-2.5 text-emerald-800">M-Pesa</span>
              <span className="rounded-xl bg-slate-100 px-2 py-2.5 text-slate-700">Card</span>
              <span className="rounded-xl bg-slate-100 px-2 py-2.5 text-slate-700">Pay on Delivery</span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Truck className="h-4 w-4 text-brand-600" /> Delivery available across Kenya — fee & ETA shown at checkout.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-slate-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-10 place-items-center" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-extrabold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stockQty || 99, qty + 1))} className="grid h-11 w-10 place-items-center" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => toggle(product.id)} aria-label="Wishlist" className={cn("grid h-11 w-11 place-items-center rounded-xl border", wished ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500")}>
              <Heart className={cn("h-5 w-5", wished && "fill-current")} />
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <Link href={`/checkout?buy=${product.slug}&qty=${qty}`} className="btn-primary w-full !py-4 !text-base">
              <Zap className="h-5 w-5" /> BUY NOW — {kes(finalPrice * qty)}
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={doAdd} className="btn-accent !py-3.5 text-sm">
                <ShoppingCart className="h-4 w-4" /> ADD TO CART
              </button>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-whatsapp !py-3.5 text-sm">
                <WhatsAppIcon className="h-4 w-4" /> WHATSAPP ORDER
              </a>
            </div>
            <a href={waUrl} target="_blank" rel="noreferrer" className="text-center text-xs font-semibold text-slate-500 hover:text-emerald-700">
              Ask about this product — we reply in minutes
            </a>
            <ShareButtons name={product.name} price={finalPrice} url={`https://phonelaptops.co.ke/${product.category}/${product.slug}`} />
          </div>

          <div className="card mt-5 p-4">
            <p className="text-sm font-extrabold">Why buy from PhoneLaptops.co.ke?</p>
            <ul className="mt-2 grid gap-1.5 text-[13px] text-slate-600 sm:grid-cols-2">
              {["✓ Authentic products", "✓ Competitive pricing", "✓ Secure payments", "✓ Warranty support", "✓ Delivery across Kenya", "✓ Customer support"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="section-title !text-xl">Specifications</h2>
          <div className="card mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-50/70" : "bg-white"}>
                    <td className="w-40 px-4 py-3 font-semibold text-slate-500">{s.key}</td>
                    <td className="px-4 py-3 font-medium">{s.value}</td>
                  </tr>
                ))}
                <tr className="bg-white">
                  <td className="px-4 py-3 font-semibold text-slate-500">Condition</td>
                  <td className="px-4 py-3 font-medium">{product.condition === "NEW" ? "Brand New (Sealed)" : "Certified Pre-Owned — tested & graded"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="section-title mt-8 !text-xl">Description</h2>
          {/* Rich text set from /admin — supports paragraphs, lists, bold, links */}
          <div
            className="richtext mt-3"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          <h2 className="section-title mt-8 !text-xl">Verified Reviews</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(liveReviews ?? REVIEWS.slice(0, 2)).map((r) => (
              <figure key={`${r.name}-${r.title ?? r.body.slice(0, 12)}`} className="card p-4">
                <Rating value={r.rating} />
                <p className="mt-1 text-sm font-bold">{r.title || "Verified review"}</p>
                <blockquote className="mt-1 text-sm text-slate-600">“{r.body}”</blockquote>
                <figcaption className="mt-2 text-xs text-slate-500">{r.name} • <span className="font-bold text-emerald-700">✓ Verified Purchase</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Reviews are from verified purchases and moderated by our team.</p>
          <ReviewForm productId={product.id} productName={product.name} />
        </div>

        <aside className="space-y-3">
          <div className="card p-5">
            <p className="font-extrabold">Delivery estimate</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li className="flex justify-between"><span>Nairobi</span><strong>Same-day / Next-day</strong></li>
              <li className="flex justify-between"><span>Mombasa / Kisumu</span><strong>1–2 days</strong></li>
              <li className="flex justify-between"><span>Other towns</span><strong>2–3 days</strong></li>
            </ul>
            <Link href="/delivery" className="mt-3 block text-center text-xs font-bold text-brand-700">Full delivery info →</Link>
          </div>
          <div className="card bg-ink-950 !border-ink-950 p-5 text-white">
            <p className="font-extrabold">Still deciding?</p>
            <p className="mt-1 text-sm text-slate-300">Compare this with similar {product.categoryLabel.toLowerCase()} side-by-side.</p>
            <Link href="/compare" className="mt-3 block rounded-xl bg-white py-2.5 text-center text-sm font-bold text-ink-950">Compare laptops →</Link>
          </div>
          <div>
            <p className="label">Sponsored</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <AdSlot placement="PRODUCT" target={product.slug} category={product.category} format="SQUARE" />
              <AdSlot placement="PRODUCT" target={product.slug} category={product.category} format="SQUARE" index={1} />
            </div>
          </div>
        </aside>
      </div>

      <h2 className="section-title mt-12 !text-xl">You may also like</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
    <div className="mt-2">
      <ExploreCategories
        currentSlug={product.category}
        currentLabel={product.categoryLabel}
        products={explore}
        categories={CATEGORIES}
      />
    </div>
    </>
  );
}

function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", rating: 5, title: "", body: "" });
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost mt-4 !py-2.5 text-xs">
        ✎ Write a review
      </button>
    );
  }
  if (done) {
    return <p className="card mt-4 border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{msg}</p>;
  }

  return (
    <form
      className="card mt-4 space-y-2.5 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg("");
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, ...form }),
        });
        const data = await res.json().catch(() => ({}));
        setBusy(false);
        if (!res.ok) {
          setMsg(data.error ?? "Failed — try again.");
          return;
        }
        setDone(true);
        setMsg(data.message ?? "Thanks! Your review is awaiting moderation.");
      }}
    >
      <p className="font-extrabold">Review this product</p>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-slate-500">Your rating:</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setForm((f) => ({ ...f, rating: s }))}
            aria-label={`${s} stars`}
            className={s <= form.rating ? "text-amber-400" : "text-slate-200"}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input className="input" placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Headline (e.g. Genuine & fast)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" type="email" placeholder="Email (for verified badge)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Phone used at checkout" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" />
      </div>
      <textarea className="input min-h-[90px]" placeholder={`What do you think of the ${productName}? *`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
      {msg && <p className="text-xs font-bold text-red-600">{msg}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn-primary !py-2.5 text-sm disabled:opacity-60">{busy ? "Sending…" : "Submit review"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2.5 text-xs">Cancel</button>
      </div>
      <p className="text-[11px] text-slate-400">Bought here? Verified buyers get a ✓ badge after our team confirms your order.</p>
    </form>
  );
}
