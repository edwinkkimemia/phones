"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { kes } from "@/lib/utils";

interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  paymentMethod: string; total: number; town?: string | null; phone?: string | null;
  createdAt: string; items: { name: string; qty: number; price: number }[];
}

const STATUSES = ["PENDING", "PAID", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"];
const PAY_STATUSES = ["PENDING", "INITIATED", "COMPLETED", "FAILED", "REFUNDED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [source, setSource] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [msg, setMsg] = useState("");

  const load = () => {
    fetch("/api/orders?limit=100")
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders ?? []); setSource(d.source); })
      .catch(() => null);
  };
  useEffect(load, []);

  const update = async (orderNumber: string, patch: Record<string, string>) => {
    setMsg("");
    const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? `Updated ${orderNumber}.` : (data.error ?? "Failed"));
    if (res.ok) load();
  };

  const shown = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="section-title !text-2xl">Orders</h1>
      <p className="text-xs text-slate-500">{shown.length} shown • {source === "db" ? "Live database" : "Offline"}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["ALL", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === s ? "bg-ink-950 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {s}
          </button>
        ))}
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
      <div className="mt-3 space-y-2.5">
        {shown.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`} className="font-extrabold hover:text-brand-700 hover:underline">{o.orderNumber}</Link>
              <span className="chip">{o.paymentMethod}</span>
              <span className="ml-auto font-extrabold">{kes(o.total)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(o.createdAt).toLocaleString()} • {o.town ?? "—"} • {o.phone ?? "—"} • {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
            </p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-500">Order status
                <select value={o.status} onChange={(e) => update(o.orderNumber, { status: e.target.value })} className="input mt-1 !py-2 text-xs font-bold">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-500">Payment
                <select value={o.paymentStatus} onChange={(e) => update(o.orderNumber, { paymentStatus: e.target.value })} className="input mt-1 !py-2 text-xs font-bold">
                  {PAY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </div>
        ))}
        {shown.length === 0 && <div className="card p-8 text-center text-sm text-slate-400">No orders yet — new checkout orders appear here.</div>}
      </div>
    </div>
  );
}
