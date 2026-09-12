"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Smartphone, Lock, Loader2 } from "lucide-react";
import { useCart } from "@/lib/store";
import { getProduct } from "@/data/catalog";
import { kes } from "@/lib/checkout-utils";
import { toast } from "@/components/toast";

const ZONES = [
  { town: "Nairobi CBD & environs", fee: 250 },
  { town: "Westlands / Kilimani / Karen", fee: 300 },
  { town: "Thika", fee: 350 },
  { town: "Nakuru / Eldoret", fee: 400 },
  { town: "Mombasa / Kisumu", fee: 450 },
  { town: "Other towns", fee: 500 },
];

function CheckoutBody() {
  const router = useRouter();
  const sp = useSearchParams();
  const cart = useCart();

  // Buy-Now single item support: /checkout?buy=slug&qty=2
  const buySlug = sp.get("buy");
  const buyQty = Math.max(1, Number(sp.get("qty") ?? 1));
  const buyProduct = buySlug ? getProduct(buySlug) : undefined;

  const items = useMemo(() => {
    if (buyProduct) {
      return [{
        productId: buyProduct.id, slug: buyProduct.slug, name: buyProduct.name,
        brand: buyProduct.brand, image: buyProduct.images[0]?.url ?? "",
        price: buyProduct.price, qty: buyQty,
      }];
    }
    return cart.items;
  }, [buyProduct, buyQty, cart.items]);

  const [form, setForm] = useState({ name: "", phone: "", email: "", town: ZONES[0].town, address: "", landmark: "", method: "MPESA" as "MPESA" | "CARD" | "PAY_ON_DELIVERY", promo: "" });
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [placing, setPlacing] = useState(false);

  const zone = ZONES.find((z) => z.town === form.town) ?? ZONES[0];
  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = sub + zone.fee - promoDiscount;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyPromo = async () => {
    setPromoMsg("");
    if (!form.promo.trim()) return;
    try {
      const res = await fetch(`/api/promo/validate?code=${encodeURIComponent(form.promo.trim())}&subtotal=${sub}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      setPromoDiscount(data.discount);
      setPromoMsg(`Code applied — you save ${kes(data.discount)}`);
      toast("Promo applied", `You save ${kes(data.discount)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code";
      setPromoDiscount(0);
      setPromoMsg(msg);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast("Cart is empty", "Add something first.");
    if (form.name.trim().length < 3) return toast("Enter your full name");
    if (!/^(\+?254|0)[17]\d{8}$/.test(form.phone.replace(/\s+/g, ""))) return toast("Enter a valid phone number", "e.g. 0712 345 678");
    if (!form.address.trim()) return toast("Enter delivery address / landmark");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.name, phone: form.phone, email: form.email, town: form.town, address: form.address, landmark: form.landmark },
          items: items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price, variantLabel: (i as { variantLabel?: string }).variantLabel })),
          paymentMethod: form.method,
          deliveryFee: zone.fee,
          promoCode: form.promo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");
      if (!buyProduct) cart.clear();
      router.push(`/order-confirmation?order=${data.orderNumber}`);
    } catch (err: unknown) {
      toast("Order failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="section-title">Checkout</h1>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" /> Secure checkout • M-Pesa first • No account needed</p>
      <form onSubmit={placeOrder} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="card p-5">
            <p className="font-extrabold">1. Delivery details</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><label className="label">Full name *</label><input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Brian Otieno" required /></div>
              <div><label className="label">Phone (M-Pesa) *</label><input className="input" value={form.phone} onChange={set("phone")} placeholder="0712 345 678" inputMode="tel" required /></div>
              <div><label className="label">Email (receipt)</label><input className="input" value={form.email} onChange={set("email")} placeholder="you@example.com" type="email" /></div>
              <div><label className="label">Delivery town *</label>
                <select className="input" value={form.town} onChange={set("town")}>
                  {ZONES.map((z) => <option key={z.town} value={z.town}>{z.town} — {kes(z.fee)}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className="label">Address / street *</label><input className="input" value={form.address} onChange={set("address")} placeholder="Building, street, estate" required /></div>
              <div className="sm:col-span-2"><label className="label">Landmark / notes</label><input className="input" value={form.landmark} onChange={set("landmark")} placeholder="Opposite…, near…, call on arrival" /></div>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-extrabold">2. Payment</p>
            <div className="mt-3 grid gap-2">
              {([
                { k: "MPESA", t: "M-Pesa (STK Push)", d: "Prompt sent to your phone. Enter PIN to pay.", badge: "RECOMMENDED" },
                { k: "CARD", t: "Card", d: "Visa / Mastercard via secure gateway.", badge: "" },
                { k: "PAY_ON_DELIVERY", t: "Pay on Delivery", d: "Cash or M-Pesa when your order arrives (selected zones).", badge: "" },
              ] as const).map((m) => (
                <label key={m.k} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3.5 transition ${form.method === m.k ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200"}`}>
                  <input type="radio" name="method" checked={form.method === m.k} onChange={() => setForm((f) => ({ ...f, method: m.k }))} className="mt-1 h-4 w-4 accent-emerald-600" />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-extrabold">
                      {m.k === "MPESA" && <Smartphone className="h-4 w-4 text-emerald-600" />} {m.t}
                      {m.badge && <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">{m.badge}</span>}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{m.d}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="font-extrabold">3. Promo code <span className="font-medium text-slate-400">(optional)</span></p>
            <div className="mt-3 flex gap-2">
              <input className="input uppercase" value={form.promo} onChange={set("promo")} placeholder="e.g. TECH10" />
              <button type="button" onClick={applyPromo} className="btn-ghost shrink-0 !py-2.5 text-xs">Apply</button>
            </div>
            {promoMsg && <p className="mt-2 text-xs font-semibold text-emerald-700">{promoMsg}</p>}
          </div>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-36">
          <p className="font-extrabold">Order summary</p>
          <div className="mt-3 max-h-64 space-y-2.5 overflow-auto">
            {items.map((i) => (
              <div key={i.productId} className="flex gap-2.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                  <Image src={i.image} alt={i.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-bold">{i.name}</p>
                  <p className="text-[11px] text-slate-500">Qty {i.qty} • {kes(i.price)}</p>
                </div>
                <p className="text-xs font-extrabold">{kes(i.price * i.qty)}</p>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-bold">{kes(sub)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Delivery ({zone.town})</dt><dd className="font-bold">{kes(zone.fee)}</dd></div>
            {promoDiscount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd className="font-bold">−{kes(promoDiscount)}</dd></div>}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-lg"><dt className="font-extrabold">Total</dt><dd className="font-extrabold">{kes(total)}</dd></div>
          </dl>
          <button type="submit" disabled={placing || items.length === 0} className="btn-primary mt-4 w-full !py-4 !text-base disabled:opacity-60">
            {placing ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing order…</> : <>PLACE ORDER — {kes(total)}</>}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">By ordering you agree to our Terms. Warranty & returns apply.</p>
          <Link href="/cart" className="mt-2 block text-center text-xs font-bold text-brand-700">← Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutBody />
    </Suspense>
  );
}
