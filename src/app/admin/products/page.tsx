"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2, Plus, Pencil } from "lucide-react";
import { kes } from "@/lib/utils";

interface Row {
  id: string; slug?: string; name: string; price: number;
  compareAtPrice?: number | null; stockQty?: number; stockStatus?: string;
  isDeal?: boolean; isNew?: boolean; isFeatured?: boolean;
  brand?: string | { name: string }; category?: string | { name: string };
  images?: { url: string }[];
}

const brandName = (r: Row) => (typeof r.brand === "string" ? r.brand : r.brand?.name ?? "—");

export default function AdminProducts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        // static catalog shape differs from DB — normalize
        const list: Row[] = (d.products ?? []).map((p: Record<string, unknown>) => ({
          id: String(p.id ?? p.slug),
          slug: typeof p.slug === "string" ? p.slug : undefined,
          name: String(p.name),
          price: Number(p.price),
          compareAtPrice: typeof p.compareAtPrice === "number" ? p.compareAtPrice : null,
          stockQty: typeof p.stockQty === "number" ? p.stockQty : undefined,
          stockStatus: typeof p.stockStatus === "string" ? p.stockStatus : undefined,
          isDeal: !!p.isDeal, isNew: !!p.isNew, isFeatured: !!p.isFeatured,
          brand: typeof p.brand === "string" ? p.brand : (p.brand as { name?: string } | undefined)?.name,
          images: Array.isArray(p.images) ? (p.images as { url: string }[]) : [],
        }));
        setRows(list);
        setSource(d.source);
      })
      .catch(() => null);
  };
  useEffect(load, []);

  const mutate = async (method: string, body?: unknown, query = "") => {
    setMsg("");
    const res = await fetch(`/api/products${query}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Saved." : (data.error ?? "Failed"));
    if (res.ok) load();
  };

  const filtered = rows.filter((r) => `${r.name} ${brandName(r)}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="section-title !text-2xl">Products</h1>
          <p className="text-xs text-slate-500">{filtered.length} items • Source: {source === "db" ? "Live database" : "Demo (connect DB to edit)"}</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary ml-auto !py-2.5 text-xs"><Plus className="h-4 w-4" /> Add product</Link>
      </div>

      <div className="card mt-4 flex items-center gap-2 p-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input className="w-full bg-transparent text-sm outline-none" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Flags</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 60).map((r) => (
              <tr key={r.id} className="border-t border-slate-50 align-top">
                <td className="max-w-[280px] p-3">
                  <Link href={`/admin/products/${r.id}`} className="truncate font-bold hover:text-brand-700">{r.name}</Link>
                  <p className="text-xs text-slate-500">{brandName(r)} • {r.slug ?? r.id}</p>
                </td>
                <td className="p-3">
                  <input
                    type="number" defaultValue={r.price} disabled={source !== "db"}
                    onBlur={(e) => { const v = Number(e.target.value); if (v !== r.price && v > 0) mutate("PATCH", { id: r.id, price: v }); }}
                    className="input !w-28 !py-1.5 text-xs font-bold"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number" defaultValue={r.stockQty ?? 0} disabled={source !== "db"}
                    onBlur={(e) => { const v = Number(e.target.value); if (v !== r.stockQty) mutate("PATCH", { id: r.id, stockQty: v }); }}
                    className="input !w-20 !py-1.5 text-xs font-bold"
                  />
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {(["isDeal", "isNew", "isFeatured"] as const).map((f) => (
                      <button
                        key={f}
                        disabled={source !== "db"}
                        onClick={() => mutate("PATCH", { id: r.id, [f]: !r[f] })}
                        className={`rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase ${r[f] ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"}`}
                      >
                        {f.replace("is", "")}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/products/${r.id}`} className="mr-1 inline-block rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700" aria-label="Full edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button disabled={source !== "db"} onClick={() => { if (confirm(`Delete “${r.name}”?`)) mutate("DELETE", undefined, `?id=${encodeURIComponent(r.id)}`); }} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Tip: click out of a price/stock field to save. Full editing (images, variants, specs, rich description) lives in the product record — extend this table as needed.</p>
    </div>
  );
}
