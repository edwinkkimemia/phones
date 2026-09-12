"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Phone, MapPin, User } from "lucide-react";
import { kes } from "@/lib/utils";

interface Detail {
  orderNumber: string; status: string; paymentStatus: string; paymentMethod: string;
  subtotal: number; deliveryFee: number; discount: number; total: number;
  town?: string | null; address?: string | null; phone?: string | null;
  notes?: string | null; createdAt: string;
  customer?: { id: string; name: string; phone: string; email?: string | null; town?: string | null; address?: string | null } | null;
  payments?: { id: string; method: string; status: string; amount: number; mpesaReceipt?: string | null; createdAt: string }[];
  items: { name: string; qty: number; price: number; image?: string | null }[];
}

const STATUSES = ["PENDING", "PAID", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"];
const PAY_STATUSES = ["PENDING", "INITIATED", "COMPLETED", "FAILED", "REFUNDED"];

export default function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const num = decodeURIComponent(params.orderNumber);
  const [o, setO] = useState<Detail | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch(`/api/orders/${encodeURIComponent(num)}`);
    const data = await res.json();
    if (res.ok) setO(data.order);
    else setMsg(data.error ?? "Not found");
  };
  useEffect(() => { load(); }, [num]);

  const update = async (patch: Record<string, string>) => {
    const res = await fetch(`/api/orders/${encodeURIComponent(num)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Updated." : (data.error ?? "Failed"));
    if (res.ok) load();
  };

  if (!o) {
    return (
      <div>
        <p className="text-sm text-slate-500">{msg || "Loading order…"}</p>
        <Link href="/admin/orders" className="mt-2 inline-block text-sm font-bold text-brand-700">← Back to orders</Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/admin/orders" className="hover:text-brand-700">Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">{o.orderNumber}</span>
      </nav>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="section-title !text-2xl">{o.orderNumber}</h1>
        <span className="chip !border-brand-200 !bg-brand-50 !text-brand-700">{o.status}</span>
        <span className="chip">{o.paymentMethod} • {o.paymentStatus}</span>
      </div>
      {msg && <p className="mt-2 text-xs font-bold text-slate-600">{msg}</p>}
      <p className="mt-1 text-xs text-slate-400">Placed {new Date(o.createdAt).toLocaleString()}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="card p-5">
            <p className="font-extrabold">Items</p>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {o.items.map((i, idx) => (
                  <tr key={idx} className="border-t border-slate-50">
                    <td className="py-2.5 pr-2 font-semibold">{i.name}</td>
                    <td className="whitespace-nowrap py-2.5 pr-2 text-slate-500">× {i.qty}</td>
                    <td className="whitespace-nowrap py-2.5 text-right font-bold">{kes(i.price * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-bold">{kes(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd className="font-bold">{kes(o.deliveryFee)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd className="font-bold">−{kes(o.discount)}</dd></div>}
              <div className="flex justify-between text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{kes(o.total)}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <p className="font-extrabold">Payments</p>
            <div className="mt-2 space-y-2 text-sm">
              {(o.payments ?? []).map((pay) => (
                <div key={pay.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
                  <span className="font-bold">{pay.method}</span>
                  <span className="chip">{pay.status}</span>
                  {pay.mpesaReceipt && <span className="text-xs text-slate-500">Receipt: {pay.mpesaReceipt}</span>}
                  <strong className="ml-auto">{kes(pay.amount)}</strong>
                </div>
              ))}
              {(o.payments ?? []).length === 0 && <p className="text-slate-400">No payment records.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-2.5 p-5">
            <p className="font-extrabold">Fulfilment</p>
            <label className="text-xs font-bold text-slate-500">Order status
              <select value={o.status} onChange={(e) => update({ status: e.target.value })} className="input mt-1 !py-2 text-xs font-bold">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-500">Payment status
              <select value={o.paymentStatus} onChange={(e) => update({ paymentStatus: e.target.value })} className="input mt-1 !py-2 text-xs font-bold">
                {PAY_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div className="card space-y-2 p-5 text-sm">
            <p className="font-extrabold">Customer</p>
            {o.customer ? (
              <Link href={`/admin/customers/${o.customer.id}`} className="flex items-center gap-2 font-bold text-brand-700 hover:underline">
                <User className="h-4 w-4" /> {o.customer.name}
              </Link>
            ) : <p className="font-bold">{o.phone ?? "Guest checkout"}</p>}
            <p className="flex items-center gap-1.5 text-slate-600"><Phone className="h-4 w-4 text-slate-400" /> {o.phone ?? o.customer?.phone ?? "—"}</p>
            <p className="flex items-start gap-1.5 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {[o.address, o.town].filter(Boolean).join(", ") || "—"}</p>
            {o.notes && <p className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500">Note: {o.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
