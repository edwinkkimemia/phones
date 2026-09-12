"use client";
import { useEffect, useState } from "react";
import { kes } from "@/lib/utils";

interface Stats {
  revenue: number; orders: number; aov: number; source: string;
  bestSellers: { name: string; sold: number; revenue: number }[];
  byCategory: { category: string; revenue: number }[];
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => null);
  }, []);

  const maxCat = Math.max(1, ...(stats?.byCategory.map((c) => c.revenue) ?? [1]));

  return (
    <div>
      <h1 className="section-title !text-2xl">Analytics</h1>
      <p className="text-xs text-slate-500">Source: {stats ? (stats.source === "db" ? "Live database" : "Demo data from catalog") : "…"}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { l: "Total revenue", v: stats ? kes(stats.revenue) : "…" },
          { l: "Total orders", v: stats ? String(stats.orders) : "…" },
          { l: "Average order value", v: stats ? kes(stats.aov) : "…" },
        ].map((s) => (
          <div key={s.l} className="card p-5">
            <p className="text-xs text-slate-500">{s.l}</p>
            <p className="font-display mt-1 text-2xl font-extrabold">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-5">
        <p className="font-extrabold">Revenue by category</p>
        <div className="mt-4 space-y-3">
          {(stats?.byCategory ?? []).map((c, i) => (
            <div key={c.category} className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-slate-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold capitalize">{c.category.replace("-", " ")}</span>
                  <span className="font-bold">{kes(c.revenue)}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent" style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4 p-5">
        <p className="font-extrabold">Best sellers leaderboard</p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="py-2">#</th><th>Product</th><th className="text-right">Sold</th><th className="text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.bestSellers ?? []).map((b, i) => (
              <tr key={b.name} className="border-t border-slate-50">
                <td className="py-2 font-bold text-slate-400">{i + 1}</td>
                <td className="max-w-[320px] truncate py-2 font-semibold">{b.name}</td>
                <td className="py-2 text-right">{b.sold}</td>
                <td className="py-2 text-right font-bold">{kes(b.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
