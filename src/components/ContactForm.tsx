"use client";
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { WHATSAPP_NUMBER } from "@/lib/utils";
import { toast } from "@/components/toast";

const TOPICS = ["Order help", "Product question", "Repair / fitting", "Warranty claim", "Something else"] as const;

// Contact form → hands the composed message to WhatsApp (fastest response
// channel) with a mailto fallback. No backend needed; nothing to spam.
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", topic: TOPICS[0] as string, message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.name.trim().length < 2) {
      setErr("Please tell us your name.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 9) {
      setErr("Please enter a valid phone number so we can reply.");
      return;
    }
    if (form.message.trim().length < 10) {
      setErr("Please describe your issue in a few words (10+ characters).");
      return;
    }
    setBusy(true);
    const text =
      `Hello PhoneLaptops! (${form.topic})\n` +
      `Name: ${form.name.trim()}\n` +
      `Phone: ${form.phone.trim()}\n` +
      `Message: ${form.message.trim()}`;
    try {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      toast("Opening WhatsApp…", "Your message is ready to send — just press send.");
    } catch {
      setErr("Couldn't open WhatsApp — call or email us instead.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-5 md:p-6">
      <p className="font-extrabold">Send us a message</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="cf-name">Your name *</label>
          <input
            id="cf-name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Wanjiku"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label" htmlFor="cf-phone">Phone (for our reply) *</label>
          <input
            id="cf-phone"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0712 345 678"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="cf-topic">Topic</label>
        <select
          id="cf-topic"
          className="input"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="cf-message">Message *</label>
        <textarea
          id="cf-message"
          className="input min-h-[110px]"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="e.g. My order PL-20260101-1234 shows paid but not dispatched…"
        />
      </div>
      {err && <p className="text-xs font-bold text-red-600">{err}</p>}
      <button disabled={busy} className="btn-whatsapp w-full !py-3.5">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <WhatsAppIcon className="h-4 w-4" />}
        {busy ? "Opening…" : "Send via WhatsApp"}
      </button>
      <p className="text-center text-[11px] text-slate-400">
        Fastest reply (minutes, 8am–8pm). Prefer email?{" "}
        <a href="mailto:support@phonelaptops.co.ke" className="inline-flex items-center gap-1 font-bold text-brand-700">
          <Send className="h-3 w-3" /> support@phonelaptops.co.ke
        </a>
      </p>
    </form>
  );
}
