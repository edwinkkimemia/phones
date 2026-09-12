"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, RotateCcw, FlaskConical, BarChart3, MonitorPlay } from "lucide-react";
import AdTargetInput, { targetLabel } from "@/components/AdTargetInput";

interface Ad {
  id: string; title: string; image: string; link: string;
  placement: string; target: string; format?: string; sortOrder: number; active: boolean;
  impressions?: number; clicks?: number; lastShownAt?: string | null;
  startsAt?: string | null; endsAt?: string | null;
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
            <option value="GUIDES">GUIDES</option>
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
  const [format, setFormat] = useState("WIDE");
  const [index, setIndex] = useState("0");
  const [seed, setSeed] = useState("");
  const [result, setResult] = useState<{ ad?: { title: string; image: string; link: string }; candidates?: Resolved[]; rotation?: { offset: number } | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const test = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams({ placement, target: target.trim() || "all", format, index });
      if (placement === "PRODUCT" && category.trim()) qs.set("category", category.trim());
      if (seed.trim()) qs.set("seed", seed.trim());
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
      <p className="mt-1 text-xs text-slate-500">See exactly which ad a page would show — including category inheritance on product pages. Match the slot's format: banners are WIDE, sidebars are SQUARE. Leave visitor blank for priority order; enter any id to preview per-visitor rotation.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[130px_100px_70px_1fr_1fr_1fr_auto]">
        <select value={placement} onChange={(e) => setPlacement(e.target.value)} className="input !py-2 text-xs font-bold">
          <option value="HOMEPAGE">HOMEPAGE</option>
          <option value="CATEGORY">CATEGORY</option>
          <option value="PRODUCT">PRODUCT</option>
          <option value="BLOG">BLOG</option>
          <option value="GUIDES">GUIDES</option>
        </select>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="input !py-2 text-xs font-bold" aria-label="Format">
          <option value="WIDE">WIDE</option>
          <option value="SQUARE">SQUARE</option>
        </select>
        <AdTargetInput placement={placement} value={target} onChange={setTarget} className="input !py-2 text-xs font-bold" />
        <input
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="input !py-2 text-xs font-bold"
          aria-label="Visitor seed"
          title="Visitor id to preview rotation (blank = priority order)"
          placeholder="visitor id"
        />
        <input
          value={index}
          onChange={(e) => setIndex(e.target.value.replace(/\D/g, "") || "0")}
          className="input !py-2 text-xs font-bold"
          aria-label="Slot index"
          title="Slot index (0 = first, 1 = second stacked sidebar slot)"
          inputMode="numeric"
        />
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
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Winner for this slot{result.rotation ? ` (rotated #${result.rotation.offset} for that visitor)` : ""}
              </p>
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

function ctr(clicks: number, impressions: number): string {
  if (!impressions) return "—";
  return `${((clicks / impressions) * 100).toFixed(1)}%`;
}

function PerformanceReport({ ads }: { ads: Ad[] }) {
  const totalImpr = ads.reduce((s, a) => s + (a.impressions ?? 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks ?? 0), 0);
  const neverShown = ads.filter((a) => a.active && (a.impressions ?? 0) === 0);
  const noClicks = ads.filter((a) => (a.impressions ?? 0) > 0 && (a.clicks ?? 0) === 0);
  const rows = [...ads].sort((a, b) => (a.impressions ?? 0) - (b.impressions ?? 0));

  return (
    <div className="card mt-4 p-5">
      <p className="flex items-center gap-2 font-extrabold"><BarChart3 className="h-4 w-4 text-brand-600" /> Performance</p>
      <p className="mt-1 text-xs text-slate-500">
        {totalImpr.toLocaleString()} impressions • {totalClicks.toLocaleString()} clicks • {ctr(totalClicks, totalImpr)} overall CTR
        • storefront rotates ads within the winning tier per visitor, so even splits here confirm rotation is working
        {neverShown.length > 0 && (
          <> • <span className="font-bold text-amber-700">{neverShown.length} live ad{neverShown.length === 1 ? "" : "s"} never shown</span></>
        )}
        {noClicks.length > 0 && (
          <> • <span className="font-bold text-amber-700">{noClicks.length} shown but never clicked</span></>
        )}
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-2 font-bold">Ad</th>
              <th className="py-2 pr-2 font-bold">Slot</th>
              <th className="py-2 pr-2 text-right font-bold">Impr.</th>
              <th className="py-2 pr-2 text-right font-bold">Clicks</th>
              <th className="py-2 pr-2 text-right font-bold">CTR</th>
              <th className="py-2 pr-2 font-bold">Last shown</th>
              <th className="py-2 font-bold">Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const impr = a.impressions ?? 0;
              const clicks = a.clicks ?? 0;
              const flag = !a.active
                ? { text: "Paused", cls: "bg-slate-100 text-slate-500" }
                : impr === 0
                  ? { text: "Never shown — check targeting / format / schedule", cls: "bg-amber-50 text-amber-700" }
                  : clicks === 0
                    ? { text: "Shown, no clicks — weak creative or link", cls: "bg-amber-50 text-amber-700" }
                    : { text: "Healthy", cls: "bg-emerald-50 text-emerald-700" };
              return (
                <tr key={a.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-2">
                    <span className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {a.image ? <img src={a.image} alt="" className="h-7 w-12 shrink-0 rounded-md object-cover" /> : null}
                      <span className="min-w-0 truncate font-bold">{a.title}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2 text-slate-500">{a.placement} → {a.target} • {a.format ?? "WIDE"}</td>
                  <td className="py-2 pr-2 text-right font-bold">{impr.toLocaleString()}</td>
                  <td className="py-2 pr-2 text-right font-bold">{clicks.toLocaleString()}</td>
                  <td className="py-2 pr-2 text-right">{ctr(clicks, impr)}</td>
                  <td className="whitespace-nowrap py-2 pr-2 text-slate-500">
                    {a.lastShownAt ? new Date(a.lastShownAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2"><span className={`inline-block rounded-full px-2 py-0.5 font-bold ${flag.cls}`}>{flag.text}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No ads yet.</p>}
      </div>
    </div>
  );
}

interface PreviewSlot {
  label: string;
  placement: string;
  target: string;
  category?: string;
  format: "WIDE" | "SQUARE";
  index: number;
}

const PREVIEW_SLOTS: PreviewSlot[] = [
  { label: "Homepage · below-hero", placement: "HOMEPAGE", target: "below-hero", format: "WIDE", index: 0 },
  { label: "Homepage · below-deals", placement: "HOMEPAGE", target: "below-deals", format: "WIDE", index: 0 },
  { label: "Homepage · above-footer", placement: "HOMEPAGE", target: "above-footer", format: "WIDE", index: 0 },
  { label: "Category · laptops", placement: "CATEGORY", target: "laptops", format: "WIDE", index: 0 },
  { label: "Product sample · laptops", placement: "PRODUCT", target: "hp-pavilion-15-eg3000", category: "laptops", format: "WIDE", index: 0 },
  { label: "Blog index", placement: "BLOG", target: "blog", format: "WIDE", index: 0 },
  { label: "Blog sidebar #1", placement: "BLOG", target: "all", format: "SQUARE", index: 0 },
  { label: "Blog sidebar #2", placement: "BLOG", target: "all", format: "SQUARE", index: 1 },
  { label: "Guides index", placement: "GUIDES", target: "guides", format: "WIDE", index: 0 },
  { label: "Guides sidebar #1", placement: "GUIDES", target: "all", format: "SQUARE", index: 0 },
  { label: "Guides sidebar #2", placement: "GUIDES", target: "all", format: "SQUARE", index: 1 },
  { label: "Global fallback", placement: "GLOBAL", target: "all", format: "WIDE", index: 0 },
];

function SlotPreviews() {
  const [results, setResults] = useState<Record<string, { ad?: { title: string; image: string; link: string } } | null>>({});
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    Promise.all(
      PREVIEW_SLOTS.map(async (s) => {
        const qs = new URLSearchParams({
          placement: s.placement, target: s.target, format: s.format, index: String(s.index),
        });
        if (s.category) qs.set("category", s.category);
        try {
          const res = await fetch(`/api/ads?${qs.toString()}`);
          const data = await res.json();
          return [s.label, data.ad ? { ad: data.ad } : null] as const;
        } catch {
          return [s.label, null] as const;
        }
      })
    ).then((entries) => {
      setResults(Object.fromEntries(entries));
      setLoading(false);
    });
  };
  useEffect(reload, []);

  return (
    <div className="card mt-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex items-center gap-2 font-extrabold"><MonitorPlay className="h-4 w-4 text-brand-600" /> Live slot previews</p>
        <button onClick={reload} className="btn-ghost ml-auto !py-1.5 text-xs">Refresh</button>
      </div>
      <p className="mt-1 text-xs text-slate-500">What each key slot resolves to right now — empty means no ad (or global fallback) matches that slot + format.</p>
      {loading && <p className="mt-3 text-xs font-bold text-slate-400">Loading previews…</p>}
      {!loading && (
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEW_SLOTS.map((s) => {
            const hit = results[s.label];
            const isBroken = broken[s.label];
            return (
              <div key={s.label} className="overflow-hidden rounded-2xl border border-slate-100">
                <div className={`relative bg-slate-50 ${s.format === "SQUARE" ? "aspect-square" : "aspect-[4/1]"}`}>
                  {hit?.ad && !isBroken ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hit.ad.image}
                      alt=""
                      loading="lazy"
                      onError={() => setBroken((b) => ({ ...b, [s.label]: true }))}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center p-3 text-center text-[11px] font-bold text-slate-400">
                      {hit?.ad && isBroken ? "⚠ Image broken — fix this creative" : "Empty — nothing matches"}
                    </div>
                  )}
                  {hit?.ad && isBroken && (
                    <span className="absolute left-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Broken image</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{s.label} • {s.format}</p>
                  <p className="truncate text-xs font-bold">{hit?.ad ? hit.ad.title : "—"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminAds() {  const [ads, setAds] = useState<Ad[]>([]);
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
            WIDE banners appear above breadcrumbs and between homepage sections; SQUARE ads appear in product, blog and guide sidebars.
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
            { title: "Guides", desc: "Above the breadcrumb on the guides index and guide pages, plus guide sidebars.", match: (a: Ad) => a.placement === "GUIDES" },
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

      <PerformanceReport ads={ads} />
      <SlotPreviews />
      <SlotTester />
    </div>
  );
}
