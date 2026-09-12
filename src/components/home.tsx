import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Truck, MessageCircle, CreditCard, ShieldCheck, Star } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { kes, savings } from "@/lib/utils";
import { pickDaily } from "@/lib/rotation";
import { CATEGORIES, PRODUCTS, BRANDS, REVIEWS, deals, bestSellers, newArrivals } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import { Price } from "@/components/ui";

// Curated order for the hero logo ticker (all have files in public/brand).
const heroBrands = ["HP", "Apple", "Samsung", "Lenovo", "Dell", "ASUS", "Xiaomi", "Tecno", "Anker", "JBL", "Oraimo", "Infinix"];

export function Hero() {
  // The two feature spots rotate daily among featured products.
  const [featured, second] = pickDaily(
    PRODUCTS.filter((p) => p.isFeatured && p.stockStatus !== "OUT_OF_STOCK"),
    2,
    "hero"
  );
  const iphone = second ?? PRODUCTS.find((p) => p.slug === "iphone-17-pro-256gb")!;
  const heroMain = featured ?? PRODUCTS[0];
  const save = savings(heroMain.price, heroMain.compareAtPrice);
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <Image
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
        alt=""
        aria-hidden="true"
        fill
        priority
        className="object-cover opacity-50"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/60 to-ink-950/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/30" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(700px 320px at 15% 10%, rgba(59,99,246,.35), transparent), radial-gradient(600px 300px at 85% 20%, rgba(0,230,118,.14), transparent), radial-gradient(800px 400px at 50% 110%, rgba(59,99,246,.22), transparent)",
        }}
      />
      <div className="container-x relative grid gap-10 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Nairobi • Mombasa • Kisumu • Countrywide
          </p>
          <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Upgrade Your <span className="bg-gradient-to-r from-brand-400 via-accent to-brand-400 bg-clip-text text-transparent">Tech.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-300">
            Latest laptops, iPhones, smartphones and accessories at competitive
            Kenyan prices. Genuine stock, M-Pesa checkout, fast delivery.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/deals" className="btn-primary !bg-brand-500 !px-7 !py-3.5 !text-[15px] hover:!bg-brand-400">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254715135141"}?text=${encodeURIComponent("Hello PhoneLaptops! I need help choosing a laptop/phone.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              <WhatsAppIcon className="h-4 w-4 text-accent" /> Talk to an Expert
            </a>
          </div>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-2.5 text-xs font-semibold text-slate-300 sm:grid-cols-4">
            {[
              { icon: BadgeCheck, label: "Authentic Products" },
              { icon: CreditCard, label: "M-Pesa Payments" },
              { icon: Truck, label: "Fast Delivery" },
              { icon: ShieldCheck, label: "Expert Support" },
            ].map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                <t.icon className="h-4 w-4 shrink-0 text-accent" /> {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-5 gap-3">
            <div className="card col-span-3 overflow-hidden !border-white/10 !bg-white/5 p-3 backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={heroMain.images[0].url}
                  alt={heroMain.name}
                  fill
                  className="object-cover"
                  priority
                />
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
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-brand-300">{heroMain.brand} • {heroMain.categoryLabel}</p>
              <p className="truncate text-sm font-bold">{heroMain.name}</p>
              <Price price={heroMain.price} compareAt={heroMain.compareAtPrice} size="sm" className="mt-1 [&_span]:!text-white" />
              <Link href={`/${heroMain.category}/${heroMain.slug}`} className="btn-primary mt-3 w-full !py-2.5 text-xs">Buy Now</Link>
            </div>
            <div className="col-span-2 flex flex-col gap-3">
              <div className="card float-y flex-1 overflow-hidden !border-white/10 !bg-white/5 p-3 backdrop-blur">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={iphone.images[0].url} alt={iphone.name} fill className="object-cover" />
                </div>
                <p className="mt-2 truncate text-[11px] font-bold text-brand-300">{iphone.isNew ? "NEW • " : ""}{iphone.brand} {iphone.categoryLabel}</p>
                <p className="text-xs font-bold">{kes(iphone.price)}</p>
                <Link href={`/${iphone.category}/${iphone.slug}`} className="mt-2 block text-center rounded-lg bg-white/10 py-2 text-[11px] font-bold hover:bg-white/20">
                  View
                </Link>
              </div>
              <div className="rounded-2xl border border-accent/30 bg-accent/10 p-3">
                <p className="flex items-center gap-1 text-xs font-extrabold text-accent"><Star className="h-3.5 w-3.5 fill-current" /> 4.9/5</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-300">12,400+ verified reviews from buyers across Kenya</p>
              </div>
            </div>
          </div>
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

export function CategoryGrid() {
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
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-pop">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={c.image} alt={c.name} fill sizes="300px" className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
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
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
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
