import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, Flame, MapPin, MessageCircle, ShieldCheck, Star, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { pickDaily } from "@/lib/rotation";
import { HeroCarousel, ShuffleGrid } from "@/components/RotatingShowcase";
import { CATEGORIES, PRODUCTS, BRANDS, REVIEWS, deals, bestSellers, newArrivals } from "@/data/catalog";
import { WHATSAPP_NUMBER, kes, savings, whatsappLink } from "@/lib/utils";
import { getCategories } from "@/lib/catalog-server";
import ProductCard from "@/components/ProductCard";

// Saruk-style category shortcuts inside the hero (deep-links above the fold).
const heroCategories = ["laptops", "iphones", "phones", "accessories", "storage", "wearables", "tablets", "gaming"]
  .map((slug) => CATEGORIES.find((c) => c.slug === slug))
  .filter((c): c is (typeof CATEGORIES)[number] => Boolean(c));

// Curated order for the hero logo ticker (all have files in public/brand).
const heroBrands = ["HP", "Apple", "Samsung", "Lenovo", "Dell", "ASUS", "Xiaomi", "Tecno", "Anker", "JBL", "Oraimo", "Infinix"];

export function Hero() {
  // Deterministic daily merchandising: in-stock featured first, deals fill up
  // to 4 slides. Same order all day (no surprise reshuffles), fresh tomorrow.
  const inStock = (p: (typeof PRODUCTS)[number]) => p.stockStatus !== "OUT_OF_STOCK";
  const featuredPool = PRODUCTS.filter((p) => p.isFeatured && inStock(p));
  const dealFill = deals().filter((p) => inStock(p) && !featuredPool.some((f) => f.id === p.id));
  const slides = pickDaily([...featuredPool, ...dealFill], 4, "hero-v2");

  // Live price anchors so the hero always names a real offer (Saruk tactic,
  // kept as DOM text for SEO instead of baked-in banner images).
  const liveDeals = deals().filter(inStock);
  const topDeal = liveDeals.sort((a, b) => (savings(b.price, b.compareAtPrice) ?? -1) - (savings(a.price, a.compareAtPrice) ?? -1))[0];
  const topSave = topDeal ? savings(topDeal.price, topDeal.compareAtPrice) : null;
  const floor = (cat: string) => {
    const ps = PRODUCTS.filter((p) => p.category === cat && inStock(p));
    return ps.length ? Math.min(...ps.map((p) => p.price)) : null;
  };
  const laptopFloor = floor("laptops");
  const iphoneFloor = floor("iphones");

  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      {/* Product-led dark backdrop (no generic stock photo): gradients only. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-900/40" />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(700px 320px at 12% 8%, rgba(59,99,246,.35), transparent), radial-gradient(600px 300px at 88% 18%, rgba(0,213,255,.14), transparent), radial-gradient(800px 400px at 50% 115%, rgba(59,99,246,.22), transparent)",
        }}
      />
      <div className="container-x relative grid gap-8 py-10 md:py-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Nairobi • Same-day delivery
          </p>
          <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Laptops &amp; iPhones in Kenya.{" "}
            <span className="bg-gradient-to-r from-brand-400 via-accent to-brand-400 bg-clip-text text-transparent">
              Genuine stock. Fair prices.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
            HP, Lenovo, Samsung, Apple &amp; more — sealed stock with receipts,
            M-Pesa checkout, 1-year warranty and fast countrywide delivery.
          </p>
          {(topDeal && topSave !== null) || laptopFloor !== null ? (
            <p className="mt-3 flex max-w-md flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-amber-200">
              <Flame className="h-4 w-4 shrink-0 text-amber-400" />
              {topDeal && topSave !== null && (
                <span>
                  Today: SAVE {kes(topSave)} on{" "}
                  <Link href={`/${topDeal.category}/${topDeal.slug}`} className="underline hover:text-amber-100">
                    {topDeal.brand} {topDeal.categoryLabel}
                  </Link>
                </span>
              )}
              {laptopFloor !== null && <span className="text-slate-400">• Laptops from {kes(laptopFloor)}</span>}
              {iphoneFloor !== null && <span className="text-slate-400">• iPhones from {kes(iphoneFloor)}</span>}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/laptops" className="btn-primary !bg-brand-500 !px-6 !py-3 !text-sm hover:!bg-brand-400">
              Shop Laptops <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/iphones"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Shop iPhones
            </Link>
            <a
              href={whatsappLink("Hello PhoneLaptops! I need help choosing a laptop/phone.", WHATSAPP_NUMBER)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <WhatsAppIcon className="h-4 w-4 text-accent" /> Talk to an Expert
            </a>
          </div>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-2 text-xs">
            {[
              { icon: Truck, title: "Same-day Nairobi", sub: "Order before 4pm", href: "/delivery" },
              { icon: CreditCard, title: "M-Pesa & COD", sub: "Pay your way", href: "/delivery" },
              { icon: ShieldCheck, title: "1-Year Warranty", sub: "On every product", href: "/warranty" },
              { icon: MapPin, title: "Nairobi Pickup", sub: "Kimathi St store", href: "/contact" },
            ].map((t) => (
              <Link
                key={t.title}
                href={t.href}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 transition hover:border-white/25 hover:bg-white/10"
              >
                <t.icon className="h-4 w-4 shrink-0 text-accent" />
                <span>
                  <span className="block font-bold text-white">{t.title}</span>
                  <span className="block text-[11px] font-medium text-slate-400">{t.sub}</span>
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-300">
            <span className="flex gap-0.5 text-amber-400" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span className="font-extrabold text-white">4.9/5</span> • 12,400+ verified reviews across Kenya
          </p>
        </div>

        <div className="relative lg:col-span-7">
          <HeroCarousel slides={slides} />
        </div>
      </div>
      {/* Category shortcuts — Saruk's high-converting strip, kept in-hero. */}
      <div className="relative border-t border-white/10 bg-white/[.03]">
        <div className="container-x flex items-center gap-3 overflow-x-auto py-3 no-scrollbar">
          <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Shop by category
          </span>
          {heroCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-white/25 hover:bg-white/10"
            >
              <span className="relative block h-7 w-7 overflow-hidden rounded-full bg-ink-800">
                <Image src={c.image} alt="" fill sizes="28px" className="object-cover" loading="lazy" />
              </span>
              <span className="text-xs font-bold text-white">{c.name}</span>
            </Link>
          ))}
          <Link href="/deals" className="flex shrink-0 items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-red-500">
            🔥 Deals <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="relative border-t border-white/10 bg-white/[.03]">
        <div className="overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="animate-marquee flex w-max items-center" style={{ animationDuration: "26s" }}>
            {[...heroBrands, ...heroBrands].map((b, i) => (
              <span
                key={`${b}-${i}`}
                aria-hidden={i >= heroBrands.length}
                className="mx-1.5 flex h-9 w-32 shrink-0 items-center justify-center rounded-lg bg-white/95 p-1"
              >
                <span className="relative block h-7 w-full">
                  <Image
                    src={BRAND_LOGOS[b.toLowerCase()]}
                    alt={b}
                    fill
                    sizes="110px"
                    className="object-contain"
                  />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export async function CategoryGrid() {
  // Live categories (admin-created included), static catalog as fallback.
  const cats = await getCategories();
  return (
    <section className="container-x py-12 md:py-16">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Browse</p>
          <h2 className="section-title mt-1">Shop by Category</h2>
        </div>
        <Link href="/deals" className="hidden items-center gap-1 text-sm font-bold text-brand-700 hover:gap-2 sm:inline-flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cats.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-pop">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              {c.image ? (
                <Image src={c.image} alt={c.name} fill sizes="300px" className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              ) : null}
              <span className="absolute bottom-2 left-2 rounded-lg bg-ink-950/85 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                {c.count}+ items
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-extrabold">{c.name}</p>
              <p className="truncate text-xs text-slate-500">{c.tagline}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-700">
                Shop now <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DealsSection() {
  const items = deals().slice(0, 4);
  return (
    <section className="border-y border-slate-100 bg-slate-50/70">
      <div className="container-x py-12 md:py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
              🔥 Today's Tech Deals
            </p>
            <h2 className="section-title mt-3">Honest prices, updated daily</h2>
          </div>
          <Link href="/deals" className="btn-accent hidden !py-2.5 text-xs sm:inline-flex">View all deals <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductRow({
  title,
  kicker,
  href,
  items,
  dark = false,
}: {
  title: string;
  kicker: string;
  href: string;
  items: typeof PRODUCTS;
  dark?: boolean;
}) {
  return (
    <section className={dark ? "bg-ink-950 text-white" : ""}>
      <div className="container-x py-12 md:py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-accent" : "text-brand-600"}`}>{kicker}</p>
            <h2 className={`section-title mt-1 ${dark ? "!text-white" : ""}`}>{title}</h2>
          </div>
          <Link href={href} className={`inline-flex items-center gap-1 text-sm font-bold ${dark ? "text-accent" : "text-brand-700"}`}>
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ShuffleGrid items={items} />
      </div>
    </section>
  );
}

const BRAND_LOGOS: Record<string, string> = {
  acer: "/brand/acer.png",
  anker: "/brand/anker.png",
  apple: "/brand/apple.png",
  asus: "/brand/asus.png",
  dahua: "/brand/dahua.png",
  dell: "/brand/dell.png",
  hikvision: "/brand/hikvision.png",
  hp: "/brand/hp.png",
  infinix: "/brand/infinix.png",
  jbl: "/brand/jbl.png",
  lenovo: "/brand/lenovo.png",
  microsoft: "/brand/microsoft.png",
  oraimo: "/brand/oraimo.png",
  samsung: "/brand/samsung.png",
  sandisk: "/brand/sandisk.png",
  seagate: "/brand/seagate.png",
  tecno: "/brand/tecno.png",
  xiaomi: "/brand/xiaomi.png",
};

export function BrandGrid() {
  // Logo-only brands, in a constantly-moving strip (duplicated for a seamless loop).
  const items = BRANDS.filter((b) => BRAND_LOGOS[b.toLowerCase()]);
  return (
    <section className="py-12 md:py-16">
      <p className="container-x text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        Shop top technology brands
      </p>
      <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max items-center">
          {[...items, ...items].map((b, i) => (
            <Link
              key={`${b}-${i}`}
              href={`/search?q=${encodeURIComponent(b)}`}
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : undefined}
              className="card mx-1.5 grid h-24 w-48 shrink-0 place-items-center p-2 transition hover:border-brand-300 hover:shadow-pop"
              aria-label={`Shop ${b}`}
            >
              <span className="relative block h-20 w-full">
                <Image
                  src={BRAND_LOGOS[b.toLowerCase()]}
                  alt={`${b} logo`}
                  fill
                  sizes="150px"
                  className="object-contain"
                  loading="lazy"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyUs() {
  const items = [
    { icon: BadgeCheck, t: "Authentic Products", d: "Quality products sourced from trusted suppliers. Sealed stock, verifiable serials, proper receipts." },
    { icon: Star, t: "Competitive Prices", d: "Great technology without inflated pricing. Daily price checks against the Kenyan market." },
    { icon: CreditCard, t: "Secure Payments", d: "Convenient and secure payment options including M-Pesa, cards and pay on delivery." },
    { icon: Truck, t: "Fast Delivery", d: "Reliable delivery across Kenya — Nairobi same-day, countrywide in 1–3 days." },
    { icon: MessageCircle, t: "Expert Support", d: "Get help choosing the right device on WhatsApp, phone or in-store from real specialists." },
    { icon: ShieldCheck, t: "Warranty Support", d: "Clear warranty information on every product page, with after-sales support that answers." },
  ];
  return (
    <section className="container-x py-12 md:py-16">
      <h2 className="section-title text-center">Tech You Can Buy With Confidence</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
        Electronics buyers need confidence before paying. Here is exactly what you get with every order.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div key={i.t} className="card p-5 transition hover:shadow-pop">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <i.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-bold">{i.t}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/70">
      <div className="container-x py-12 md:py-16">
        <h2 className="section-title text-center">Loved Across Kenya</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Verified purchases • Moderated by our team</p>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="card p-5">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm font-bold">{r.title}</p>
              <blockquote className="mt-1 text-sm leading-relaxed text-slate-600">“{r.body}”</blockquote>
              <figcaption className="mt-3 text-xs text-slate-500">
                <span className="font-bold text-slate-800">{r.name}</span> • {r.town}
                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">✓ Verified Purchase</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DeliverySection() {
  const towns = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Other towns"];
  return (
    <section className="container-x py-12 md:py-16">
      <div className="card overflow-hidden md:grid md:grid-cols-2">
        <div className="relative min-h-[220px] bg-ink-950 p-8 text-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(500px 220px at 20% 0%, rgba(59,99,246,.4), transparent)" }}
          />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-accent">Delivery</p>
          <h2 className="font-display relative mt-2 text-3xl font-extrabold">We Deliver Across Kenya</h2>
          <p className="relative mt-2 max-w-sm text-sm text-slate-300">
            Same-day in Nairobi, 1–3 days countrywide via trusted couriers. Pay
            with M-Pesa or on delivery where available.
          </p>
          <div className="relative mt-5 flex gap-2">
            <Link href="/delivery" className="btn-primary !bg-accent !text-ink-950 hover:!bg-white">Delivery info</Link>
            <Link href="/track-order" className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">
              Track order
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 p-5 sm:grid-cols-3 md:p-8">
          {towns.map((t) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <Truck className="mx-auto h-5 w-5 text-brand-600" />
              <p className="mt-2 text-sm font-bold">{t}</p>
              <p className="text-[11px] text-slate-500">Available</p>
            </div>
          ))}
          <p className="col-span-full text-center text-[11px] text-slate-400">
            Exact fees & ETAs are configured per zone and shown at checkout.
          </p>
        </div>
      </div>
    </section>
  );
}

export { NewsletterCTA } from "@/components/NewsletterCTA";

export { bestSellers, newArrivals };
