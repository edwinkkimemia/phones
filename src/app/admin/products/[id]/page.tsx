"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2, X, ExternalLink, Plus } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const CATS = ["laptops", "desktops", "iphones", "smartphones", "tablets", "wearables", "storage", "laptop-bags", "laptop-parts", "accessories", "gaming"];

interface Full {
  id: string; slug?: string; name: string; price: number;
  compareAtPrice?: number | null; stockQty?: number; tagline?: string | null;
  description?: string; condition?: string;
  brand?: string | { name: string; slug: string };
  category?: string | { name: string; slug: string };
  isDeal?: boolean; isNew?: boolean; isFeatured?: boolean; isBestSeller?: boolean;
  images?: { id?: string; url: string }[];
  specs?: { id: string; group: string; key: string; value: string }[];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [p, setP] = useState<Full | null>(null);
  const [readonly, setReadonly] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [spec, setSpec] = useState({ group: "General", key: "", value: "" });

  const load = async () => {
    const res = await fetch(`/api/products/${encodeURIComponent(params.id)}`);
    const data = await res.json();
    if (!res.ok) { setMsg(data.error ?? "Not found"); return; }
    const prod = data.product as Full;
    // normalize static-catalog shape
    if (typeof prod.brand !== "string" && prod.brand && typeof prod.brand === "object") prod.brand = prod.brand.name;
    if (typeof prod.category !== "string" && prod.category && typeof prod.category === "object") prod.category = prod.category.slug;
    setP(prod);
    setReadonly(!!data.readonly);
  };
  useEffect(() => { load(); }, [params.id]);

