"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import BlogForm, { EMPTY_BLOG } from "../form";

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initial, setInitial] = useState<typeof EMPTY_BLOG | null>(null);
  const [slug, setSlug] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/blog?all=1")
      .then((r) => r.json())
      .then((d) => {
        const hit = (d.posts ?? []).find((p: { id: string }) => p.id === params.id);
        if (!hit) {
          setMsg("Article not found.");
          return;
        }
        // Full body needs the single-post endpoint.
        fetch(`/api/blog?slug=${encodeURIComponent(hit.slug)}`)
          .then((r) => r.json())
          .then((full) => {
            const p = full.post ?? hit;
            setSlug(p.slug);
            setInitial({
              title: p.title ?? "",
              slug: p.slug ?? "",
              excerpt: p.excerpt ?? "",
              cover: p.cover ?? "",
              body: p.body ?? "",
              tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
              published: !!p.published,
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
        <Link href="/admin/blog" className="mt-2 inline-block text-sm font-bold text-brand-700">← Back to blog</Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/blog" className="hover:text-brand-700">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate font-semibold text-slate-800">Edit — {initial.title}</span>
      </nav>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="section-title !text-2xl">Edit Article</h1>
        <Link href={`/blog/${slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">
          View live <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={async () => {
            if (!confirm("Permanently delete this article?")) return;
            const res = await fetch(`/api/blog?id=${params.id}`, { method: "DELETE" });
            if (res.ok) router.push("/admin/blog");
            else setMsg("Delete failed");
          }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
      <BlogForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={async (data) => {
          const res = await fetch("/api/blog", {
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
