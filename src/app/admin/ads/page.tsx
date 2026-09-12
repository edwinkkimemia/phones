"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, RotateCcw, FlaskConical } from "lucide-react";
import AdTargetInput, { targetLabel } from "@/components/AdTargetInput";

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

function AdRow({ a, cats, reload }: { a: Ad; cats: { slug: string; name: string }[]; reload: () => void }) {
  const [target, setTarget] = useState(a.target);
  return (
    <div className="card space-y-2.5 p-3.5 text-sm">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.image} alt="" className="h-10 w-20 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/ads/${a.id}`} className="truncate font-bold hover:text-brand-700 hover:underline">{a.title}</Link>
          <p className="text-xs text-slate-500">
            {a.placement} → {targetLabel(a.target, cats)} • {a.format ?? "WIDE"} → {a.link} • {a.active ? "Live" : "Paused"}
          </p>
        </div>
        <button
          onClick={async () => { await patchAd(a.id, { active: !a.active }); reload(); }}
          className="btn-ghost !px-3 !py-1.5 text-xs"
        >
          {a.active ? "Pause" : "Enable"}
        </button>
        <button
          onClick={async () => { if (!confirm(`Delete “${a.title}”?`)) return; await fetch(`/api/ads?id=${encodeURIComponent(a.id)}`, { method: "DELETE" }); reload(); }}
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
            onChange={async (e) => { (await patchAd(a.id, { placement: e.target.value })) && reload(); }}
            className="input mt-1 !py-1.5 text-xs font-bold"
          >
            <option value="GLOBAL">GLOBAL</option>
            <option value="HOMEPAGE">HOMEPAGE</option>
            <option value="CATEGORY">CATEGORY</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="BLOG">BLOG</option>
          </select>
        </label>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Target
          <span className="mt-1 block">
            <AdTargetInput
              placement={a.placement}
              value={target}
              onChange={setTarget}
              className="input !py-1.5 text-xs font-bold"
            />
          </span>
        </label>
        <div className="flex items-end gap-1.5">
          <label className="flex-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Priority
            <input
              type="number"
              defaultValue={a.sortOrder}
              onBlur={async (e) => { const v = Number(e.target.value); if (v !== a.sortOrder) { (await patchAd(a.id, { sortOrder: v })) && reload(); } }}
              className="input mt-1 !py-1.5 text-xs font-bold"
            />
          </label>
          <button
            onClick={async () => { if (target.trim() && target !== a.target) { (await patchAd(a.id, { target })) && reload(); } }}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}

interface Resolved {
  id: string; title: string; placement: string; target: string; link: string;
}

function SlotTester() {
  const [placement, setPlacement] = useState("CATEGORY");
  const [target, setTarget] = useState("laptops");
  const [category, setCategory] = useState("laptops");
  const [result, setResult] = useState<{ ad?: { title: string; image: string; link: string }; candidates?: Resolved[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const test = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams({ placement, target: target.trim() || "all", format: "WIDE", index: "0" });
      if (placement === "PRODUCT" && category.trim()) qs.set("category", category.trim());
      const res = await fetch(`/api/ads?${qs.toString()}`);
      setResult(await res.json());
    } catch {
      setResult(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mt-4 p-5">
      <p className="flex items-center gap-2 font-extrabold"><FlaskConical className="h-4 w-4 text-brand-600" /> Test a slot</p>
      <p className="mt-1 text-xs text-slate-500">See exactly which ad a page would show — including category inheritance on product pages.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[160px_1fr_1fr_auto]">
        <select value={placement} onChange={(e) => setPlacement(e.target.value)} className="input !py-2 text-xs font-bold">
          <option value="HOMEPAGE">HOMEPAGE</option>
          <option value="CATEGORY">CATEGORY</option>
          <option value="PRODUCT">PRODUCT</option>
          <option value="BLOG">BLOG</option>
        </select>
        <AdTargetInput placement={placement} value={target} onChange={setTarget} className="input !py-2 text-xs font-bold" />
        {placement === "PRODUCT" && (
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="product's category" className="input !py-2 text-xs font-bold" />
        )}
        <button onClick={test} disabled={busy} className="btn-primary !py-2 text-xs disabled:opacity-60">
          {busy ? "Checking…" : "Check"}
        </button>
      </div>
      {result && (
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
          {result.ad ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Winner for this slot</p>
              <div className="mt-1.5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.ad.image} alt="" className="h-12 w-24 rounded-lg object-cover" />
                <div>
                  <p className="font-bold">{result.ad.title}</p>
                  <p className="text-xs text-slate-500">→ {result.ad.link}</p>
                </div>
              </div>
              {(result.candidates ?? []).length > 1 && (
                <p className="mt-2 text-xs text-slate-500">
                  Also matching ({(result.candidates ?? []).length - 1} more):{" "}
                  {(result.candidates ?? []).slice(1, 4).map((c) => c.title).join(" • ")}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-semibold text-amber-700">No ad matches — this slot falls back to GLOBAL (or shows nothing if none exists).</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/ads?list=all").then((r) => r.json()).then((d) => setAds(d.ads ?? [])).catch(() => setAds([]));
  };
  useEffect(load, []);
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCats((d.categories ?? []).map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name }))))
      .catch(() => null);
  }, []);

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
            Pick <strong>shows on</strong>, then choose the exact target from suggestions — exact matches always win, <strong>priority</strong> breaks ties.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={restore} className="btn-ghost !py-2.5 text-xs"><RotateCcw className="h-4 w-4" /> Restore defaults</button>
          <Link href="/admin/ads/new" className="btn-primary !py-2.5 text-xs"><Plus className="h-4 w-4" /> New ad</Link>
        </div>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

      <div className="mt-4 space-y-5">
        {(
          [
            { title: "Homepage", desc: "Between homepage sections (below-hero, below-deals, above-footer).", match: (a: Ad) => a.placement === "HOMEPAGE" },
            { title: "Blog", desc: "Above the breadcrumb on the blog index and article pages, plus article sidebars.", match: (a: Ad) => a.placement === "BLOG" },
            { title: "Category banners", desc: "Wide banners above the breadcrumb on category pages — inherited by their products.", match: (a: Ad) => a.placement === "CATEGORY" && (a.format ?? "WIDE") === "WIDE" },
            { title: "Product sidebar", desc: "Square ads below “Still deciding?” on product pages.", match: (a: Ad) => (a.format ?? "WIDE") === "SQUARE" },
            { title: "Product-specific", desc: "Wide banners pinned to one product page.", match: (a: Ad) => a.placement === "PRODUCT" && (a.format ?? "WIDE") === "WIDE" },
            { title: "Global fallback", desc: "Shown anywhere nothing more specific matches.", match: (a: Ad) => a.placement === "GLOBAL" },
          ] as const
        ).map((g) => {
          const rows = ads.filter(g.match);
          if (rows.length === 0) return null;
          return (
            <section key={g.title}>
              <div className="flex items-baseline gap-2">
                <h2 className="font-extrabold">{g.title}</h2>
                <span className="chip">{rows.length}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{g.desc}</p>
              <div className="mt-2 space-y-2.5">
                {rows.map((a) => (
                  <AdRow key={a.id} a={a} cats={cats} reload={load} />
                ))}
              </div>
            </section>
          );
        })}
        {ads.length === 0 && <div className="card p-8 text-center text-sm text-slate-400">No ads yet — create your first one.</div>}
      </div>

      <SlotTester />
    </div>
  );
}