  const save = async (patch: Record<string, unknown>) => {
    if (!p) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, ...patch }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Saved." : (data.error ?? "Failed"));
    if (res.ok) load();
    setSaving(false);
  };

  const [form, setForm] = useState<null | Record<string, string | number | boolean>> (null);
  useEffect(() => {
    if (p && form === null) {
      setForm({
        name: p.name, price: p.price, compareAtPrice: p.compareAtPrice ?? "",
        stockQty: p.stockQty ?? 0, tagline: p.tagline ?? "",
        description: typeof p.description === "string" ? p.description : "",
        condition: p.condition ?? "NEW",
        brand: typeof p.brand === "string" ? p.brand : "",
        category: typeof p.category === "string" ? p.category : "laptops",
        isDeal: !!p.isDeal, isNew: !!p.isNew, isFeatured: !!p.isFeatured, isBestSeller: !!(p as { isBestSeller?: boolean }).isBestSeller,
      });
    }
  }, [p, form]);

  if (!p || !form) {
    return (
      <div>
        <p className="text-sm text-slate-500">{msg || "Loading product…"}</p>
        <Link href="/admin/products" className="mt-2 inline-block text-sm font-bold text-brand-700">← Back to products</Link>
      </div>
    );
  }

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f!, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/products" className="hover:text-brand-700">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">Edit — {p.name}</span>
      </nav>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="section-title !text-2xl">Edit Product</h1>
        {p.slug && (
          <Link href={`/product/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">
            View live <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {readonly && <p className="card mt-3 border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">Demo mode — connect the database to edit. Values below are read-only.</p>}
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="card grid gap-3 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Name</label><input className="input" value={String(form.name)} onChange={setF("name")} disabled={readonly} /></div>
            <div><label className="label">Brand</label><input className="input" value={String(form.brand)} onChange={setF("brand")} disabled={readonly} /></div>
            <div><label className="label">Category</label>
              <select className="input" value={String(form.category)} onChange={setF("category")} disabled={readonly}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Condition</label>
              <select className="input" value={String(form.condition)} onChange={setF("condition")} disabled={readonly}>
                <option value="NEW">Brand New</option>
                <option value="PRE_OWNED">Pre-Owned</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
            </div>
            <div><label className="label">Tagline</label><input className="input" value={String(form.tagline)} onChange={setF("tagline")} disabled={readonly} /></div>
            <div><label className="label">Price (KES)</label><input className="input" type="number" value={Number(form.price)} onChange={setF("price")} disabled={readonly} /></div>
            <div><label className="label">Old price (KES)</label><input className="input" type="number" value={form.compareAtPrice === "" ? "" : Number(form.compareAtPrice)} onChange={setF("compareAtPrice")} disabled={readonly} /></div>
            <div><label className="label">Stock qty</label><input className="input" type="number" value={Number(form.stockQty)} onChange={setF("stockQty")} disabled={readonly} /></div>
            <div className="flex flex-wrap gap-4 sm:col-span-2">
              {(["isDeal", "isNew", "isFeatured", "isBestSeller"] as const).map((f) => (
                <label key={f} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <input type="checkbox" checked={!!form[f]} onChange={setF(f)} disabled={readonly} className="h-4 w-4 accent-blue-700" />
                  {f.replace("is", "")}
                </label>
              ))}
            </div>
            <div className="sm:col-span-2"><label className="label">Description (rich text HTML)</label>
              <textarea className="input min-h-[160px] font-mono !text-[13px]" value={String(form.description)} onChange={setF("description")} disabled={readonly} />
            </div>
            {!readonly && (
              <div className="sm:col-span-2">
                <button
                  disabled={saving}
                  onClick={() => save({
                    name: String(form.name),
                    brand: String(form.brand),
                    category: String(form.category),
                    condition: String(form.condition),
                    tagline: String(form.tagline),
                    description: String(form.description),
                    price: Number(form.price),
                    compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
                    stockQty: Number(form.stockQty),
                    isDeal: !!form.isDeal, isNew: !!form.isNew, isFeatured: !!form.isFeatured, isBestSeller: !!form.isBestSeller,
                  })}
                  className="btn-primary !py-2.5 text-sm disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="font-extrabold">Specifications</p>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {(p.specs ?? []).map((s) => (
                  <tr key={s.id} className="border-t border-slate-50">
                    <td className="py-2 pr-2 text-xs text-slate-400">{s.group}</td>
                    <td className="py-2 pr-2 font-semibold text-slate-500">{s.key}</td>
                    <td className="py-2 font-medium">{s.value}</td>
                    <td className="py-2 text-right">
                      {!readonly && (
                        <button
                          onClick={async () => { await fetch(`/api/products/${p.id}/specs?specId=${s.id}`, { method: "DELETE" }); load(); }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete spec"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!readonly && (
              <form
                className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_1fr_auto]"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!spec.key.trim() || !spec.value.trim()) return;
                  await fetch(`/api/products/${p.id}/specs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(spec) });
                  setSpec({ group: "General", key: "", value: "" });
                  load();
                }}
              >
                <input className="input !py-2 text-xs" placeholder="Group" value={spec.group} onChange={(e) => setSpec({ ...spec, group: e.target.value })} />
                <input className="input !py-2 text-xs" placeholder="Key (e.g. RAM)" value={spec.key} onChange={(e) => setSpec({ ...spec, key: e.target.value })} required />
                <input className="input !py-2 text-xs" placeholder="Value (e.g. 16GB)" value={spec.value} onChange={(e) => setSpec({ ...spec, value: e.target.value })} required />
                <button className="btn-ghost !px-3 !py-2 text-xs"><Plus className="h-4 w-4" /> Add</button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-3 p-5">
            <p className="font-extrabold">Gallery ({(p.images ?? []).length})</p>
            {!readonly && <ImageUploader compact onUploaded={async (urls) => {
              await fetch(`/api/products/${p.id}/images`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls, alt: p.name }) });
              load();
            }} label="Upload photos" />}
            {!readonly && (
              <div className="flex gap-2">
                <input className="input !py-2 text-xs" placeholder="Paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <button
                  onClick={async () => {
                    if (!imageUrl.trim()) return;
                    await fetch(`/api/products/${p.id}/images`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls: [imageUrl.trim()], alt: p.name }) });
                    setImageUrl("");
                    load();
                  }}
                  className="btn-ghost shrink-0 !px-3 !py-2 text-xs"
                >
                  Add
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {(p.images ?? []).map((im, i) => (
                <div key={im.id ?? `${im.url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">Cover</span>}
                  {!readonly && im.id && (
                    <button
                      onClick={async () => { await fetch(`/api/products/${p.id}/images?imageId=${im.id}`, { method: "DELETE" }); load(); }}
                      className="absolute right-1 top-1 rounded-lg bg-ink-950/80 p-1 text-white hover:bg-red-600" aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {(p.images ?? []).length === 0 && <p className="col-span-2 text-center text-xs text-slate-400">No images yet.</p>}
            </div>
          </div>

          {!readonly && (
            <div className="card border-red-200 p-5">
              <p className="font-extrabold text-red-700">Danger zone</p>
              <button
                onClick={async () => {
                  if (!confirm(`Permanently delete “${p.name}”?`)) return;
                  const res = await fetch(`/api/products?id=${p.id}`, { method: "DELETE" });
                  if (res.ok) router.push("/admin/products");
                  else setMsg("Delete failed");
                }}
                className="mt-2 w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                Delete product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
