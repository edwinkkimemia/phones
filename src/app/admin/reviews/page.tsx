"use client";
import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";

interface Review {
  id: string; name: string; rating: number; title?: string | null;
  body: string; approved: boolean; verified: boolean; createdAt: string;
  product?: { name: string; slug: string };
}

export default function AdminReviews() {
  const [pending, setPending] = useState<Review[]>([]);
  const [approved, setApproved] = useState<Review[]>([]);
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/reviews?pending=1").then((r) => r.json()).then((d) => setPending(d.reviews ?? [])).catch(() => null);
    fetch("/api/reviews").then((r) => r.json()).then((d) => setApproved(Array.isArray(d.reviews) ? d.reviews : [])).catch(() => null);
  };
  useEffect(load, []);

  const act = async (method: string, body?: unknown, query = "") => {
    const res = await fetch(`/api/reviews${query}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Done." : (data.error ?? "Failed"));
    if (res.ok) load();
  };

  const card = (r: Review, isPending: boolean) => (
    <div key={r.id} className="card p-4">
      <div className="flex items-center gap-1 text-amber-400">
        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
        <span className="ml-1 text-xs font-bold text-slate-500">{r.product?.name ?? ""}</span>
      </div>
      <p className="mt-1 text-sm font-bold">{r.title || r.name}</p>
      <p className="mt-0.5 text-sm text-slate-600">“{r.body}”</p>
      <p className="mt-1 text-xs text-slate-400">{r.name} • {new Date(r.createdAt).toLocaleDateString()} {r.verified ? "• ✓ Verified" : ""}</p>
      <div className="mt-2.5 flex gap-1.5">
        {isPending && (
          <button onClick={() => act("PATCH", { id: r.id, approved: true })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
            Approve
          </button>
        )}
        {isPending && (
          <button onClick={() => act("PATCH", { id: r.id, approved: false })} className="btn-ghost !px-3 !py-1.5 text-xs">
            Reject
          </button>
        )}
        <button onClick={() => { if (confirm("Delete this review?")) act("DELETE", undefined, `?id=${r.id}`); }} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="section-title !text-2xl">Reviews</h1>
      <p className="text-xs text-slate-500">Approve, reject or delete. Approving syncs the product rating.</p>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
      <h2 className="mt-4 font-extrabold">Awaiting moderation ({pending.length})</h2>
      <div className="mt-2 grid gap-2.5 md:grid-cols-2">
        {pending.map((r) => card(r, true))}
        {pending.length === 0 && <p className="card p-6 text-center text-sm text-slate-400 md:col-span-2">Inbox zero. 🎉</p>}
      </div>
      <h2 className="mt-6 font-extrabold">Live reviews</h2>
      <div className="mt-2 grid gap-2.5 md:grid-cols-2">
        {approved.slice(0, 12).map((r) => card(r, false))}
      </div>
    </div>
  );
}
