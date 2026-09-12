"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, RotateCcw } from "lucide-react";

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

  const load = () => {
    fetch("/api/ads?list=all").then((r) => r.json()).then((d) => setAds(d.ads ?? [])).catch(() => setAds([]));
  };
  useEffect(load, []);

  const restore = async () => {
    if (!confirm("Restore the default ad set? Missing defaults return; your edits stay untouched.")) return;
    setMsg("");
    const res = await fetch("/api/ads?restore=1", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Defaults restored (${data.total ?? 0} total ads).` : (data.error ?? "Failed"));
    if (res.ok) load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start gap-2">
        <div>
          <h1 className="section-title !text-2xl">Ads & Banners</h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            WIDE banners appear above breadcrumbs and between homepage sections; SQUARE ads appear below “Still deciding?” on product pages.
            Set <strong>shows on</strong> + <strong>target</strong> to choose exactly where each ad appears —
            exact matches win, and <strong>priority</strong> (lowest first) decides ties.
            Homepage targets: <code>below-hero</code>, <code>below-deals</code>, <code>above-footer</code>.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={restore} className="btn-ghost !py-2.5 text-xs"><RotateCcw className="h-4 w-4" /> Restore defaults</button>
          <Link href="/admin/ads/new" className="btn-primary !py-2.5 text-xs"><Plus className="h-4 w-4" /> New ad</Link>
        </div>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

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
        {ads.length === 0 && <div className="card p-8 text-center text-sm text-slate-400">No ads yet — create your first one.</div>}
      </div>
    </div>
  );
}
