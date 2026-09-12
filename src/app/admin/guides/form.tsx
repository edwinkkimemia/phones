"use client";
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";

export interface GuideSectionInput {
  h: string;
  body: string;
}

export interface GuideFormData {
  title: string;
  slug: string;
  description: string;
  cover: string;
  intro: string;
  readMins: string;
  updated: string;
  keywords: string;
  relatedSlugs: string;
  sections: GuideSectionInput[];
  faqs: [string, string][];
  published: boolean;
}

export const EMPTY_GUIDE: GuideFormData = {
  title: "", slug: "", description: "", cover: "", intro: "",
  readMins: "5", updated: "", keywords: "", relatedSlugs: "",
  sections: [{ h: "", body: "" }], faqs: [], published: false,
};

export default function GuideForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: GuideFormData;
  submitLabel: string;
  onSubmit: (data: {
    title: string; slug?: string; description: string; cover?: string;
    intro: string; sections: GuideSectionInput[]; relatedSlugs: string[];
    faqs: [string, string][]; keywords: string[]; readMins: number;
    updated: string; published: boolean;
  }) => Promise<string | null>;
}) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof GuideFormData, v: GuideFormData[keyof GuideFormData]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const sections = form.sections
      .map((s) => ({ h: s.h.trim(), body: s.body.trim() }))
      .filter((s) => s.h && s.body);
    if (sections.length === 0) {
      setBusy(false);
      setMsg("Add at least one section with a heading and body.");
      return;
    }
    const err = await onSubmit({
      title: form.title,
      slug: form.slug || undefined,
      description: form.description,
      cover: form.cover || undefined,
      intro: form.intro,
      sections,
      relatedSlugs: form.relatedSlugs.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      faqs: form.faqs
        .map(([q, a]) => [q.trim(), a.trim()] as [string, string])
        .filter(([q, a]) => q && a),
      keywords: form.keywords.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      readMins: Math.max(1, Number(form.readMins) || 5),
      updated: form.updated,
      published: form.published,
    });
    setBusy(false);
    if (err) setMsg(err);
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label">Slug (auto if blank)</label><input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" /></div>
            <div><label className="label">Read time (mins)</label><input className="input" type="number" min={1} value={form.readMins} onChange={(e) => set("readMins", e.target.value)} /></div>
            <div><label className="label">Updated label</label><input className="input" value={form.updated} onChange={(e) => set("updated", e.target.value)} placeholder="September 2026" /></div>
          </div>
          <div><label className="label">Description * (shown on cards + search)</label><textarea className="input min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} required /></div>
          <div><label className="label">Keywords (comma separated)</label><input className="input" value={form.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="laptops in Kenya, buy laptops Kenya" /></div>
          <div><label className="label">Intro *</label><RichTextEditor value={form.intro} onChange={(html) => set("intro", html)} minHeight={120} placeholder="Opening paragraph: the promise of this guide…" /></div>
        </div>

        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="font-extrabold">Sections *</p>
            <button
              type="button"
              onClick={() => set("sections", [...form.sections, { h: "", body: "" }])}
              className="btn-ghost !py-1.5 text-xs"
            >
              <Plus className="h-4 w-4" /> Add section
            </button>
          </div>
          {form.sections.map((s, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <input
                  className="input font-bold"
                  value={s.h}
                  onChange={(e) => {
                    const next = [...form.sections];
                    next[i] = { ...next[i], h: e.target.value };
                    set("sections", next);
                  }}
                  placeholder={`Section ${i + 1} heading`}
                />
                <button
                  type="button"
                  disabled={form.sections.length <= 1}
                  onClick={() => set("sections", form.sections.filter((_, j) => j !== i))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  aria-label="Remove section"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <RichTextEditor
                value={s.body}
                minHeight={140}
                placeholder="Section body: advice, price bands, picks…"
                onChange={(html) => {
                  const next = [...form.sections];
                  next[i] = { ...next[i], body: html };
                  set("sections", next);
                }}
              />
            </div>
          ))}
        </div>

        <div className="card space-y-3 p-5">
          <div><label className="label">Recommended products (slugs, comma separated)</label><input className="input font-mono !text-xs" value={form.relatedSlugs} onChange={(e) => set("relatedSlugs", e.target.value)} placeholder="hp-probook-440-g10, iphone-15-128gb" /></div>
          <div className="flex items-center justify-between">
            <p className="font-extrabold">FAQs</p>
            <button
              type="button"
              onClick={() => set("faqs", [...form.faqs, ["", ""]])}
              className="btn-ghost !py-1.5 text-xs"
            >
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          </div>
          {form.faqs.map(([q, a], i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <input
                  className="input font-bold"
                  value={q}
                  onChange={(e) => {
                    const next = form.faqs.map((f, j) => (j === i ? [e.target.value, f[1]] as [string, string] : f));
                    set("faqs", next);
                  }}
                  placeholder="Question"
                />
                <button
                  type="button"
                  onClick={() => set("faqs", form.faqs.filter((_, j) => j !== i))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                className="input min-h-[60px]"
                value={a}
                onChange={(e) => {
                  const next = form.faqs.map((f, j) => (j === i ? [f[0], e.target.value] as [string, string] : f));
                  set("faqs", next);
                }}
                placeholder="Answer"
              />
            </div>
          ))}
          {form.faqs.length === 0 && <p className="text-xs text-slate-400">No FAQs yet — add the questions buyers actually ask.</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <p className="font-extrabold">Featured image</p>
          {form.cover ? (
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.cover} alt="" className="aspect-[16/9] w-full object-cover" />
              <button type="button" onClick={() => set("cover", "")} className="absolute right-2 top-2 rounded-lg bg-ink-950/80 p-1.5 text-white" aria-label="Remove cover">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="grid aspect-[16/9] place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">16:9 cover preview</div>
          )}
          <input className="input font-mono !text-xs" value={form.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://…" />
          <ImageUploader compact label="Upload cover" onUploaded={(urls) => urls[0] && set("cover", urls[0])} />
        </div>
        <div className="card space-y-2.5 p-5">
          <label className="flex cursor-pointer items-center justify-between text-sm font-bold">
            Published
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-blue-700" />
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
