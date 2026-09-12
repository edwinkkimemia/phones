"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import GuideForm, { EMPTY_GUIDE } from "../form";

export default function EditGuidePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initial, setInitial] = useState<typeof EMPTY_GUIDE | null>(null);
  const [slug, setSlug] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/guides?all=1")
      .then((r) => r.json())
      .then((d) => {
        const hit = (d.guides ?? []).find((g: { id: string }) => g.id === params.id);
        if (!hit) {
          setMsg("Guide not found.");
          return;
        }
        // Full fields need the single-guide endpoint.
        fetch(`/api/guides?slug=${encodeURIComponent(hit.slug)}`)
          .then((r) => r.json())
          .then((full) => {
            const g = full.guide ?? hit;
            setSlug(g.slug);
            setInitial({
              title: g.title ?? "",
              slug: g.slug ?? "",
              description: g.description ?? "",
              cover: g.cover ?? "",
              intro: g.intro ?? "",
              readMins: String(g.readMins ?? 5),
              updated: g.updated ?? "",
              keywords: Array.isArray(g.keywords) ? g.keywords.join(", ") : "",
              relatedSlugs: Array.isArray(g.relatedSlugs) ? g.relatedSlugs.join(", ") : "",
              sections: Array.isArray(g.sections) && g.sections.length > 0
                ? g.sections.map((s: { h?: unknown; body?: unknown }) => ({ h: String(s.h ?? ""), body: String(s.body ?? "") }))
                : [{ h: "", body: "" }],
              faqs: Array.isArray(g.faqs)
                ? g.faqs.filter(Array.isArray).map(([q, a]: [unknown, unknown]) => [String(q ?? ""), String(a ?? "")] as [string, string])
                : [],
              published: !!g.published,
            });
          })
          .catch(() => setMsg("Failed to load."));
      })
      .catch(() => setMsg("Failed to load."));
  }, [params.id]);

  if (!initial) {
    return (
      <div>
        <p className="text-sm text-slate-500">{msg || "Loading…"}</p>
        <Link href="/admin/guides" className="mt-2 inline-block text-sm font-bold text-brand-700">← Back to guides</Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/guides" className="hover:text-brand-700">Guides</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">Edit — {initial.title}</span>
      </nav>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="section-title !text-2xl">Edit Guide</h1>
        <Link href={`/guides/${slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">
          View live <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={async () => {
            if (!confirm("Permanently delete this guide?")) return;
            const res = await fetch(`/api/guides?id=${params.id}`, { method: "DELETE" });
            if (res.ok) router.push("/admin/guides");
            else setMsg("Delete failed");
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
      <GuideForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (data) => {
          const res = await fetch("/api/guides", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: params.id, ...data }),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok) return out.error ?? "Failed";
          setMsg("Saved.");
          return null;
        }}
      />
    </div>
  );
}
