"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface Ad {
  id: string; title: string; image: string; link: string;
  placement: string; target: string; format?: string; sortOrder: number; active: boolean;
}

async function patchAd(id: string, patch: Record<string, unknown>) {
  const res = await fetch("/api/ads", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...patch }),
  });
  return res.ok;
}

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", image: "", link: "/deals", placement: "GLOBAL", target: "all", format: "WIDE" });

  const load = () => {
    fetch("/api/ads?list=all").then((r) => r.json()).then((d) => setAds(d.ads ?? [])).catch(() => setAds([]));
  };
  useEffect(load, []);

  return (
    <div>
      <h1 className="section-title !text-2xl">Ads & Banners</h1>
      <p className="text-xs text-slate-500">
        WIDE banners appear above the breadcrumb on product/category pages and between homepage sections; SQUARE ads appear below “Still deciding?” on the product page.
        Set <strong>shows on</strong> (GLOBAL / HOMEPAGE / CATEGORY / PRODUCT) + <strong>target</strong> to choose exactly where each ad appears.
        Homepage targets: <code>below-hero</code>, <code>below-deals</code>, <code>above-footer</code> (or “all” for every homepage slot).
        Category/product targets use the slug (e.g. <code>laptops</code>, <code>hp-probook-440-g10</code>) or “all”.
      </p>

      <p className="text-xs text-slate-500">
        WIDE banners appear above the breadcrumb on product/category pages; SQUARE ads appear below “Still deciding?” on the product page.
        Set <strong>shows on</strong> (GLOBAL / CATEGORY / PRODUCT) + <strong>target</strong> (slug or “all”) to choose exactly where each ad appears —
        exact matches win, and <strong>priority</strong> (lowest first) decides between several matching ads.
      </p>

      <div className="mt-4 space-y-2.5">
        {ads.map((a) => (
          <div key={a.id} className="card space-y-2.5 p-3.5 text-sm">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.image} alt="" className="h-10 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/ads/${a.id}`} className="truncate font-bold hover:text-brand-700 hover:underline">{a.title}</Link>
                <p className="text-xs text-slate-500">{a.format ?? "WIDE"} → {a.link} • {a.active ? "Live" : "Paused"}</p>
              </div>
              <button
                onClick={async () => { await patchAd(a.id, { active: !a.active }); load(); }}
                className="btn-ghost !px-3 !py-1.5 text-xs"
              >
                {a.active ? "Pause" : "Enable"}
              </button>
              <button
                onClick={async () => { if (!confirm(`Delete “${a.title}”?`)) return; await fetch(`/api/ads?id=${encodeURIComponent(a.id)}`, { method: "DELETE" }); load(); }}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Shows on
                <select
                  defaultValue={a.placement}
                  onChange={async (e) => { (await patchAd(a.id, { placement: e.target.value })) && load(); }}
                  className="input mt-1 !py-1.5 text-xs font-bold"
                >
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="CATEGORY">CATEGORY</option>
                  <option value="PRODUCT">PRODUCT</option>
                </select>
              </label>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Target slug
                <input
                  defaultValue={a.target}
                  onBlur={async (e) => { if (e.target.value !== a.target && e.target.value.trim()) { (await patchAd(a.id, { target: e.target.value.trim() })) && load(); } }}
                  className="input mt-1 !py-1.5 text-xs font-bold"
                  placeholder="slug or all"
                />
              </label>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Priority
                <input
                  type="number"
                  defaultValue={a.sortOrder}
                  onBlur={async (e) => { const v = Number(e.target.value); if (v !== a.sortOrder) { (await patchAd(a.id, { sortOrder: v })) && load(); } }}
                  className="input mt-1 !py-1.5 text-xs font-bold"
                />
              </label>
            </div>
          </div>
        ))}
        {ads.length === 0 && <div className="card p-8 text-center text-sm text-slate-400">No ads yet — publish one below.</div>}
      </div>

      <form
        className="card mt-4 grid gap-2.5 p-5 sm:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          const res = await fetch("/api/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
          const data = await res.json().catch(() => ({}));
          setMsg(res.ok ? "Ad created and live." : (data.error ?? "Failed"));
          if (res.ok) { setForm({ title: "", image: "", link: "/deals", placement: "GLOBAL", target: "all", format: "WIDE" }); load(); }
        }}
      >
        <input className="input sm:col-span-2" placeholder="Title (e.g. Back-to-school laptop sale)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
          <option value="WIDE">WIDE (breadcrumb banner)</option>
          <option value="SQUARE">SQUARE (product sidebar)</option>
        </select>
        <input className="input sm:col-span-2" placeholder="Image URL — use 1600px wide for WIDE, 800×800 for SQUARE" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
        <div className="sm:col-span-3">
          <ImageUploader compact label="…or upload creative" onUploaded={(urls) => urls[0] && setForm((f) => ({ ...f, image: urls[0] }))} />
          {form.image && <p className="mt-1 truncate font-mono text-[11px] text-emerald-700">✓ {form.image}</p>}
        </div>
        <input className="input" placeholder="Link (e.g. /laptops)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} required />
                  <select className="input" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
                    <option value="GLOBAL">GLOBAL (everywhere)</option>
                    <option value="HOMEPAGE">HOMEPAGE section</option>
                    <option value="CATEGORY">CATEGORY</option>
                    <option value="PRODUCT">PRODUCT</option>
                  </select>
        <input className="input" placeholder="Target slug or 'all'" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required />
        <button className="btn-primary !py-2.5 text-sm"><Plus className="h-4 w-4" /> Publish ad</button>
      </form>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
    </div>
  );
}
