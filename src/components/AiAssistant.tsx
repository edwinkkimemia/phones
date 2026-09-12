"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { kes } from "@/lib/utils";

interface ApiProduct {
  slug: string; category: string; name: string; brand: string;
  price: number; compareAtPrice?: number | null; rating: number; image: string; url: string;
}

interface Msg {
  role: "user" | "ai";
  content: string;
  products?: ApiProduct[];
}

const QUICK = ["Gaming laptop under 150k", "Best student laptop", "iPhone under 60k", "Delivery info"];

function renderBold(text: string) {
  // minimal **bold** renderer (no dependency)
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : <span key={i}>{part}</span>
  );
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", content: "Hi! I'm your tech advisor. 🛒 Tell me your budget + need — e.g. “gaming laptop under 150k” or “best camera phone”." },
  ]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Hide on admin + checkout (focus mode there).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const p = window.location.pathname;
    setHidden(p.startsWith("/admin") || p.startsWith("/checkout"));
  }, [open ]);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: message }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: next.slice(-8).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
        }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "ai", content: data.reply ?? "Sorry — try again.", products: data.products ?? [] }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", content: "Network hiccup — ask me again, or WhatsApp us on 0715 135 141." }]);
    } finally {
      setBusy(false);
    }
  };

  if (hidden) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask the AI shopping assistant"
          className="fixed bottom-20 left-4 z-50 grid place-items-center rounded-full bg-gradient-to-br from-brand-600 to-accent p-4 text-white shadow-pop transition hover:scale-105 md:bottom-6 md:left-6"
        >
          <Sparkles className="h-6 w-6" />
          <span className="absolute -top-1 left-12 hidden whitespace-nowrap rounded-full bg-ink-950 px-3 py-1.5 text-xs font-bold text-white md:block">
            Ask AI ✨
          </span>
        </button>
      )}
      {open && (
        <div className="fixed inset-x-3 bottom-[4.5rem] z-[95] flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-pop sm:left-6 sm:right-auto sm:w-[380px] md:bottom-24">
          <div className="flex items-center gap-2.5 bg-ink-950 p-4 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-extrabold">Tech Advisor AI</p>
              <p className="text-[11px] text-slate-400">Replies instantly • knows our stock</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {m.role === "ai" ? renderBold(m.content) : m.content}
                </div>
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.products.map((p) => (
                      <Link key={p.slug} href={p.url} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 p-2 transition hover:border-brand-300 hover:shadow-card">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                          {p.image && <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-slate-800">{p.name}</span>
                          <span className="text-xs font-extrabold text-brand-700">{kes(p.price)}</span>
                          <span className="ml-1.5 text-[11px] text-amber-500">★ {p.rating.toFixed(1)}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <p className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…</p>}
            <div ref={bottom} />
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} className="chip hover:border-brand-300 hover:bg-brand-50">
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask: budget + need…"
                className="input !py-2.5"
              />
              <button disabled={busy} className="btn-primary shrink-0 !px-4 !py-2.5" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
