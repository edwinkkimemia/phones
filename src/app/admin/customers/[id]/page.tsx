"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { kes } from "@/lib/utils";

interface Cust {
  id: string; name: string; phone: string; email?: string | null;
  town?: string | null; address?: string | null; landmark?: string | null;
  createdAt: string;
  orders: { id: string; orderNumber: string; status: string; paymentStatus: string; total: number; createdAt: string; items: { name: string; qty: number }[] }[];
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [c, setC] = useState<Cust | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/customers/${encodeURIComponent(params.id)}`)
      .then((r) => r.json())
      .then((d) => { if (d.customer) setC(d.customer); else setMsg(d.error ?? "Not found"); })
      .catch(() => setMsg("Failed to load"));
  }, [params.id]);

  if (!c) {
    return (
      <div>
        <p className="text-sm text-slate-500">{msg || "Loading…"}</p>
        <Link href="/admin/customers" className="mt-2 inline-block text-sm font-bold text-brand-700">← Back to customers</Link>
      </div>
    );
  }

  const spent = c.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/customers" className="hover:text-brand-700">Customers</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">{c.name}</span>
      </nav>
      <h1 className="section-title mt-1 !text-2xl">{c.name}</h1>
      <p className="text-xs text-slate-400">Customer since {new Date(c.createdAt).toLocaleDateString()}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="card h-fit space-y-2 p-5 text-sm">
          <p className="font-extrabold">Contact</p>
          <p className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" /> {c.phone}</p>
          <p className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" /> {c.email ?? "—"}</p>
          <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {[c.address, c.landmark, c.town].filter(Boolean).join(", ") || "—"}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3"><p className="font-display text-lg font-extrabold">{c.orders.length}</p><p className="text-[11px] text-slate-500">Orders</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="font-display text-lg font-extrabold">{kes(spent)}</p><p className="text-[11px] text-slate-500">Lifetime</p></div>
          </div>
          <a href={`https://wa.me/254${c.phone.replace(/\D/g, "").replace(/^254|^0/, "")}`} target="_blank" rel="noreferrer" className="btn-ghost w-full !py-2 text-xs">WhatsApp customer</a>
        </div>

        <div className="card h-fit p-5">
          <p className="font-extrabold">Order history</p>
          <div className="mt-3 space-y-2">
            {c.orders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 p-3 text-sm transition hover:border-brand-300">
                <strong>{o.orderNumber}</strong>
                <span className="chip">{o.status}</span>
                <span className="text-xs text-slate-500">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</span>
                <strong className="ml-auto">{kes(o.total)}</strong>
              </Link>
            ))}
            {c.orders.length === 0 && <p className="text-sm text-slate-400">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
