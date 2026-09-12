"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminNav() {
  const path = usePathname();
  const { data: session } = useSession();
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
      <div className="mt-2 hidden border-t border-slate-100 p-2 lg:block">
        <p className="truncate px-2 text-xs font-semibold text-slate-500">
          {session?.user?.email ?? "Admin"}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
