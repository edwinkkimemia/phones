"use client";
import { useState } from "react";
import { X } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  body: string;
  tags: string;
  published: boolean;
}

export const EMPTY_BLOG: BlogFormData = {
  title: "", slug: "", excerpt: "", cover: "", body: "", tags: "", published: false,
};

export function words(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

export default function BlogForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: BlogFormData;
  submitLabel: string;
  onSubmit: (data: {
    title: string; slug?: string; excerpt: string; cover?: string;
    body: string; tags: string[]; published: boolean;
  }) => Promise<string | null>;
}) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const count = words(form.body);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const err = await onSubmit({
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt,
      cover: form.cover || undefined,
      body: form.body,
      tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      published: form.published,
    });
    setBusy(false);
    if (err) setMsg(err);
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Slug (auto if blank)</label><input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
            <div><label className="label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="laptops, deals, guide" /></div>
          </div>
          <div><label className="label">Excerpt * (shown on cards + search)</label><textarea className="input min-h-[70px]" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required /></div>
        </div>
        <div className="card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <p className="font-extrabold">Article body</p>
            <span className={`text-xs font-bold ${count >= 500 ? "text-emerald-600" : "text-amber-600"}`}>
              {count} words{count < 500 ? ` (aim 500+)` : " ✓"}
            </span>
          </div>
          <RichTextEditor value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} minHeight={320} placeholder="Write the article: hooks, guides, picks, FAQs…" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <p className="font-extrabold">Cover image</p>
          {form.cover ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.cover} alt="" className="aspect-[16/9] w-full object-cover" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, cover: "" }))} className="absolute right-2 top-2 rounded-lg bg-ink-950/80 p-1.5 text-white" aria-label="Remove cover">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="grid aspect-[16/9] place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">16:9 cover preview</div>
          )}
          <input className="input font-mono !text-xs" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="https://…" />
          <ImageUploader compact label="Upload cover" onUploaded={(urls) => urls[0] && setForm((f) => ({ ...f, cover: urls[0] }))} />
        </div>
        <div className="card space-y-2.5 p-5">
          <label className="flex cursor-pointer items-center justify-between text-sm font-bold">
            Published
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-blue-700" />
          </label>
          <p className="text-[11px] text-slate-400">Drafts stay invisible until published.</p>
        </div>
        <button disabled={busy} className="btn-primary w-full !py-3.5 disabled:opacity-60">
          {busy ? "Saving…" : submitLabel}
        </button>
        {msg && <p className="text-center text-xs font-bold text-red-600">{msg}</p>}
      </div>
    </form>
  );
}
