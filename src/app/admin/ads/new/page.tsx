"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import AdTargetInput from "@/components/AdTargetInput";

export default function NewAdPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    image: "",
    link: "/deals",
    placement: "GLOBAL",
    target: "all",
    format: "WIDE",
    sortOrder: "0",
  });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) || 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push("/admin/ads");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/ads" className="hover:text-brand-700">Ads & Banners</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">New ad</span>
      </nav>
      <h1 className="section-title mt-1 !text-2xl">New Ad</h1>
      <p className="mt-1 text-xs text-slate-500">
        WIDE banners appear above breadcrumbs and between homepage sections; SQUARE ads appear in product, blog and guide sidebars.
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-3 p-5">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Back-to-school laptop sale" required /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Link (where it goes) *</label><input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/laptops" required /></div>
            <div><label className="label">Target slug *</label><AdTargetInput placement={form.placement} value={form.target} onChange={(v) => setForm({ ...form, target: v })} /></div>
            <div><label className="label">Shows on</label>
              <select className="input" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
                <option value="GLOBAL">GLOBAL (everywhere)</option>
                <option value="HOMEPAGE">HOMEPAGE section</option>
                <option value="CATEGORY">CATEGORY page</option>
                <option value="PRODUCT">PRODUCT page</option>
                <option value="BLOG">BLOG page</option>
                <option value="GUIDES">GUIDES page</option>
              </select>
            </div>
            <div><label className="label">Format</label>
              <select className="input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                <option value="WIDE">WIDE (breadcrumb banner)</option>
                <option value="SQUARE">SQUARE (product sidebar)</option>
              </select>
            </div>
            <div><label className="label">Priority (lowest wins ties)</label><input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          </div>
          <button disabled={saving} className="btn-primary !py-3 text-sm disabled:opacity-60">
            {saving ? "Publishing…" : "Publish ad"}
          </button>
          {msg && <p className="text-xs font-bold text-red-600">{msg}</p>}
        </div>

        <div className="card space-y-3 p-5">
          <p className="font-extrabold">Creative</p>
          {form.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="" className={`w-full rounded-xl border border-slate-200 object-cover ${form.format === "SQUARE" ? "aspect-square" : "aspect-[4/1]"}`} />
          ) : (
            <div className="grid aspect-[4/1] place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">Preview appears here</div>
          )}
          <div><label className="label">Image URL *</label><input className="input font-mono !text-xs" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" required /></div>
          <ImageUploader compact label="…or upload creative" onUploaded={(urls) => urls[0] && setForm((f) => ({ ...f, image: urls[0] }))} />
          <p className="text-[11px] leading-relaxed text-slate-400">WIDE displays ≈1216×176 desktop / 343×112 phones — upload 1920×400, keep text centered (edges crop). SQUARE displays ≈360×360 desktop / 165×165 phones — upload 1080×1080.</p>
        </div>
      </form>
    </div>
  );
}
