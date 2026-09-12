"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store";
import { kes } from "@/lib/utils";

const DELIVERY_PREVIEW = 350;

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const sub = subtotal();
  const total = sub + (sub > 0 ? DELIVERY_PREVIEW : 0);

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="section-title mt-4">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Great tech is one click away.</p>
        <Link href="/deals" className="btn-primary mt-6">Continue Shopping <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="section-title">Your Cart</h1>
      <p className="mt-1 text-sm text-slate-500">{items.length} item(s)</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((i) => (
            <div key={`${i.productId}::${i.variantLabel ?? ""}`} className="card flex gap-3 p-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                <Image src={i.image} alt={i.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{i.brand}</p>
                <Link href={`/product/${i.slug}`} className="line-clamp-2 text-sm font-bold hover:text-brand-700">{i.name}</Link>
                {i.variantLabel && <p className="mt-0.5 text-xs text-slate-500">{i.variantLabel}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border border-slate-200">
                    <button onClick={() => setQty(i.productId, i.qty - 1, i.variantLabel)} className="grid h-8 w-8 place-items-center" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-7 text-center text-sm font-extrabold">{i.qty}</span>
                    <button onClick={() => setQty(i.productId, i.qty + 1, i.variantLabel)} className="grid h-8 w-8 place-items-center" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="text-sm font-extrabold">{kes(i.price * i.qty)}</p>
                </div>
              </div>
              <button onClick={() => remove(i.productId, i.variantLabel)} className="self-start rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Link href="/deals" className="inline-flex text-sm font-bold text-brand-700">← Continue Shopping</Link>
        </div>
        <aside className="card h-fit p-5 lg:sticky lg:top-36">
          <p className="font-extrabold">Order Summary</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-bold">{kes(sub)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Delivery (est.)</dt><dd className="font-bold">{kes(DELIVERY_PREVIEW)}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{kes(total)}</dd></div>
          </dl>
          <p className="mt-2 text-[11px] text-slate-400">Exact delivery fee confirmed at checkout by zone.</p>
          <Link href="/checkout" className="btn-primary mt-4 w-full !py-3.5">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Link>
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold">
            <span className="rounded-lg bg-emerald-50 py-2 text-emerald-800">M-Pesa</span>
            <span className="rounded-lg bg-slate-100 py-2 text-slate-600">Card</span>
            <span className="rounded-lg bg-slate-100 py-2 text-slate-600">PoD</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
