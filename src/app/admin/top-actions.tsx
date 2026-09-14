"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, LayoutDashboard, Settings, LogOut } from "lucide-react";

// Quick actions beside "View store" in the Admin Console bar.
// Desktop only — on mobile these live in the sidebar drawer.
// Hidden on the login page.
export default function AdminTopActions() {
  const path = usePathname();
  if (path === "/admin/login") return null;
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        <LayoutDashboard className="h-4 w-4" /> Overview
      </Link>
      <Link
        href="/admin/analytics"
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        <BarChart3 className="h-4 w-4" /> Analytics
      </Link>
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        <Settings className="h-4 w-4" /> Settings
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
