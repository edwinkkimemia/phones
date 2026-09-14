"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Tag,
  Megaphone,
  Star,
  Send,
  Newspaper,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  Settings,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/promotions", label: "Promotions", Icon: Tag },
  { href: "/admin/marketing", label: "Marketing", Icon: Send },
  { href: "/admin/ads", label: "Ads & Banners", Icon: Megaphone },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/blog", label: "Blog", Icon: Newspaper },
  { href: "/admin/guides", label: "Guides", Icon: BookOpen },
];

const SECONDARY_LINKS = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3, exact: false },
  { href: "/admin/settings", label: "Settings", Icon: Settings, exact: false },
];

function isActive(path: string, href: string, exact = false) {
  if (exact) return path === href;
  return path === href || path.startsWith(href + "/");
}

// Desktop: horizontal section navbar below the Admin Console bar — links
// stretch to fill the full width. Hidden on mobile (sidebar takes over)
// and on the login page.
export default function AdminNav() {
  const path = usePathname();
  if (path === "/admin/login") return null;
  return (
    <div className="hidden border-b border-slate-200 bg-white lg:block">
      <div className="container-x py-2">
        <nav className="flex w-full items-stretch justify-between gap-1">
          {ADMIN_LINKS.map(({ href, label, Icon }) => {
            const active = isActive(path, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-bold transition",
                  active ? "bg-ink-950 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" /> {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Mobile: 3-line (hamburger) toggle in the top console bar that opens the
// primary admin nav as a collapsible left sidebar drawer.
export function AdminMobileMenu() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  if (path === "/admin/login") return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
              <span className="font-display text-sm font-extrabold">Admin Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
                className="ml-auto inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {SECONDARY_LINKS.map(({ href, label, Icon, exact }) => {
                const active = isActive(path, href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition",
                      active ? "bg-ink-950 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                  </Link>
                );
              })}

              <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Manage
              </p>

              {ADMIN_LINKS.map(({ href, label, Icon }) => {
                const active = isActive(path, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition",
                      active ? "bg-ink-950 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-1 border-t border-slate-200 p-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                <Store className="h-4 w-4 shrink-0" /> View store
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 shrink-0" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
