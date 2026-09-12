"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface Ad {
  id: string; title: string; image: string; link: string;
  placement: "GLOBAL" | "HOMEPAGE" | "CATEGORY" | "PRODUCT"; target: string;
  format: "WIDE" | "SQUARE"; sortOrder: number; active: boolean;
  startsAt?: string | null; endsAt?: string | null;
}

const toInput = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export default function EditAdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<Ad | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ads?list=all")
      .then((r) => r.json())
      .then((d) => {
        const hit = (d.ads ?? []).find((a: Ad) => a.id === params.id);
        if (hit) setForm({ ...hit, format: hit.format ?? "WIDE", sortOrder: hit.sortOrder ?? 0 });
        else setMsg("Ad not found (demo ads can't be edited — connect the database).");
      })
      .catch(() => setMsg("Failed to load"));
  }, [params.id]);

  if (!form) {
    return (
      <div>
        <p className="text-sm text-slate-500">{msg || "Loading…"}</p>
        <Link href="/admin/ads" className="mt-2 inline-block text-sm font-bold text-brand-700">← Back to ads</Link>
      </div>
    );
  }

  const set = (k: keyof Ad) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value } : f));

  const save = async () => {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        image: form.image,
        link: form.link,
        placement: form.placement,
        target: form.target,
        format: form.format,
        sortOrder: Number(form.sortOrder),
        active: form.active,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Saved." : (data.error ?? "Failed"));
    setSaving(false);
  };

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/ads" className="hover:text-brand-700">Ads & Banners</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">Edit — {form.title}</span>
      </nav>
      <h1 className="section-title mt-1 !text-2xl">Edit Ad</h1>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-3 p-5">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={set("title")} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Link (where it goes)</label><input className="input" value={form.link} onChange={set("link")} placeholder="/deals" /></div>
            <div><label className="label">Target slug</label><input className="input" value={form.target} onChange={set("target")} placeholder="slug or all" /></div>
            <div><label className="label">Shows on</label>
              <select className="input" value={form.placement} onChange={set("placement")}>
                <option value="GLOBAL">GLOBAL (everywhere)</option>
                <option value="HOMEPAGE">HOMEPAGE section</option>
                <option value="CATEGORY">CATEGORY page</option>
                <option value="PRODUCT">PRODUCT page</option>
              </select>
            </div>
            <div><label className="label">Format</label>
              <select className="input" value={form.format} onChange={set("format")}>
                <option value="WIDE">WIDE (breadcrumb banner)</option>
                <option value="SQUARE">SQUARE (product sidebar)</option>
              </select>
            </div>
            <div><label className="label">Priority (lowest wins)</label><input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => (f ? { ...f, sortOrder: Number(e.target.value) } : f))} /></div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-bold">
              <input type="checkbox" checked={form.active} onChange={set("active")} className="h-4 w-4 accent-blue-700" /> Live
            </label>
            <div><label className="label">Starts at (optional)</label><input className="input" type="datetime-local" value={toInput(form.startsAt)} onChange={(e) => setForm((f) => (f ? { ...f, startsAt: e.target.value || null } : f))} /></div>
            <div><label className="label">Ends at (optional)</label><input className="input" type="datetime-local" value={toInput(form.endsAt)} onChange={(e) => setForm((f) => (f ? { ...f, endsAt: e.target.value || null } : f))} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary !py-2.5 text-sm disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
            <button
              onClick={async () => {
                if (!confirm(`Delete “${form.title}”?`)) return;
                const res = await fetch(`/api/ads?id=${encodeURIComponent(form.id)}`, { method: "DELETE" });
                if (res.ok) router.push("/admin/ads");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
          {msg && <p className="text-xs font-bold text-slate-600">{msg}</p>}
        </div>

        <div className="card space-y-3 p-5">
          <p className="font-extrabold">Creative</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {form.image && <img src={form.image} alt="" className={`w-full rounded-xl border border-slate-200 object-cover ${form.format === "SQUARE" ? "aspect-square" : "aspect-[4/1]"}`} />}
          <div><label className="label">Image URL</label><input className="input font-mono !text-xs" value={form.image} onChange={set("image")} /></div>
          <ImageUploader compact label="Upload new creative" onUploaded={(urls) => urls[0] && setForm((f) => (f ? { ...f, image: urls[0] } : f))} />
          <p className="text-[11px] text-slate-400">WIDE: 1600px wide banner • SQUARE: 800×800</p>
        </div>
      </div>
    </div>
  );
}
