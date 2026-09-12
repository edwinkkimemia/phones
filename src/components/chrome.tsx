"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store";
import { whatsappLink, productWhatsappMessage } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons";
import { PRODUCTS, CATEGORIES } from "@/data/catalog";

function pageMessage(path: string): string {
  const product = PRODUCTS.find((p) => path === `/${p.category}/${p.slug}`);
  if (product) {
    return productWhatsappMessage(
      product.name,
      product.price,
      `https://phonelaptops.co.ke/${product.category}/${product.slug}`
    );
  }
  const cat = CATEGORIES.find((c) => path === `/${c.slug}`);
  if (cat) {
    return `Hello PhoneLaptops! I'm looking for ${cat.name.toLowerCase()} — please recommend the best options.`;
  }
  if (path === "/cart") return "Hello PhoneLaptops! I need help completing my order.";
  if (path === "/checkout") return "Hello PhoneLaptops! I have a question about checkout / M-Pesa payment.";
  if (path.startsWith("/track-order")) return "Hello PhoneLaptops! I'd like an update on my order.";
  if (path === "/deals") return "Hello PhoneLaptops! I have a question about today's deals.";
  if (path === "/compare") return "Hello PhoneLaptops! Help me choose between these models.";
  if (path.startsWith("/admin")) return "Hello PhoneLaptops!";
  return "Hello PhoneLaptops! I need help choosing a device.";
}

export function WhatsAppFloat({ phone }: { phone?: string }) {
  const path = usePathname() ?? "/";
  if (path.startsWith("/admin")) return null;
  return (
    <a
      href={whatsappLink(pageMessage(path), phone)}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-20 right-4 z-50 grid place-items-center rounded-full bg-[#25D366] p-3.5 text-white shadow-pop transition hover:scale-105 md:bottom-6 md:right-6"
      style={{ width: 56, height: 56 }}
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="absolute -top-1 right-10 hidden whitespace-nowrap rounded-full bg-ink-950 px-3 py-1.5 text-xs font-bold text-white md:block">
        Chat with us
      </span>
    </a>
  );
}

export function MobileNav() {
  const count = useCart((s) => s.count());
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("pl:open-search"));
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 text-[10px] font-bold text-slate-600">
        <Link href="/" className="flex flex-col items-center gap-1 py-2.5">
          <Home className="h-5 w-5" /> Home
        </Link>
        <Link href="/laptops" className="flex flex-col items-center gap-1 py-2.5">
          <LayoutGrid className="h-5 w-5" /> Shop
        </Link>
        <button onClick={openSearch} className="flex flex-col items-center gap-1 py-2.5" aria-label="Search">
          <Search className="h-5 w-5" /> Search
        </button>
        <Link href="/cart" className="relative flex flex-col items-center gap-1 py-2.5">
          <ShoppingCart className="h-5 w-5" /> Cart
          {count > 0 && (
            <span className="absolute right-4 top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
