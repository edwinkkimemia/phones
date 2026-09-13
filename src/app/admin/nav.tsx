"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Tag,
  Megaphone,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Send,
  Newspaper,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
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
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

// Horizontal section navbar below the Admin Console bar (no sidebar).
// Hidden on the login page.
export default function AdminNav() {
  const path = usePathname();
  if (path === "/admin/login") return null;
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="container-x flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
        <nav className="flex items-center gap-1">
          {ADMIN_LINKS.map(({ href, label, Icon, exact }) => {
            const active = exact ? path === href : path === href || path.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition",
                  active ? "bg-ink-950 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
