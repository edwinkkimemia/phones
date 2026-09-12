"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface Cat {
  id: string; slug: string; name: string; tagline?: string | null;
  description?: string | null; image?: string | null; _count?: { products: number };
}

export default function AdminCategories() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", tagline: "", description: "", image: "" });
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setRows(d.categories ?? [])).catch(() => null);
  };
  useEffect(load, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }
    setForm({ name: "", tagline: "", description: "", image: "" });
    setShowAdd(false);
    setMsg(`Category “${data.category.name}” created.`);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="section-title !text-2xl">Categories</h1>
          <p className="text-xs text-slate-500">{rows.length} categories • new slugs appear in the shop automatically</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary ml-auto !py-2.5 text-xs">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

      {showAdd && (
        <form onSubmit={create} className="card mt-4 grid gap-2.5 p-5 sm:grid-cols-2">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. CCTV & Security" required /></div>
          <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short line under the name" /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One or two sentences" /></div>
          <div className="sm:col-span-2"><label className="label">Cover image</label>
            <div className="flex gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {form.image && <img src={form.image} alt="" className="h-11 w-16 rounded-lg object-cover" />}
              <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" />
            </div>
            <div className="mt-2"><ImageUploader compact label="Upload cover" onUploaded={(urls) => urls[0] && setForm((f) => ({ ...f, image: urls[0] }))} /></div>
          </div>
          <div><button className="btn-primary !py-2.5 text-sm">Create category</button></div>
        </form>
      )}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="card flex gap-3 overflow-hidden p-3">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <FolderOpen className="m-auto h-6 w-6 text-slate-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">{c.name}</p>
              <p className="truncate text-xs text-slate-500">/{c.slug} • {c._count?.products ?? 0} products</p>
              <Link href={`/${c.slug}`} target="_blank" className="text-xs font-bold text-brand-700 hover:underline">View live →</Link>
            </div>
            <button
              onClick={async () => {
                if (!confirm(`Delete category “${c.name}”?`)) return;
                const res = await fetch(`/api/categories?id=${c.id}`, { method: "DELETE" });
                const data = await res.json().catch(() => ({}));
                setMsg(res.ok ? "Deleted." : (data.error ?? "Failed"));
                if (res.ok) load();
              }}
              className="self-start rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
