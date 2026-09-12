"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, Eye } from "lucide-react";

interface Post {
  id: string; slug: string; title: string; excerpt: string;
  cover?: string | null; tags: string[]; published: boolean; views: number;
}

export default function AdminBlog() {
  const [rows, setRows] = useState<Post[]>([]);
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/blog?all=1").then((r) => r.json()).then((d) => setRows(d.posts ?? [])).catch(() => null);
  };
  useEffect(load, []);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="section-title !text-2xl">Blog</h1>
          <p className="text-xs text-slate-500">{rows.length} articles • published posts go live at /blog instantly</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary ml-auto !py-2.5 text-xs"><Plus className="h-4 w-4" /> New article</Link>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}

      <div className="mt-4 space-y-2.5">
        {rows.map((p) => (
          <div key={p.id} className="card flex items-center gap-3 p-3">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {p.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/blog/${p.id}`} className="truncate font-bold hover:text-brand-700 hover:underline">
                {p.title}
              </Link>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className={`rounded-full px-2 py-0.5 font-bold ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views.toLocaleString()}</span>
                <span className="truncate">/{p.slug}</span>
              </p>
            </div>
            <Link href={`/admin/blog/${p.id}`} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              onClick={async () => {
                if (!confirm(`Delete “${p.title}”?`)) return;
                const res = await fetch(`/api/blog?id=${p.id}`, { method: "DELETE" });
                const data = await res.json().catch(() => ({}));
                setMsg(res.ok ? "Deleted." : (data.error ?? "Failed"));
                if (res.ok) load();
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {rows.length === 0 && <div className="card p-8 text-center text-sm text-slate-400">No articles yet.</div>}
      </div>
    </div>
  );
}
