import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import AdminShell from "./shell";
import AdminNav from "./nav";
import AdminTopActions from "./top-actions";

export const metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="container-x flex items-center gap-3 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/fav.jpg" alt="PhoneLaptops admin" width={64} height={64} className="h-9 w-9 rounded-lg" />
            <span>
              <span className="block font-display text-sm font-extrabold">Admin Console</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">PhoneLaptops.co.ke</span>
            </span>
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Store className="h-4 w-4" /> View store
          </Link>
          <AdminTopActions />
        </div>
      </div>
      <AdminNav />
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
