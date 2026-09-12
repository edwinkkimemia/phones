"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, X, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";

const CATS = ["laptops", "desktops", "phones", "iphones", "tablets", "wearables", "storage", "laptop-bags", "laptop-parts", "phone-parts", "accessories", "gaming"];

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", brand: "", category: "laptops", price: "", compareAtPrice: "",
    stockQty: "10", condition: "NEW", tagline: "", description: "",
    isDeal: false, isNew: true, isFeatured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [specs, setSpecs] = useState<{ group: string; key: string; value: string }[]>([
    { group: "General", key: "Warranty", value: "1 Year" },
  ]);
  const [specDraft, setSpecDraft] = useState({ group: "General", key: "", value: "" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          stockQty: Number(form.stockQty),
          brand: form.brand || undefined,
          images: images.length > 0 ? images : undefined,
          specs: specs.filter((s) => s.key.trim() && s.value.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`/admin/products/${data.product.id}`);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/products" className="hover:text-brand-700">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">New product</span>
      </nav>
      <h1 className="section-title mt-1 !text-2xl">New Product</h1>

      <form onSubmit={submit} className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="card space-y-3 p-5">
            <p className="font-extrabold">Basics</p>
            <div><label className="label">Product name *</label><input className="input" value={form.name} onChange={set("name")} placeholder="e.g. HP ProBook 440 G10 · Core i7 · 16GB · 512GB" required /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={set("brand")} placeholder="HP" /></div>
              <div><label className="label">Category</label>
                <select className="input" value={form.category} onChange={set("category")}>
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Condition</label>
                <select className="input" value={form.condition} onChange={set("condition")}>
                  <option value="NEW">Brand New</option>
                  <option value="PRE_OWNED">Pre-Owned</option>
                  <option value="REFURBISHED">Refurbished</option>
                </select>
              </div>
              <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={set("tagline")} placeholder="Short selling line" /></div>
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <p className="font-extrabold">Pricing & stock</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className="label">Price (KES) *</label><input className="input" type="number" min={1} value={form.price} onChange={set("price")} required /></div>
              <div><label className="label">Old price (KES)</label><input className="input" type="number" min={0} value={form.compareAtPrice} onChange={set("compareAtPrice")} placeholder="Optional" /></div>
              <div><label className="label">Stock qty</label><input className="input" type="number" min={0} value={form.stockQty} onChange={set("stockQty")} /></div>
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <p className="font-extrabold">Description</p>
            <RichTextEditor value={form.description} onChange={(html) => setForm((f) => ({ ...f, description: html }))} placeholder="Sell it: key features, what's in the box, warranty…" />
          </div>

          <div className="card space-y-3 p-5">
            <p className="font-extrabold">Specifications</p>
            {specs.length > 0 && (
              <ul className="space-y-1.5">
                {specs.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-[11px] font-bold uppercase text-slate-400">{s.group}</span>
                    <span className="font-semibold text-slate-600">{s.key}</span>
                    <span className="flex-1 font-medium">{s.value}</span>
                    <button type="button" onClick={() => setSpecs((sp) => sp.filter((_, x) => x !== i))} className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove spec">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 sm:grid-cols-[130px_1fr_1fr_auto]">
              <input className="input !py-2 text-xs" placeholder="Group" value={specDraft.group} onChange={(e) => setSpecDraft({ ...specDraft, group: e.target.value })} />
              <input className="input !py-2 text-xs" placeholder="Key (e.g. RAM)" value={specDraft.key} onChange={(e) => setSpecDraft({ ...specDraft, key: e.target.value })} />
              <input className="input !py-2 text-xs" placeholder="Value (e.g. 16GB)" value={specDraft.value} onChange={(e) => setSpecDraft({ ...specDraft, value: e.target.value })} />
              <button
                type="button"
                onClick={() => {
                  if (!specDraft.key.trim() || !specDraft.value.trim()) return;
                  setSpecs((sp) => [...sp, { ...specDraft }]);
                  setSpecDraft({ group: specDraft.group, key: "", value: "" });
                }}
                className="btn-ghost !px-3 !py-2 text-xs"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-3 p-5">
            <p className="font-extrabold">Images</p>
            <ImageUploader onUploaded={(urls) => setImages((im) => [...im, ...urls])} label="Upload product photos" />
            <div className="flex gap-2">
              <input className="input" placeholder="…or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <button type="button" onClick={() => { if (imageUrl.trim()) { setImages((im) => [...im, imageUrl.trim()]); setImageUrl(""); } }} className="btn-ghost shrink-0 !py-2 text-xs">Add</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((u) => (
                <div key={u} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages((im) => im.filter((x) => x !== u))} className="absolute right-1 top-1 rounded-lg bg-ink-950/80 p-1 text-white" aria-label="Remove">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-2.5 p-5">
            <p className="font-extrabold">Visibility</p>
            {(["isDeal", "isNew", "isFeatured"] as const).map((f) => (
              <label key={f} className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                {f === "isDeal" ? "Deal (shows in Today's Deals)" : f === "isNew" ? "New arrival badge" : "Featured (homepage + showcases)"}
                <input type="checkbox" checked={form[f]} onChange={set(f)} className="h-4 w-4 accent-blue-700" />
              </label>
            ))}
          </div>

          <button disabled={saving} className="btn-primary w-full !py-3.5 disabled:opacity-60">
            {saving ? "Creating…" : "Create product"}
          </button>
          {msg && <p className="text-center text-xs font-bold text-red-600">{msg}</p>}
        </div>
      </form>
    </div>
  );
}
