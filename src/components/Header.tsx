"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Zap,
  Phone,
  Mail,
} from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { POPULAR_SEARCHES } from "@/data/catalog";

const NAV = [
  { label: "Laptops", href: "/laptops" },
  { label: "Desktops", href: "/desktops" },
  { label: "Phones", href: "/phones" },
  { label: "iPhones", href: "/iphones" },
  { label: "Tablets", href: "/tablets" },
  { label: "Wearables", href: "/wearables" },
  { label: "Storage", href: "/storage" },
  { label: "Laptop Parts", href: "/laptop-parts" },
  { label: "Phone Parts", href: "/phone-parts" },
  { label: "Accessories", href: "/accessories" },
  { label: "Deals", href: "/deals", hot: true },
  { label: "New Arrivals", href: "/new-arrivals" },
];

export default function Header() {
  const router = useRouter();
  const count = useCart((s) => s.count());
  const wishCount = useWishlist((s) => s.ids.length);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [bump, setBump] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBump(true);
    const t = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(t);
  }, [count]);

  // Bottom mobile nav "Search" tab summons this field instead of changing page.
  useEffect(() => {
    const handler = () => {
      setOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        mobileSearchRef.current?.focus({ preventScroll: true });
        mobileSearchRef.current?.select();
      }, 350);
    };
    window.addEventListener("pl:open-search", handler);
    return () => window.removeEventListener("pl:open-search", handler);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink-950 text-white">
        <div className="container-x flex items-center justify-center gap-4 py-1.5 text-[11px] font-bold tracking-[0.12em] sm:justify-between">
          <a href="tel:+254715135141" className="hidden items-center gap-1.5 hover:text-accent sm:inline-flex">
            <Phone className="h-3.5 w-3.5 text-accent" /> 0715 135 141
          </a>
          <p className="flex items-center gap-2 text-center tracking-[0.14em]">
            <Zap className="h-3.5 w-3.5 text-accent" />
            FAST DELIVERY • AUTHENTIC PRODUCTS • M-PESA ACCEPTED
          </p>
          <a href="mailto:support@phonelaptops.co.ke" className="hidden items-center gap-1.5 normal-case tracking-normal hover:text-accent md:inline-flex">
            <Mail className="h-3.5 w-3.5 text-accent" /> support@phonelaptops.co.ke
          </a>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-x flex items-center gap-3 py-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center" aria-label="PhoneLaptops.co.ke home">
            <Image
              src="/logo.png"
              alt="PhoneLaptops.co.ke — Latest Gadgets. Better Living."
              width={440}
              height={110}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <form
            onSubmit={submit}
            className="relative mx-auto hidden w-full max-w-xl flex-1 md:block"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search laptops, iPhones, Samsung, accessories…"
              className="input pl-11 pr-24 py-3 !rounded-full !border-slate-200 !bg-slate-100 focus:!bg-white"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink-950 px-4 py-1.5 text-xs font-bold text-white hover:bg-ink-800"
            >
              Search
            </button>
            {focused && (
              <div className="absolute inset-x-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-pop">
                <p className="label">Popular right now</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => {
                        setQ(s);
                        router.push(`/search?q=${encodeURIComponent(s)}`);
                      }}
                      className="chip hover:border-brand-300 hover:bg-brand-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/account"
              className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              <User className="h-5 w-5" />
              <span className="hidden xl:block">Account</span>
            </Link>
            <Link
              href="/wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-ink-950 px-3.5 text-sm font-bold text-white transition hover:bg-ink-800"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:block">Cart</span>
              <span
                className={`grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-ink-950 transition ${
                  bump ? "scale-125" : ""
                }`}
              >
                {count}
              </span>
            </Link>
          </div>
        </div>

        <form onSubmit={submit} className="container-x scroll-mt-32 pb-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={mobileSearchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search laptops, iPhones, Samsung…"
              enterKeyHint="search"
              className="input pl-11 !rounded-full !bg-slate-100"
            />
          </div>
        </form>

        <nav className="hidden border-t border-slate-100 lg:block">
          <div className="container-x flex items-center justify-between gap-0.5 overflow-x-auto no-scrollbar">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`whitespace-nowrap rounded-lg px-2 py-2.5 text-[12px] font-semibold transition hover:bg-slate-100 xl:px-2.5 xl:text-[13px] ${
                  n.hot ? "text-red-600" : "text-slate-700"
                }`}
              >
                {n.hot ? `🔥 ${n.label}` : n.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {open && (
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <nav className="container-x grid gap-1 py-3">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-bold ${
                  n.hot
                    ? "bg-red-50 text-red-700"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                {n.hot ? `🔥 ${n.label}` : n.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/account" onClick={() => setOpen(false)} className="btn-ghost !py-2.5 text-xs">
                <User className="h-4 w-4" /> Account
              </Link>
              <Link href="/track-order" onClick={() => setOpen(false)} className="btn-ghost !py-2.5 text-xs">
                Track Order
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
