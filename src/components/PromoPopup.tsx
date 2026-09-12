"use client";
import { useEffect, useState } from "react";
import { X, BadgePercent, MailCheck } from "lucide-react";

// First-order discount popup: email capture → reveals TECH10.
// Session-gated, skips checkout/cart/admin.
export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (path.startsWith("/admin") || path.startsWith("/checkout") || path.startsWith("/cart")) return;
    if (sessionStorage.getItem("pl-promo-seen")) return;
    const t = window.setTimeout(() => {
      setShow(true);
      sessionStorage.setItem("pl-promo-seen", "1");
    }, 22000);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "popup" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error ?? "Try again");
      return;
    }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/70 p-4 backdrop-blur-sm" role="dialog" aria-label="Discount offer">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 text-center shadow-pop">
        <button onClick={() => setShow(false)} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
          <X className="h-4 w-4" />
        </button>
        {!done ? (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent text-white">
              <BadgePercent className="h-7 w-7" />
            </span>
            <p className="font-display mt-4 text-2xl font-extrabold">Get 10% OFF your first order</p>
            <p className="mt-1.5 text-sm text-slate-500">
              Join 20,000+ smart shoppers. Drop your email for the code + weekly deal alerts. No spam.
            </p>
            <form onSubmit={submit} className="mt-5 flex gap-2">
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <button className="btn-primary shrink-0 !py-2.5 text-sm">Claim</button>
            </form>
            {err && <p className="mt-2 text-xs font-bold text-red-600">{err}</p>}
            <button onClick={() => setShow(false)} className="mt-3 text-xs font-semibold text-slate-400 hover:text-slate-600">
              No thanks, I pay full price
            </button>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <MailCheck className="h-7 w-7" />
            </span>
            <p className="font-display mt-4 text-2xl font-extrabold">You're in! 🎉</p>
            <p className="mt-1.5 text-sm text-slate-500">Use this code at checkout:</p>
            <p className="mx-auto mt-3 w-fit rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 px-6 py-3 font-display text-2xl font-extrabold tracking-widest text-brand-700">
              TECH10
            </p>
            <button onClick={() => setShow(false)} className="btn-primary mt-5 w-full">Start shopping</button>
          </>
        )}
      </div>
    </div>
  );
}
