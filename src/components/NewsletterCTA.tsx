"use client";
import { useState } from "react";
import Link from "next/link";
import { MailCheck, Send, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    setMsg("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "homepage" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setMsg(data.error ?? "Try again");
      return;
    }
    setState("done");
    setMsg(data.message ?? "Subscribed!");
  };

  return (
    <section className="container-x pb-14">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-ink-950 p-8 text-white md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(500px 240px at 85% 20%, rgba(0,213,255,.35), transparent)" }}
        />
        <div className="relative max-w-xl">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Get deal alerts + 10% off</h2>
          <p className="mt-2 text-sm text-blue-100">
            Flash deals sell out fast. Join 20,000+ Kenyans getting price drops first — plus TECH10 for your first order. No spam.
          </p>
          {state === "done" ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400/20 px-5 py-3 text-sm font-bold text-emerald-200">
              <MailCheck className="h-5 w-5" /> {msg} Use code <span className="tracking-widest">TECH10</span> at checkout.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-blue-200 focus:border-white/60"
              />
              <button disabled={state === "busy"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink-950 hover:bg-slate-100 disabled:opacity-60">
                {state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Notify me
              </button>
            </form>
          )}
          {state === "error" && <p className="mt-2 text-xs font-bold text-red-300">{msg}</p>}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "254715135141"}?text=${encodeURIComponent("Hi! Add me to PhoneLaptops deal alerts.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:brightness-110"
            >
              <WhatsAppIcon className="h-4 w-4" /> Join on WhatsApp
            </a>
            <Link href="/deals" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
              Browse today's deals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
