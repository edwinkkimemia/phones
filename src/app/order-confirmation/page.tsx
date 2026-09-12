"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Loader2, Smartphone } from "lucide-react";
import { kes } from "@/lib/utils";

interface ConfirmData {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  phone?: string;
  town?: string;
  items: { name: string; qty: number; price: number }[];
  stk?: { simulated: boolean; message: string };
}

function Body() {
  const sp = useSearchParams();
  const order = sp.get("order") ?? "";
  const [data, setData] = useState<ConfirmData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) { setLoading(false); return; }
    fetch(`/api/orders/${encodeURIComponent(order)}`)
      .then((r) => r.json())
      .then((d) => setData(d.order ?? d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [order]);

  if (loading) return <div className="container-x grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;
  if (!order || !data) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="section-title">Order not found</h1>
        <p className="mt-2 text-sm text-slate-500">Check your order number or track below.</p>
        <Link href="/track-order" className="btn-primary mt-6">Track My Order</Link>
      </div>
    );
  }

  return (
    <div className="container-x max-w-2xl py-10 md:py-14">
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="font-display mt-4 text-3xl font-extrabold">Order Confirmed 🎉</h1>
        <p className="mt-2 text-sm text-slate-500">Thank you for shopping with PhoneLaptops.co.ke</p>
        <div className="mx-auto mt-5 grid max-w-md gap-2 rounded-2xl bg-slate-50 p-4 text-left text-sm">
          <p className="flex justify-between"><span className="text-slate-500">Order number</span><strong>{data.orderNumber}</strong></p>
          <p className="flex justify-between"><span className="text-slate-500">Amount</span><strong>{kes(data.total)}</strong></p>
          <p className="flex justify-between"><span className="text-slate-500">Payment</span><strong>{data.paymentMethod} • {data.paymentStatus}</strong></p>
          {data.town && <p className="flex justify-between"><span className="text-slate-500">Delivery to</span><strong>{data.town}</strong></p>}
        </div>
        {data.paymentMethod === "MPESA" && data.paymentStatus !== "COMPLETED" && (
          <div className="mx-auto mt-4 max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm">
            <p className="flex items-center gap-2 font-extrabold text-emerald-800"><Smartphone className="h-4 w-4" /> Check your phone</p>
            <p className="mt-1 text-emerald-900">{data.stk?.message ?? `An M-Pesa prompt was sent to ${data.phone}. Enter your PIN to complete payment.`}</p>
          </div>
        )}
        <div className="mx-auto mt-4 max-w-md text-left">
          <p className="label">Items</p>
          <ul className="space-y-1.5 text-sm">
            {data.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3"><span className="truncate">{i.name} × {i.qty}</span><strong>{kes(i.price * i.qty)}</strong></li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href={`/track-order?order=${encodeURIComponent(data.orderNumber)}`} className="btn-primary"><Package className="h-4 w-4" /> Track My Order</Link>
          <Link href="/deals" className="btn-ghost">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return <Suspense><Body /></Suspense>;
}
