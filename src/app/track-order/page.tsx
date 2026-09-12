"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, Loader2 } from "lucide-react";
import { kes } from "@/lib/utils";

const STEPS = ["PENDING", "PAID", "PROCESSING", "DISPATCHED", "DELIVERED"] as const;

function Body() {
  const sp = useSearchParams();
  const [num, setNum] = useState(sp.get("order") ?? "");
  const [result, setResult] = useState<null | { orderNumber: string; status: string; paymentStatus: string; total: number; town?: string; items: { name: string; qty: number }[] }>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!num.trim()) return;
    setLoading(true); setErr(""); setResult(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(num.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Not found");
      setResult(data.order);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = result ? STEPS.indexOf(result.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="container-x max-w-2xl py-10 md:py-14">
      <h1 className="section-title text-center">Track Your Order</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Enter the order number from your confirmation (e.g. PL-20260101-1234).</p>
      <form onSubmit={track} className="card mt-6 flex gap-2 p-3">
        <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="PL-…" className="input uppercase" />
        <button className="btn-primary shrink-0" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageSearch className="h-4 w-4" />} Track</button>
      </form>
      {err && <p className="card mt-4 border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">{err}</p>}
      {result && (
        <div className="card mt-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-extrabold">{result.orderNumber}</p>
            <span className="chip !border-brand-200 !bg-brand-50 !text-brand-700">{result.status} • {result.paymentStatus}</span>
          </div>
          <div className="mt-5 flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-extrabold ${i <= stepIdx ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>{i + 1}</span>
                  <span className="hidden text-[9px] font-bold uppercase sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <span className={`mx-1 h-0.5 flex-1 ${i < stepIdx ? "bg-emerald-500" : "bg-slate-100"}`} />}
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-1 text-sm">
            {result.items.map((i, idx) => <li key={idx} className="flex justify-between"><span>{i.name} × {i.qty}</span></li>)}
          </ul>
          <p className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-extrabold"><span>Total</span><span>{kes(result.total)}</span></p>
          {result.town && <p className="mt-1 text-xs text-slate-500">Delivering to {result.town}</p>}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return <Suspense><Body /></Suspense>;
}
