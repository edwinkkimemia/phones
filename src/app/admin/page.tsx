"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { kes } from "@/lib/utils";

interface Stats {
  revenue: number; orders: number; aov: number; source: string;
  bestSellers: { name: string; sold: number; revenue: number }[];
  lowStock: { name: string; qty: number }[];
  byCategory: { category: string; revenue: number }[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => null);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Secure Admin</p>
          <h1 className="section-title mt-1">Overview</h1>
        </div>
        {stats && <span className="chip">Source: {stats.source === "db" ? "Live database" : "Demo data"}</span>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Revenue", v: stats ? kes(stats.revenue) : "…" },
          { l: "Orders", v: stats ? String(stats.orders) : "…" },
          { l: "Avg. order value", v: stats ? kes(stats.aov) : "…" },
          { l: "Low-stock items", v: stats ? String(stats.lowStock.length) : "…" },
        ].map((s) => (
          <div key={s.l} className="card p-4">
            <p className="text-xs text-slate-500">{s.l}</p>
            <p className="font-display mt-1 text-xl font-extrabold">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-extrabold">Best-selling products</p>
            <Link href="/admin/analytics" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">Analytics <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {(stats?.bestSellers ?? []).map((b) => (
              <li key={b.name} className="flex justify-between gap-2"><span className="truncate">{b.name}</span><strong className="shrink-0">{b.sold} sold • {kes(b.revenue)}</strong></li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-extrabold">Low-stock alerts</p>
            <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">Products <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {(stats?.lowStock ?? []).map((l) => (
              <li key={l.name} className="flex justify-between gap-2"><span className="truncate">{l.name}</span><strong className="shrink-0 text-amber-700">Only {l.qty} left</strong></li>
            ))}
            {(stats?.lowStock.length ?? 1) === 0 && <li className="text-slate-400">All stocked up. 🎉</li>}
          </ul>
        </div>
      </div>

      <div className="card mt-4 p-5">
        <p className="font-extrabold">Sales by category</p>
        <div className="mt-3 space-y-2">
          {(stats?.byCategory ?? []).map((c) => (
            <div key={c.category}>
              <div className="flex justify-between text-sm"><span className="font-semibold capitalize">{c.category.replace("-", " ")}</span><span>{kes(c.revenue)}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent" style={{ width: `${Math.min(100, (c.revenue / Math.max(1, stats?.revenue ?? 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Order statuses: Pending → Paid → Processing → Dispatched → Delivered / Cancelled.</p>
      </div>
    </div>
  );
}
