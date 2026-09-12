"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Megaphone,
  Star,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/promotions", label: "Promotions", Icon: Tag },
  { href: "/admin/ads", label: "Ads & Banners", Icon: Megaphone },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <aside className="card h-fit p-2 lg:sticky lg:top-36">
      <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:grid">
        {ADMIN_LINKS.map(({ href, label, Icon, exact }) => {
          const active = exact ? path === href : path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition",
                active ? "bg-ink-950 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
